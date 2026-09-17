package com.agrishield.backend.controller;

import com.agrishield.backend.dto.DiseaseInfoDTO;
import com.agrishield.backend.dto.DiagnosisHistoryItem;
import com.agrishield.backend.entity.Diagnosis;
import com.agrishield.backend.entity.Disease;
import com.agrishield.backend.model.User;
import com.agrishield.backend.repository.DiagnosisRepository;
import com.agrishield.backend.repository.DiseaseRepository;
import com.agrishield.backend.repository.UserRepository;
import com.agrishield.backend.security.JwtUtil;
import com.agrishield.backend.service.DiagnosisService;
import com.agrishield.backend.service.ImageStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final DiseaseRepository diseaseRepository;
    private final ImageStorageService imageStorageService;

    public DiagnosisController(DiagnosisService diagnosisService,
                               JwtUtil jwtUtil,
                               UserRepository userRepository,
                               DiagnosisRepository diagnosisRepository,
                               DiseaseRepository diseaseRepository,
                               ImageStorageService imageStorageService) {
        this.diagnosisService = diagnosisService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.diseaseRepository = diseaseRepository;
        this.imageStorageService = imageStorageService;
    }

    // ===== POST: /api/diagnose (upload) =====
    @PostMapping("/diagnose")
    public ResponseEntity<?> diagnose(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "language", defaultValue = "en") String language,
            @RequestParam(value = "model", defaultValue = "J") String model,
            HttpServletRequest request) {

        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
            }

            String token = authHeader.substring(7);
            String phone = jwtUtil.extractPhone(token);

            User user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> result = diagnosisService.diagnose(image, user.getId(), language, model);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Diagnosis failed: " + e.getMessage()));
        }
    }

    // ===== GET: /api/diagnoses (History list — paginated) =====
    @GetMapping("/diagnoses")
    public ResponseEntity<?> getUserDiagnoses(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing token"));
            }

            String token = authHeader.substring(7);
            String phone = jwtUtil.extractPhone(token);
            User user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Pageable pageable = PageRequest.of(page, size);
            Page<DiagnosisHistoryItem> page1 =
                    diagnosisRepository.findHistoryWithDisease(user.getId(), pageable);

            return ResponseEntity.ok(page1);

        } catch (Exception e) {
            System.out.println("❌ [History list] " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ===== GET: /api/diagnoses/{id} (single — full detail) =====
    @GetMapping("/diagnoses/{id}")
    public ResponseEntity<?> getDiagnosisById(
            @PathVariable String id,
            @RequestParam(value = "language", defaultValue = "en") String language,
            HttpServletRequest request) {

        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing token"));
            }

            String token = authHeader.substring(7);
            String phone = jwtUtil.extractPhone(token);
            User user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Diagnosis d = diagnosisRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new RuntimeException("Diagnosis not found"));

            if (!d.getUserId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }

            Disease disease = diseaseRepository.findById(d.getDiseaseId())
                    .orElseThrow(() -> new RuntimeException("Disease not found"));

            String lang = d.getLanguageUsed() != null ? d.getLanguageUsed() : language;

            String diseaseName, treatment;
            switch (lang) {
                case "bn":
                    diseaseName = disease.getDiseaseNameBn();
                    treatment   = disease.getTreatmentBn();
                    break;
                case "hi":
                    diseaseName = disease.getDiseaseNameHi();
                    treatment   = disease.getTreatmentHi();
                    break;
                default:
                    diseaseName = disease.getDiseaseNameEn();
                    treatment   = disease.getTreatmentEn();
            }

            Map<String, Object> result = new HashMap<>();
            result.put("diagnosisId", d.getId());
            result.put("imageUrl", d.getImageUrl());
            result.put("heatmapUrl", d.getHeatmapUrl());
            result.put("audioUrl", d.getAudioUrl());
            result.put("confidence", d.getConfidenceScore());
            result.put("top3", d.getTop3Predictions());
            result.put("cropName", disease.getCropName());
            result.put("diseaseName", diseaseName);
            result.put("treatment", treatment);
            result.put("severity", disease.getSeverity());
            result.put("language", lang);
            result.put("modelUsed", d.getHeatmapUrl() != null ? "R" : "J");
            result.put("createdAt", d.getCreatedAt());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.out.println("❌ [History detail] " + e.getMessage());
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // ===== DELETE: /api/diagnoses/{id} (single) =====
    @DeleteMapping("/diagnoses/{id}")
    @Transactional
    public ResponseEntity<?> deleteDiagnosis(
            @PathVariable String id,
            HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing token"));
            }

            String token = authHeader.substring(7);
            String phone = jwtUtil.extractPhone(token);
            User user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Diagnosis d = diagnosisRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new RuntimeException("Diagnosis not found"));

            if (!d.getUserId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }

            // Delete files from MinIO first
            imageStorageService.deleteFile(d.getImageUrl());
            imageStorageService.deleteFile(d.getHeatmapUrl());
            imageStorageService.deleteFile(d.getAudioUrl());

            diagnosisRepository.delete(d);
            System.out.println("🗑️ Deleted diagnosis " + id + " for user " + user.getId());

            return ResponseEntity.ok(Map.of("deleted", 1));

        } catch (Exception e) {
            System.out.println("❌ [Delete] " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ===== DELETE: /api/diagnoses (all for user) =====
    @DeleteMapping("/diagnoses")
    @Transactional
    public ResponseEntity<?> deleteAllDiagnoses(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing token"));
            }

            String token = authHeader.substring(7);
            String phone = jwtUtil.extractPhone(token);
            User user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Diagnosis> all = diagnosisRepository.findAll()
                    .stream()
                    .filter(d -> d.getUserId().equals(user.getId()))
                    .collect(Collectors.toList());

            for (Diagnosis d : all) {
                imageStorageService.deleteFile(d.getImageUrl());
                imageStorageService.deleteFile(d.getHeatmapUrl());
                imageStorageService.deleteFile(d.getAudioUrl());
            }
            diagnosisRepository.deleteAll(all);

            System.out.println("🗑️ Deleted ALL " + all.size() + " diagnoses for user " + user.getId());
            return ResponseEntity.ok(Map.of("deleted", all.size()));

        } catch (Exception e) {
            System.out.println("❌ [Delete all] " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ===== POST: /api/diagnoses/bulk-delete (selected IDs) =====
    @PostMapping("/diagnoses/bulk-delete")
    @Transactional
    public ResponseEntity<?> bulkDeleteDiagnoses(
            @RequestBody Map<String, List<String>> payload,
            HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing token"));
            }

            String token = authHeader.substring(7);
            String phone = jwtUtil.extractPhone(token);
            User user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<String> rawIds = payload.get("ids");
            if (rawIds == null || rawIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No IDs provided"));
            }

            int deleted = 0;
            for (String raw : rawIds) {
                try {
                    UUID uuid = UUID.fromString(raw);
                    Diagnosis d = diagnosisRepository.findById(uuid).orElse(null);
                    if (d == null) continue;
                    if (!d.getUserId().equals(user.getId())) continue;

                    imageStorageService.deleteFile(d.getImageUrl());
                    imageStorageService.deleteFile(d.getHeatmapUrl());
                    imageStorageService.deleteFile(d.getAudioUrl());
                    diagnosisRepository.delete(d);
                    deleted++;
                } catch (Exception ignored) {
                    // skip individual failures
                }
            }

            System.out.println("🗑️ Bulk deleted " + deleted + " diagnoses for user " + user.getId());
            return ResponseEntity.ok(Map.of("deleted", deleted));

        } catch (Exception e) {
            System.out.println("❌ [Bulk delete] " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ===== GET: /api/diseases (Public Dropdown) =====
    @GetMapping("/diseases")
    public ResponseEntity<?> getAllDiseases() {
        try {
            List<Disease> diseases = diseaseRepository.findAll();
            List<DiseaseInfoDTO> result = diseases.stream()
                    .map(d -> new DiseaseInfoDTO(
                            d.getModelClassLabel(),
                            d.getCropName(),
                            d.getDiseaseNameEn(),
                            d.getDiseaseNameBn(),
                            d.getDiseaseNameHi(),
                            d.getSeverity()
                    ))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching diseases: " + e.getMessage());
        }
    }
}