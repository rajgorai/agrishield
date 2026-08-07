package com.agrishield.backend.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
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
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
            throw new IllegalArgumentException("Only JPG and PNG images are allowed");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        String fileName = UUID.randomUUID().toString() + ".jpg";

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(contentType)
                        .build()
        );

        return "http://localhost:9000/" + bucketName + "/" + fileName;
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
        return "http://localhost:9000/" + bucketName + "/" + fileName;
    }

    // -------- NEW: UPLOAD RAW BYTES (for audio) --------
    public String uploadBytes(byte[] data, String fileName, String contentType) throws Exception {
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(new ByteArrayInputStream(data), data.length, -1)
                        .contentType(contentType)
                        .build()
        );
        return "http://localhost:9000/" + bucketName + "/" + fileName;
    }
}