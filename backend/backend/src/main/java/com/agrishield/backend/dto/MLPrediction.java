package com.agrishield.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)   // Ignores any extra fields Python sends
public class MLPrediction {

    @JsonProperty("top_class")
    private String topClass;

    @JsonProperty("top_class_index")
    private int topClassIndex;

    private double confidence;

    private List<Map<String, Object>> top3;

    @JsonProperty("model_used")
    private String modelUsed;   // NEW: R or J
}