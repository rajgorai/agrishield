package com.agrishield.backend.controller;

import com.agrishield.backend.entity.ChatHistory;
import com.agrishield.backend.model.User;
import com.agrishield.backend.repository.ChatHistoryRepository;
import com.agrishield.backend.repository.UserRepository;
import com.agrishield.backend.security.JwtUtil;
import com.agrishield.backend.service.GeminiService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/ask")
    public String askQuestion(@RequestParam String question, HttpServletRequest request) {
        String answer = geminiService.askQuestion(question);

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

        return answer;
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid token");
        }

        try {
            String token = authHeader.substring(7);
            String phone = jwtUtil.extractPhone(token);
            User user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<ChatHistory> history = chatHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching history: " + e.getMessage());
        }
    }
}