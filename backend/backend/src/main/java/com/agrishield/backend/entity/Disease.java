package com.agrishield.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "diseases")
@Data
public class Disease {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String modelClassLabel;  // e.g., "Tomato___Late_blight"

    private String cropName;         // e.g., "Tomato"
    private String diseaseNameEn;    // English
    private String diseaseNameBn;    // Bengali
    private String diseaseNameHi;    // Hindi
    private String severity;         // LOW, MEDIUM, HIGH

    @Column(columnDefinition = "TEXT")
    private String treatmentEn;

    @Column(columnDefinition = "TEXT")
    private String treatmentBn;

    @Column(columnDefinition = "TEXT")
    private String treatmentHi;
}