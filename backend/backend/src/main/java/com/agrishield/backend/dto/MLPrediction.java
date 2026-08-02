package com.agrishield.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class MLPrediction {

    @JsonProperty("top_class")
    private String topClass;

    private double confidence;

    private List<Map<String, Object>> top3;
}