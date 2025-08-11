package com.research.assistant;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiResponse {
    // List of AI-generated responses
    private List<Candidate> candidates;
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Candidate {
        // Content containing the AI response
        private Content content;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Content {
        // Parts of the response (usually text)
        private List<Part> parts;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Part {
        // Actual text content from AI
        private String text;
    }
}
