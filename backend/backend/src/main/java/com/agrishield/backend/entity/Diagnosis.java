package com.agrishield.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "diagnoses")
@Data
public class Diagnosis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID diseaseId;

    @Column(nullable = false)
    private String imageUrl;

    private String heatmapUrl;
    private String audioUrl;

    @Column(nullable = false)
    private Double confidenceScore;

    @JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private Object top3Predictions;

    @Column(nullable = false, length = 5)
    private String languageUsed = "en";

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
