package com.agrishield.backend.service;

import com.agrishield.backend.dto.MLPrediction;
import com.agrishield.backend.entity.Diagnosis;
import com.agrishield.backend.entity.Disease;
import com.agrishield.backend.repository.DiagnosisRepository;
import com.agrishield.backend.repository.DiseaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class DiagnosisService {

    private final ImageStorageService imageStorageService;
    private final DiseaseRepository diseaseRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final MLClientService mlClientService;
    private final AudioService audioService;
    private final GeminiService geminiService;
    private final FaceValidatorService faceValidatorService;

    public DiagnosisService(ImageStorageService imageStorageService,
                            DiseaseRepository diseaseRepository,
                            DiagnosisRepository diagnosisRepository,
                            MLClientService mlClientService,
                            AudioService audioService,
                            GeminiService geminiService,
                            FaceValidatorService faceValidatorService) {
        this.imageStorageService = imageStorageService;
        this.diseaseRepository = diseaseRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.mlClientService = mlClientService;
        this.audioService = audioService;
        this.geminiService = geminiService;
        this.faceValidatorService = faceValidatorService;
    }

    public Map<String, Object> diagnose(MultipartFile image, UUID userId, String language, String model) throws Exception {

        // 0. Validate model — accept R, J, S1, S2
        if (model == null ||
                (!model.equalsIgnoreCase("R") && !model.equalsIgnoreCase("J")
                        && !model.equalsIgnoreCase("S1") && !model.equalsIgnoreCase("S2"))) {
            model = "J";
        }
        model = model.toUpperCase();

        // 1. Upload image to MinIO
        String imageUrl = imageStorageService.uploadImage(image);

        // 1.5. Local quality checks — only for S1/S2 (R and J stay fast)
        if (model.equalsIgnoreCase("S1") || model.equalsIgnoreCase("S2")) {

            // Step A: Brightness check
            if (isTooDark(image.getBytes(), 60)) {
                System.out.println("🌑 [Quality] Image rejected — too dark");
                throw new IllegalArgumentException(
                        "The image is too dark. Please take the photo in good lighting."
                );
            }

            // Step B: Face detection (rejects selfies and photos of people)
            if (faceValidatorService.containsFace(image.getBytes())) {
                System.out.println("👤 [Quality] Image rejected — face detected");
                throw new IllegalArgumentException(
                        "This looks like a photo of a person. Please upload a clear, close-up photo of a single leaf."
                );
            }

            System.out.println("✅ [Quality] Image passed local checks");
        }

        // 2. Call Python AI service (model passed per request)
        MLPrediction prediction = mlClientService.predict(image, model);
        String diseaseLabel = prediction.getTopClass();
        double confidence = prediction.getConfidence();
        int classIndex = prediction.getTopClassIndex();

        // ===== CONFIDENCE THRESHOLD CHECK =====
        double threshold;
        switch (model) {
            case "R":  threshold = 0.60; break;
            case "J":  threshold = 0.50; break;
            case "S1": threshold = 0.25; break;
            case "S2": threshold = 0.35; break;
            default:   threshold = 0.50;
        }

        if (confidence < threshold) {
            Map<String, Object> lowConfidenceResponse = new HashMap<>();
            lowConfidenceResponse.put("message", "Please upload a clear, close-up leaf photo.");
            lowConfidenceResponse.put("confidence", confidence);
            lowConfidenceResponse.put("suggestion", "The image quality is low or does not look like a diseased leaf.");
            return lowConfidenceResponse;
        }

        // 3. Find disease in database (case-insensitive)
        Disease disease = diseaseRepository.findByModelClassLabelIgnoreCase(diseaseLabel)
                .orElseThrow(() -> {
                    System.out.println("❌ [DiagnosisService] Disease not found: " + diseaseLabel);
                    return new RuntimeException("Disease not found: " + diseaseLabel);
                });

        // 4. Create and save diagnosis record
        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setUserId(userId);
        diagnosis.setDiseaseId(disease.getId());
        diagnosis.setImageUrl(imageUrl);
        diagnosis.setConfidenceScore(confidence);
        diagnosis.setLanguageUsed(language);
        diagnosis.setTop3Predictions(prediction.getTop3());

        diagnosisRepository.save(diagnosis);

        // ===== 5. Grad-CAM heatmap (only for R model) =====
        String heatmapUrl = null;
        if (model.equalsIgnoreCase("R")) {
            try {
                String heatmapBase64 = mlClientService.getGradCam(image, classIndex, model);
                String heatmapFileName = "heatmap-" + diagnosis.getId() + ".png";
                heatmapUrl = imageStorageService.uploadBase64Image(heatmapBase64, heatmapFileName);
                diagnosis.setHeatmapUrl(heatmapUrl);
                System.out.println("✅ Grad-CAM generated successfully.");
            } catch (Exception e) {
                System.out.println("⚠️ Grad-CAM failed: " + e.getMessage());
            }
        } else {
            System.out.println("ℹ️ Grad-CAM skipped (Model " + model + " does not support it).");
        }

        // 6. Generate and upload audio advisory
        String treatmentText = getTreatmentByLanguage(disease, language);
        String audioUrl = audioService.generateAndStoreAudio(treatmentText, language);
        diagnosis.setAudioUrl(audioUrl);

        diagnosisRepository.save(diagnosis);

        // 7. Build response
        Map<String, Object> response = new HashMap<>();
        response.put("diagnosisId", diagnosis.getId().toString());
        response.put("diseaseName", getDiseaseNameByLanguage(disease, language));
        response.put("cropName", disease.getCropName());
        response.put("severity", disease.getSeverity());
        response.put("confidence", confidence);
        response.put("treatment", treatmentText);
        response.put("imageUrl", imageUrl);
        response.put("heatmapUrl", heatmapUrl);
        response.put("audioUrl", audioUrl);
        response.put("top3", prediction.getTop3());
        response.put("modelUsed", model);

        return response;
    }

    private String getDiseaseNameByLanguage(Disease disease, String language) {
        switch (language.toLowerCase()) {
            case "bn": return disease.getDiseaseNameBn();
            case "hi": return disease.getDiseaseNameHi();
            default: return disease.getDiseaseNameEn();
        }
    }

    private String getTreatmentByLanguage(Disease disease, String language) {
        switch (language.toLowerCase()) {
            case "bn": return disease.getTreatmentBn();
            case "hi": return disease.getTreatmentHi();
            default: return disease.getTreatmentEn();
        }
    }

    // ===== Image quality: reject very dark images =====
    private boolean isTooDark(byte[] imageBytes, int threshold) {
        try {
            java.awt.image.BufferedImage img = javax.imageio.ImageIO.read(
                    new java.io.ByteArrayInputStream(imageBytes)
            );
            if (img == null) return true;

            long sum = 0;
            long count = 0;
            int step = Math.max(1, img.getWidth() / 100);

            for (int y = 0; y < img.getHeight(); y += step) {
                for (int x = 0; x < img.getWidth(); x += step) {
                    int rgb = img.getRGB(x, y);
                    int r = (rgb >> 16) & 0xFF;
                    int g = (rgb >> 8) & 0xFF;
                    int b = rgb & 0xFF;
                    int lum = (int) (0.299 * r + 0.587 * g + 0.114 * b);
                    sum += lum;
                    count++;
                }
            }

            double avg = (double) sum / count;
            System.out.println("🌑 [Quality] Average brightness: " + String.format("%.1f", avg));
            return avg < threshold;
        } catch (Exception e) {
            System.out.println("⚠️ [Quality] Brightness check failed: " + e.getMessage());
            return false;
        }
    }
}