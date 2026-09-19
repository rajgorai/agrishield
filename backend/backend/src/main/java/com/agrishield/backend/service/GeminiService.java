package com.agrishield.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;
    private String activeModelName = "gemini-3.6-flash"; // Safe fallback
    private final String modelsUrl = "https://generativelanguage.googleapis.com/v1/models";

    public GeminiService(@Value("${spring.ai.google.gemini.api-key}") String apiKey) {
        this.apiKey = apiKey;
    }

    @PostConstruct
    public void init() {
        try {
            System.out.println("🚀 [Gemini] Fetching available models to find the latest Flash...");
            String url = modelsUrl + "?key=" + apiKey;
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    Map.class
            );

            if (response.getBody() != null && response.getBody().containsKey("models")) {
                List<Map<String, Object>> models = (List<Map<String, Object>>) response.getBody().get("models");

                // Find all Flash models that support generateContent
                List<String> flashCandidates = models.stream()
                        .filter(m -> {
                            String name = (String) m.get("name");
                            if (name == null || !name.contains("flash")) return false;
                            List<String> methods = (List<String>) m.get("supportedGenerationMethods");
                            return methods != null && methods.contains("generateContent");
                        })
                        .map(m -> (String) m.get("name"))
                        .collect(Collectors.toList());

                System.out.println("📋 [Gemini] Found Flash candidates: " + flashCandidates);

                // Sort by version (highest first)
                Pattern versionPattern = Pattern.compile("gemini-(\\d+\\.\\d+)-flash");
                flashCandidates.sort((a, b) -> {
                    Matcher ma = versionPattern.matcher(a);
                    Matcher mb = versionPattern.matcher(b);
                    if (!ma.find() || !mb.find()) return 0;
                    double va = Double.parseDouble(ma.group(1));
                    double vb = Double.parseDouble(mb.group(1));
                    return Double.compare(vb, va); // Descending
                });

                // Test each candidate to find the first working one
                String workingModel = null;
                for (String candidate : flashCandidates) {
                    String modelName = candidate.replace("models/", "");
                    if (testModel(modelName)) {
                        workingModel = modelName;
                        System.out.println("✅ [Gemini] Verified working model: " + workingModel);
                        break;
                    }
                }

                if (workingModel != null) {
                    activeModelName = workingModel;
                } else {
                    System.out.println("⚠️ [Gemini] No working Flash model found. Using fallback: " + activeModelName);
                }
            }
        } catch (Exception e) {
            System.out.println("⚠️ [Gemini] Could not auto-detect models. Using fallback: " + activeModelName);
            System.out.println("   Error: " + e.getMessage());
        }
    }

    private boolean testModel(String modelName) {
        try {
            String testUrl = "https://generativelanguage.googleapis.com/v1/models/" + modelName + ":generateContent?key=" + apiKey;

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", List.of(Map.of("text", "ping")));
            requestBody.put("contents", List.of(contents));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    testUrl,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false; // This model doesn't work
        }
    }

    // ===== UPDATED: askQuestion accepts conversation history =====
    public String askQuestion(String question, List<Map<String, String>> history) {
        List<String> modelsToTry = new ArrayList<>();
        modelsToTry.add(activeModelName);
        modelsToTry.add("gemini-3.6-flash");
        modelsToTry.add("gemini-3.5-flash");

        for (String model : modelsToTry) {
            try {
                String apiUrl = "https://generativelanguage.googleapis.com/v1/models/" + model + ":generateContent";

                // Build contents array: history + current question
                List<Map<String, Object>> contents = new ArrayList<>();

                if (history != null) {
                    for (Map<String, String> msg : history) {
                        String role = "user".equals(msg.get("role")) ? "user" : "model";
                        String text = msg.get("text");
                        if (text == null || text.trim().isEmpty()) continue;
                        contents.add(Map.of(
                                "role", role,
                                "parts", List.of(Map.of("text", text))
                        ));
                    }
                }

                // Add current question
                contents.add(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", question))
                ));

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("contents", contents);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

                String url = apiUrl + "?key=" + apiKey;
                ResponseEntity<Map> response = restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        requestEntity,
                        Map.class
                );

                // If response is 503 (Service Unavailable), try next model
                if (response.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE) {
                    System.out.println("⚠️ [Gemini] Model " + model + " is overloaded (503). Trying next fallback.");
                    continue;
                }

                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null && responseBody.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        if (content == null) {
                            System.out.println("⚠️ [Gemini] Model " + model + " returned null content. Trying next.");
                            continue;
                        }
                        Object partsObj = content.get("parts");
                        if (!(partsObj instanceof List)) {
                            System.out.println("⚠️ [Gemini] Model " + model + " returned no parts. Trying next.");
                            continue;
                        }
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) partsObj;
                        if (!parts.isEmpty()) {
                            return (String) parts.get(0).get("text");
                        }
                    }
                }
                System.out.println("⚠️ [Gemini] Model " + model + " returned empty response. Trying next fallback.");
            } catch (Exception e) {
                System.out.println("⚠️ [Gemini] Model " + model + " failed with error: " + e.getMessage() + ". Trying next.");
            }
        }

        return "I'm having trouble connecting to the AI right now. All models are currently unavailable. Please try again later.";
    }

    // ===== MULTIMODAL: Text + Image =====
    public String askWithImage(String question, byte[] imageBytes, String mimeType) {
        List<String> modelsToTry = new ArrayList<>();
        modelsToTry.add(activeModelName);
        modelsToTry.add("gemini-3.6-flash");
        modelsToTry.add("gemini-3.5-flash");

        for (String model : modelsToTry) {
            try {
                String apiUrl = "https://generativelanguage.googleapis.com/v1/models/"
                        + model + ":generateContent?key=" + apiKey;

                // Build parts array: [text, image]
                List<Map<String, Object>> parts = new ArrayList<>();

                String prompt = (question == null || question.trim().isEmpty())
                        ? "Please analyze this crop leaf image. Identify the crop, any disease you see, severity, and recommend a treatment. Be concise and practical."
                        : question;

                parts.add(Map.of("text", prompt));

                // Encode image as base64
                String base64Image = Base64.getEncoder().encodeToString(imageBytes);

                Map<String, Object> inlineData = new HashMap<>();
                inlineData.put("mime_type",
                        (mimeType != null && mimeType.startsWith("image/")) ? mimeType : "image/jpeg");
                inlineData.put("data", base64Image);

                Map<String, Object> imagePart = new HashMap<>();
                imagePart.put("inline_data", inlineData);
                parts.add(imagePart);

                // Wrap in contents
                Map<String, Object> contents = new HashMap<>();
                contents.put("parts", parts);

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("contents", List.of(contents));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<Map> response = restTemplate.exchange(
                        apiUrl,
                        HttpMethod.POST,
                        requestEntity,
                        Map.class
                );

                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null && responseBody.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        if (content == null) {
                            System.out.println("⚠️ [Gemini Vision] Model " + model + " returned null content. Trying next.");
                            continue;
                        }
                        Object respPartsObj = content.get("parts");
                        if (!(respPartsObj instanceof List)) {
                            System.out.println("⚠️ [Gemini Vision] Model " + model + " returned no parts. Trying next.");
                            continue;
                        }
                        List<Map<String, Object>> respParts = (List<Map<String, Object>>) respPartsObj;
                        if (!respParts.isEmpty()) {
                            return (String) respParts.get(0).get("text");
                        }
                    }
                }

                System.out.println("⚠️ [Gemini Vision] Model " + model + " returned empty response. Trying next.");
            } catch (Exception e) {
                System.out.println("⚠️ [Gemini Vision] Model " + model + " failed: " + e.getMessage());
            }
        }

        return "I could not analyze this image right now. Please try again.";
    }

    // ===== GATEKEEPER: Is this image a plant leaf? =====
    public boolean isPlantLeaf(byte[] imageBytes, String mimeType) {
        List<String> modelsToTry = new ArrayList<>();
        modelsToTry.add(activeModelName);
        modelsToTry.add("gemini-3.6-flash");
        modelsToTry.add("gemini-3.5-flash");

        // Strict, deterministic prompt
        String prompt =
                "You are an image classifier. Your ONLY job is to say whether the image shows a real plant leaf.\n\n" +
                        "Answer with EXACTLY one word: YES or NO.\n\n" +
                        "Answer YES if the image clearly shows:\n" +
                        "- A single plant leaf (healthy or diseased)\n" +
                        "- Any leaf colour: green, yellow, brown, black spots, wilted\n" +
                        "- Close-up photos of leaves on any background\n\n" +
                        "Answer NO if the image shows:\n" +
                        "- A person, face, body part, or selfie\n" +
                        "- An animal, insect, or object\n" +
                        "- A wall, floor, sky, screen, or drawing\n" +
                        "- An image that is too dark, blurry, or ambiguous to identify a leaf\n\n" +
                        "If you are not sure, answer NO. Do NOT explain. Just YES or NO.";

        for (String model : modelsToTry) {
            try {
                String apiUrl = "https://generativelanguage.googleapis.com/v1/models/"
                        + model + ":generateContent?key=" + apiKey;

                List<Map<String, Object>> parts = new ArrayList<>();
                parts.add(Map.of("text", prompt));

                String base64 = Base64.getEncoder().encodeToString(imageBytes);
                Map<String, Object> inlineData = new HashMap<>();
                inlineData.put("mime_type",
                        (mimeType != null && mimeType.startsWith("image/")) ? mimeType : "image/jpeg");
                inlineData.put("data", base64);

                Map<String, Object> imagePart = new HashMap<>();
                imagePart.put("inline_data", inlineData);
                parts.add(imagePart);

                Map<String, Object> contents = new HashMap<>();
                contents.put("parts", parts);

                // KEY: temperature 0 for deterministic output
                Map<String, Object> generationConfig = new HashMap<>();
                generationConfig.put("temperature", 0.0);
                generationConfig.put("topP", 1.0);
                generationConfig.put("maxOutputTokens", 5);

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("contents", List.of(contents));
                requestBody.put("generationConfig", generationConfig);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<Map> response = restTemplate.exchange(
                        apiUrl, HttpMethod.POST, requestEntity, Map.class);

                Map<String, Object> body = response.getBody();
                if (body != null && body.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        if (content == null) {
                            System.out.println("⚠️ [Gatekeeper] " + model + " returned null content (safety filter?). Trying next.");
                            continue;
                        }

                        Object partsObj = content.get("parts");
                        if (!(partsObj instanceof List)) {
                            System.out.println("⚠️ [Gatekeeper] " + model + " returned no parts (safety filter?). Trying next.");
                            continue;
                        }

                        List<Map<String, Object>> respParts = (List<Map<String, Object>>) partsObj;
                        if (!respParts.isEmpty()) {
                            String answer = ((String) respParts.get(0).get("text")).trim().toUpperCase();
                            System.out.println("🍃 [Gatekeeper] Gemini raw response: '" + answer + "'");

                            // Strict parsing — must START with YES, else reject
                            boolean isLeaf = answer.startsWith("YES");
                            System.out.println("🍃 [Gatekeeper] Decision: " + (isLeaf ? "LEAF ✅" : "NOT LEAF ❌"));
                            return isLeaf;
                        }
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ [Gatekeeper] " + model + " failed: " + e.getMessage());
            }
        }

        // Fail-open: if Gemini is entirely unreachable, allow through
        System.out.println("⚠️ [Gatekeeper] All Gemini models failed — allowing through (fail-open)");
        return true;
    }
}