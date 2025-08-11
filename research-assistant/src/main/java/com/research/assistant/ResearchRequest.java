package com.research.assistant;

import lombok.Data;

@Data
public class ResearchRequest {
    // Text content to be processed
    private String content;
    // Operation type: summarize, analyze, translate
    private String operation;
    
}
