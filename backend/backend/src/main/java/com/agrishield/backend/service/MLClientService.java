package com.agrishield.backend.service;

import com.agrishield.backend.dto.MLPrediction;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class MLClientService {

    private final RestTemplate restTemplate;
    private final String mlServiceUrl;
    private final ObjectMapper objectMapper;

    public MLClientService(RestTemplate restTemplate,
                           @Value("${ml.service.url}") String mlServiceUrl) {
        this.restTemplate = restTemplate;
        this.mlServiceUrl = mlServiceUrl;
        this.objectMapper = new ObjectMapper();
    }

    public MLPrediction predict(MultipartFile image) throws IOException {
        // Create multipart request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartFileResource(image));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // Call Python service
        String url = mlServiceUrl + "/ml/predict";

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            // Parse JSON response
            return objectMapper.readValue(response.getBody(), MLPrediction.class);
        } catch (Exception e) {
            throw new IOException("Failed to call ML service: " + e.getMessage(), e);
        }
    }

    // Helper class to convert MultipartFile to ByteArrayResource
    private static class MultipartFileResource extends org.springframework.core.io.ByteArrayResource {
        private final String filename;

        public MultipartFileResource(MultipartFile file) throws IOException {
            super(file.getBytes());
            this.filename = file.getOriginalFilename();
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }
}