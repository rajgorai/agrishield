package com.agrishield.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Service
public class AudioService {

    private final RestTemplate restTemplate;
    private final String mlServiceUrl;
    private final ImageStorageService imageStorageService;

    public AudioService(RestTemplate restTemplate,
                        @Value("${ml.service.url}") String mlServiceUrl,
                        ImageStorageService imageStorageService) {
        this.restTemplate = restTemplate;
        this.mlServiceUrl = mlServiceUrl;
        this.imageStorageService = imageStorageService;
    }

    public String generateAndStoreAudio(String text, String language) throws Exception {
        System.out.println("🔊 [AudioService] Starting audio generation...");
        System.out.println("🔊 [AudioService] Text: " + text);
        System.out.println("🔊 [AudioService] Language: " + language);

        // 1. Build request to Python audio endpoint
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> requestBody = Map.of(
                "text", text,
                "language", language
        );

        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);
        String url = mlServiceUrl + "/ml/audio";

        System.out.println("🔊 [AudioService] Calling Python: " + url);

        // 2. Call Python and get MP3 bytes
        byte[] audioBytes = restTemplate.postForObject(url, requestEntity, byte[].class);

        if (audioBytes == null || audioBytes.length == 0) {
            System.out.println("❌ [AudioService] No audio data received!");
            throw new RuntimeException("No audio data received from ML service");
        }

        System.out.println("🔊 [AudioService] Received " + audioBytes.length + " bytes from Python");

        // 3. Generate unique filename and upload to MinIO
        String fileName = "audio-" + UUID.randomUUID() + ".mp3";
        System.out.println("🔊 [AudioService] Uploading to MinIO: " + fileName);

        String audioUrl = imageStorageService.uploadBytes(audioBytes, fileName, "audio/mpeg");

        System.out.println("✅ [AudioService] Audio uploaded successfully!");
        System.out.println("✅ [AudioService] Audio URL: " + audioUrl);

        return audioUrl;
    }
}