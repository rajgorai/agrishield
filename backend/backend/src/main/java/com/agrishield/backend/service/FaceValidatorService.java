package com.agrishield.backend.service;

import nu.pattern.OpenCV;
import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.core.MatOfRect;
import org.opencv.core.Rect;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.objdetect.CascadeClassifier;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.file.Files;

@Service
public class FaceValidatorService {

    private CascadeClassifier faceDetector;

    @PostConstruct
    public void init() {
        try {
            System.out.println("⏳ [FaceValidator] Loading OpenCV...");
            OpenCV.loadLocally();

            InputStream is = getClass().getClassLoader()
                    .getResourceAsStream("haarcascade_frontalface_alt.xml");

            if (is == null) {
                System.err.println("❌ [FaceValidator] haarcascade XML not found in resources!");
                return;
            }

            File tempFile = Files.createTempFile("haarcascade_", ".xml").toFile();
            tempFile.deleteOnExit();

            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
            }
            is.close();

            faceDetector = new CascadeClassifier(tempFile.getAbsolutePath());
            if (faceDetector.empty()) {
                System.err.println("❌ [FaceValidator] Failed to load cascade classifier");
                faceDetector = null;
            } else {
                System.out.println("✅ [FaceValidator] OpenCV ready");
            }
        } catch (Exception e) {
            System.err.println("❌ [FaceValidator] Init failed: " + e.getMessage());
            faceDetector = null;
        }
    }

    /**
     * Returns true if a face is detected in the image.
     * Fails-open: if the detector is not loaded, returns false (allow through).
     */
    public boolean containsFace(byte[] imageBytes) {
        if (faceDetector == null) {
            System.out.println("⚠️ [FaceValidator] Detector not loaded — skipping check");
            return false;
        }

        try {
            Mat image = Imgcodecs.imdecode(new MatOfByte(imageBytes), Imgcodecs.IMREAD_COLOR);

            if (image.empty()) {
                System.out.println("⚠️ [FaceValidator] Could not decode image");
                return false;
            }

            MatOfRect faces = new MatOfRect();
            faceDetector.detectMultiScale(
                    image,
                    faces,
                    1.1,                               // scale factor
                    4,                                 // min neighbors
                    0,                                 // flags
                    new Size(50, 50),                  // min size
                    new Size()                         // max size (default)
            );

            Rect[] detected = faces.toArray();
            System.out.println("👤 [FaceValidator] Faces detected: " + detected.length);
            return detected.length > 0;

        } catch (Exception e) {
            System.out.println("⚠️ [FaceValidator] Detection failed: " + e.getMessage());
            return false;
        }
    }
}