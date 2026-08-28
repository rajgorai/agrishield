package com.agrishield.backend.controller;

import com.agrishield.backend.dto.DiseaseInfoDTO;
import com.agrishield.backend.entity.Diagnosis;
import com.agrishield.backend.entity.Disease;
import com.agrishield.backend.model.User;
import com.agrishield.backend.repository.DiagnosisRepository;
import com.agrishield.backend.repository.DiseaseRepository;
import com.agrishield.backend.repository.UserRepository;
import com.agrishield.backend.security.JwtUtil;
import com.agrishield.backend.service.DiagnosisService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final DiseaseRepository diseaseRepository; // <-- ADDED

    // ===== UPDATED CONSTRUCTOR =====
    public DiagnosisController(DiagnosisService diagnosisService,
                               JwtUtil jwtUtil,
                               UserRepository userRepository,
                               DiagnosisRepository diagnosisRepository,
                               DiseaseRepository diseaseRepository) { // <-- ADDED
        this.diagnosisService = diagnosisService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.diseaseRepository = diseaseRepository; // <-- ADDED
    }

    // ===== POST: /api/diagnose =====
    @PostMapping("/diagnose")
    public ResponseEntity<?> diagnose(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "language", defaultValue = "en") String language,
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

            Map<String, Object> result = diagnosisService.diagnose(image, user.getId(), language);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Diagnosis failed: " + e.getMessage()));
        }
    }

    // ===== GET: /api/diagnoses (History) =====
    @GetMapping("/diagnoses")
    public ResponseEntity<?> getUserDiagnoses(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing token");
            }

            String token = authHeader.substring(7);
            String phone = jwtUtil.extractPhone(token);
            User user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Diagnosis> diagnoses = diagnosisRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            return ResponseEntity.ok(diagnoses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching history: " + e.getMessage());
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