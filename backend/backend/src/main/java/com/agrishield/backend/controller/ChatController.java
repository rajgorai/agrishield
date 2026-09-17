package com.agrishield.backend.controller;

import com.agrishield.backend.entity.ChatHistory;
import com.agrishield.backend.model.User;
import com.agrishield.backend.repository.ChatHistoryRepository;
import com.agrishield.backend.repository.UserRepository;
import com.agrishield.backend.security.JwtUtil;
import com.agrishield.backend.service.GeminiService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final GeminiService geminiService;
    private final ChatHistoryRepository chatHistoryRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public ChatController(GeminiService geminiService,
                          ChatHistoryRepository chatHistoryRepository,
                          UserRepository userRepository,
                          JwtUtil jwtUtil) {
        this.geminiService = geminiService;
        this.chatHistoryRepository = chatHistoryRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ===== POST: /api/chat/ask (Text only, with conversation history) =====
    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        try {
            String question = (String) payload.get("question");
            if (question == null || question.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Question is required"));
            }

            // Extract history (list of {role, text})
            List<Map<String, String>> history = new ArrayList<>();
            Object historyObj = payload.get("history");
            if (historyObj instanceof List) {
                for (Object item : (List<?>) historyObj) {
                    if (item instanceof Map) {
                        Map<?, ?> m = (Map<?, ?>) item;
                        String role = m.get("role") != null ? m.get("role").toString() : "user";
                        String text = m.get("text") != null ? m.get("text").toString() : "";
                        Map<String, String> entry = new HashMap<>();
                        entry.put("role", role);
                        entry.put("text", text);
                        history.add(entry);
                    }
                }
            }

            String answer = geminiService.askQuestion(question, history);

            // Save chat history (extract user from JWT if present)
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    String phone = jwtUtil.extractPhone(token);
                    User user = userRepository.findByPhone(phone).orElse(null);
                    if (user != null) {
                        ChatHistory chat = new ChatHistory();
                        chat.setUserId(user.getId());
                        chat.setQuestion(question);
                        chat.setAnswer(answer);
                        chatHistoryRepository.save(chat);
                    }
                } catch (Exception e) {
                    // Don't save if token is invalid
                }
            }

            return ResponseEntity.ok(Map.of("answer", answer));
        } catch (Exception e) {
            System.out.println("❌ [Chat] " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ===== POST: /api/chat/ask-with-image (Gemini Vision) =====
    @PostMapping("/ask-with-image")
    public ResponseEntity<?> askWithImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "question", defaultValue = "") String question,
            HttpServletRequest request) {
        try {
            String answer = geminiService.askWithImage(
                    question,
                    image.getBytes(),
                    image.getContentType()
            );

            // Save chat history (extract user from JWT if present)
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    String phone = jwtUtil.extractPhone(token);
                    User user = userRepository.findByPhone(phone).orElse(null);
                    if (user != null) {
                        ChatHistory chat = new ChatHistory();
                        chat.setUserId(user.getId());
                        chat.setQuestion(question.isEmpty() ? "[Image analysis]" : question + " [with image]");
                        chat.setAnswer(answer);
                        chatHistoryRepository.save(chat);
                    }
                } catch (Exception e) {
                    // Don't save if token is invalid
                }
            }

            return ResponseEntity.ok(Map.of("answer", answer));
        } catch (Exception e) {
            System.out.println("❌ [ChatController] askWithImage failed: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ===== GET: /api/chat/history (With Pagination) =====
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid token");
        }

        try {
            String token = authHeader.substring(7);
            String phone = jwtUtil.extractPhone(token);
            User user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<ChatHistory> historyPage = chatHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

            return ResponseEntity.ok(historyPage);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching history: " + e.getMessage());
        }
    }
}