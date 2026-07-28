package com.agrishield.backend.controller;

import com.agrishield.backend.model.User;
import com.agrishield.backend.repository.UserRepository;
import com.agrishield.backend.security.JwtUtil;
import com.agrishield.backend.service.DiagnosisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/diagnose")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public DiagnosisController(DiagnosisService diagnosisService,
                               JwtUtil jwtUtil,
                               UserRepository userRepository) {
        this.diagnosisService = diagnosisService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    // Real diagnosis endpoint
    @PostMapping
    public ResponseEntity<?> diagnose(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "language", defaultValue = "en") String language,
            @RequestParam("diseaseLabel") String diseaseLabel,
            HttpServletRequest request) {

        try {
            // Extract JWT token from Authorization header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
            }

            String token = authHeader.substring(7);
            String phone = jwtUtil.extractPhone(token);

            // Find user by phone
            User user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Call diagnosis service
            Map<String, Object> result = diagnosisService.diagnose(image, diseaseLabel, user.getId(), language);

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Diagnosis failed: " + e.getMessage()));
        }
    }

    // Keep the test endpoint for reference (optional)
    @PostMapping("/upload-test")
    public ResponseEntity<?> testUpload(@RequestParam("image") MultipartFile file) {
        // This is the same test endpoint we already have
        // (I'll leave it here so you can still test uploads separately)
        try {
            // We need to inject ImageStorageService here if we want to keep this.
            // For simplicity, let's just redirect to the service, but since this is a test,
            // I'll comment it out and return a message.
            return ResponseEntity.ok(Map.of("message", "Use the main /api/diagnose endpoint for full flow."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}