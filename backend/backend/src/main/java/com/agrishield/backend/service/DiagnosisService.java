package com.agrishield.backend.service;

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

    public DiagnosisService(ImageStorageService imageStorageService,
                            DiseaseRepository diseaseRepository,
                            DiagnosisRepository diagnosisRepository) {
        this.imageStorageService = imageStorageService;
        this.diseaseRepository = diseaseRepository;
        this.diagnosisRepository = diagnosisRepository;
    }

    public Map<String, Object> diagnose(MultipartFile image, String diseaseLabel, UUID userId, String language) throws Exception {
        // 1. Upload image to MinIO
        String imageUrl = imageStorageService.uploadImage(image);

        // 2. Find disease in database
        Disease disease = diseaseRepository.findByModelClassLabel(diseaseLabel)
                .orElseThrow(() -> new RuntimeException("Disease not found: " + diseaseLabel));

        // 3. Create and save diagnosis record
        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setUserId(userId);
        diagnosis.setDiseaseId(disease.getId());
        diagnosis.setImageUrl(imageUrl);
        diagnosis.setConfidenceScore(0.95); // Mock score for now (AI will replace this)
        diagnosis.setLanguageUsed(language);

        // ✅ NEW: Set top3 predictions as a JSON object (mock data)
        diagnosis.setTop3Predictions(Map.of(
                "top1", Map.of("label", diseaseLabel, "confidence", 0.95),
                "top2", Map.of("label", "Mock_Disease_2", "confidence", 0.03),
                "top3", Map.of("label", "Mock_Disease_3", "confidence", 0.02)
        ));

        diagnosisRepository.save(diagnosis);

        // 4. Build response
        Map<String, Object> response = new HashMap<>();
        response.put("diagnosisId", diagnosis.getId().toString());
        response.put("diseaseName", getDiseaseNameByLanguage(disease, language));
        response.put("cropName", disease.getCropName());
        response.put("severity", disease.getSeverity());
        response.put("confidence", diagnosis.getConfidenceScore());
        response.put("treatment", getTreatmentByLanguage(disease, language));
        response.put("imageUrl", imageUrl);

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
}