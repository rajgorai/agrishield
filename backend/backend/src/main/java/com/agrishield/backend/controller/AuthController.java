package com.agrishield.backend.controller;

import com.agrishield.backend.model.User;
import com.agrishield.backend.repository.UserRepository;
import com.agrishield.backend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String phone = request.get("phone");
        String password = request.get("password");

        if (name == null || phone == null || password == null) {
            return ResponseEntity.badRequest().body("Name, Phone, Password required");
        }

        if (userRepository.findByPhone(phone).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Phone number already registered");
        }

        User user = new User();
        user.setName(name);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setPreferredLanguage("en");

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("userId", user.getId().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String password = request.get("password");

        if (phone == null || password == null) {
            return ResponseEntity.badRequest().body("Phone and Password required");
        }

        User user = userRepository.findByPhone(phone).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid phone or password");
        }

        String token = jwtUtil.generateToken(user.getPhone());
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("phone", user.getPhone());
        response.put("name", user.getName());
        return ResponseEntity.ok(response);
    }
}