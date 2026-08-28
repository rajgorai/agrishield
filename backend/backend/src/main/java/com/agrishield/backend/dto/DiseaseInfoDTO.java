package com.agrishield.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DiseaseInfoDTO {
    private String modelClassLabel;
    private String cropName;
    private String diseaseNameEn;
    private String diseaseNameBn;
    private String diseaseNameHi;
    private String severity;
}