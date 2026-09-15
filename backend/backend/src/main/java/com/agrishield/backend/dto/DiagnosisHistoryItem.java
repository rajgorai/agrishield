package com.agrishield.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisHistoryItem {
    private UUID id;
    private String imageUrl;
    private Double confidenceScore;
    private String cropName;
    private String diseaseNameEn;
    private String diseaseNameBn;
    private String diseaseNameHi;
    private String severity;
    private LocalDateTime createdAt;
}