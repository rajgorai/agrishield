package com.agrishield.backend.service;

import com.agrishield.backend.dto.MLPrediction;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

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

    // -------- PREDICT (model passed per request) --------
    public MLPrediction predict(MultipartFile image, String model) throws IOException {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartFileResource(image));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String url = mlServiceUrl + "/ml/predict?model=" + model.toUpperCase();

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );
            return objectMapper.readValue(response.getBody(), MLPrediction.class);
        } catch (Exception e) {
            throw new IOException("Failed to call ML service: " + e.getMessage(), e);
        }
    }

    // -------- GRAD-CAM (model passed per request) --------
    public String getGradCam(MultipartFile image, int classIndex, String model) throws IOException {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartFileResource(image));
        body.add("class_index", String.valueOf(classIndex));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        String url = mlServiceUrl + "/ml/gradcam?model=" + model.toUpperCase();

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );
            if (response.getBody() != null && response.getBody().containsKey("heatmap_base64")) {
                return (String) response.getBody().get("heatmap_base64");
            }
            throw new RuntimeException("Grad-CAM response missing 'heatmap_base64'");
        } catch (Exception e) {
            throw new IOException("Failed to call Grad-CAM service: " + e.getMessage(), e);
        }
    }

    // switchModel() REMOVED — no longer needed (per-request model now)

    // Helper class to convert MultipartFile to ByteArrayResource
    private static class MultipartFileResource extends ByteArrayResource {
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