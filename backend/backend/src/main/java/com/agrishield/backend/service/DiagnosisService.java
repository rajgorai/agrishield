package com.agrishield.backend.service;

import com.agrishield.backend.service.MLClientService;
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
    private final MLClientService mlClientService;  // NEW

    public DiagnosisService(ImageStorageService imageStorageService,
                            DiseaseRepository diseaseRepository,
                            DiagnosisRepository diagnosisRepository,
                            MLClientService mlClientService) {
        this.imageStorageService = imageStorageService;
        this.diseaseRepository = diseaseRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.mlClientService = mlClientService;  // NEW
    }

    public Map<String, Object> diagnose(MultipartFile image, UUID userId, String language) throws Exception {
        // 1. Upload image to MinIO
        String imageUrl = imageStorageService.uploadImage(image);

        // 2. Call Python AI service to get prediction (REAL AI)
        MLPrediction prediction = mlClientService.predict(image);
        String diseaseLabel = prediction.getTopClass();
        double confidence = prediction.getConfidence();

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

        // Save top3 predictions as JSON
        diagnosis.setTop3Predictions(prediction.getTop3());

        diagnosisRepository.save(diagnosis);

        // 5. Build response
        Map<String, Object> response = new HashMap<>();
        response.put("diagnosisId", diagnosis.getId().toString());
        response.put("diseaseName", getDiseaseNameByLanguage(disease, language));
        response.put("cropName", disease.getCropName());
        response.put("severity", disease.getSeverity());
        response.put("confidence", confidence);
        response.put("treatment", getTreatmentByLanguage(disease, language));
        response.put("imageUrl", imageUrl);
        response.put("top3", prediction.getTop3());

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