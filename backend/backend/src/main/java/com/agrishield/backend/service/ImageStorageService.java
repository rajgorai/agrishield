package com.agrishield.backend.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.util.UUID;

@Service
public class ImageStorageService {

    private final MinioClient minioClient;
    private final String bucketName;

    public ImageStorageService(
            @Value("${minio.url}") String minioUrl,
            @Value("${minio.access-key}") String accessKey,
            @Value("${minio.secret-key}") String secretKey,
            @Value("${minio.bucket}") String bucketName) {

        this.minioClient = MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(accessKey, secretKey)
                .build();
        this.bucketName = bucketName;
    }

    public String uploadImage(MultipartFile file) throws Exception {
        System.out.println("⚠️ File type validation bypassed. Uploading: " + file.getOriginalFilename());

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        String fileName = UUID.randomUUID().toString() + ".jpg";

        String contentType = file.getContentType();
        if (contentType == null) {
            contentType = "image/jpeg";
        }

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(contentType)
                        .build()
        );

        return "/minio/" + bucketName + "/" + fileName;
    }

    public String uploadBase64Image(String base64Data, String fileName) throws Exception {
        byte[] imageBytes = Base64.getDecoder().decode(base64Data);
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(new ByteArrayInputStream(imageBytes), imageBytes.length, -1)
                        .contentType("image/png")
                        .build()
        );
        return "/minio/" + bucketName + "/" + fileName;
    }

    public String uploadBytes(byte[] data, String fileName, String contentType) throws Exception {
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(new ByteArrayInputStream(data), data.length, -1)
                        .contentType(contentType)
                        .build()
        );
        return "/minio/" + bucketName + "/" + fileName;
    }

    // ===== NEW: Delete a file from MinIO by its relative URL =====
    public void deleteFile(String url) {
        if (url == null || url.isBlank()) return;
        try {
            String prefix = "/minio/" + bucketName + "/";
            if (!url.startsWith(prefix)) {
                System.out.println("⚠️ Skipping delete, unknown URL format: " + url);
                return;
            }
            String fileName = url.substring(prefix.length());
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .build()
            );
            System.out.println("🗑️ Deleted from MinIO: " + fileName);
        } catch (Exception e) {
            System.out.println("⚠️ Failed to delete MinIO file: " + url + " — " + e.getMessage());
        }
    }
}