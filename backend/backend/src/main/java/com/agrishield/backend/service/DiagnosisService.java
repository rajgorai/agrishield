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

    // ===== ALL FIELDS (TOP) =====
    private final ImageStorageService imageStorageService;
    private final DiseaseRepository diseaseRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final MLClientService mlClientService;
    private final AudioService audioService;

    // ===== CONSTRUCTOR =====
    public DiagnosisService(ImageStorageService imageStorageService,
                            DiseaseRepository diseaseRepository,
                            DiagnosisRepository diagnosisRepository,
                            MLClientService mlClientService,
                            AudioService audioService) {
        this.imageStorageService = imageStorageService;
        this.diseaseRepository = diseaseRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.mlClientService = mlClientService;
        this.audioService = audioService;
    }

    // ===== MAIN DIAGNOSE METHOD =====
    public Map<String, Object> diagnose(MultipartFile image, UUID userId, String language) throws Exception {
        // 1. Upload image to MinIO
        String imageUrl = imageStorageService.uploadImage(image);

        // 2. Call Python AI service to get prediction
        MLPrediction prediction = mlClientService.predict(image);
        String diseaseLabel = prediction.getTopClass();
        double confidence = prediction.getConfidence();
        int classIndex = prediction.getTopClassIndex();

        // ===== CONFIDENCE THRESHOLD CHECK (SAFETY NET) =====
        if (confidence < 0.60) {
            Map<String, Object> lowConfidenceResponse = new HashMap<>();
            lowConfidenceResponse.put("message", "Please upload a clear, close-up leaf photo.");
            lowConfidenceResponse.put("confidence", confidence);
            lowConfidenceResponse.put("suggestion", "The image quality is low or does not look like a diseased leaf.");
            return lowConfidenceResponse;
        }

        // 3. Find disease in database
        Disease disease = diseaseRepository.findByModelClassLabel(diseaseLabel)
                .orElseThrow(() -> new RuntimeException("Disease not found: " + diseaseLabel));

        // 4. Create and save diagnosis record
        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setUserId(userId);
        diagnosis.setDiseaseId(disease.getId());
        diagnosis.setImageUrl(imageUrl);
        diagnosis.setConfidenceScore(confidence);
        diagnosis.setLanguageUsed(language);
        diagnosis.setTop3Predictions(prediction.getTop3());

        diagnosisRepository.save(diagnosis);

        // ===== 5. Grad-CAM heatmap (PERMANENTLY DISABLED) =====
        // The new .keras model (88 classes) has a different internal structure
        // that breaks the gradcam.py function. We skip heatmap generation for now.
        /*
        String heatmapBase64 = mlClientService.getGradCam(image, classIndex);
        String heatmapFileName = "heatmap-" + diagnosis.getId() + ".png";
        String heatmapUrl = imageStorageService.uploadBase64Image(heatmapBase64, heatmapFileName);
        diagnosis.setHeatmapUrl(heatmapUrl);
        */
        String heatmapUrl = null;
        diagnosis.setHeatmapUrl(heatmapUrl);

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
        response.put("heatmapUrl", heatmapUrl);  // Will be null
        response.put("audioUrl", audioUrl);
        response.put("top3", prediction.getTop3());

        return response;
    }

    // ===== LANGUAGE HELPERS =====
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
}