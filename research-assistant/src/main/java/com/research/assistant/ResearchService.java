package com.research.assistant;

import java.util.Map;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ResearchService {

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public ResearchService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String processContent(ResearchRequest request) {
        String prompt = buildPrompt(request);

        // Build request body for Gemini API
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            )
        );
        
        // Validate API key
        if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.equals("sua_chave_aqui")) {
            return "ERRO: API Key não configurada corretamente. Verifique o arquivo .env";
        }
        
        try {
            // Build complete URL with API key
            String fullUrl = geminiApiUrl + geminiApiKey;
            
            // Make HTTP request to Gemini API
            String response = webClient.post()
                .uri(fullUrl)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
                
            if (response != null) {
                return extractTextFromResponse(response);
            } else {
                return "Resposta vazia da API";
            }
            
        } catch (Exception e) {
            return "Erro ao chamar API: " + e.getMessage() + "\n" +
                   "URL: " + geminiApiUrl + "\n" +
                   "Key: " + geminiApiKey.substring(0, 10) + "..." + "\n" +
                   "Processamento realizado para: " + request.getOperation() + "\nPrompt: " + prompt;
        }
    }

    private String extractTextFromResponse(String response) {
        try {
            // Parse JSON response from Gemini
            GeminiResponse geminiResponse = objectMapper.readValue(response, GeminiResponse.class);
            
            // Extract text from response structure
            if (geminiResponse.getCandidates() != null && !geminiResponse.getCandidates().isEmpty()) {
                GeminiResponse.Candidate firstCandidate = geminiResponse.getCandidates().get(0);
                if (firstCandidate.getContent() != null && firstCandidate.getContent().getParts() != null && !firstCandidate.getContent().getParts().isEmpty()) {
                    return firstCandidate.getContent().getParts().get(0).getText();
                }
            }
            return "Formato de resposta não reconhecido: " + response;
        } catch (Exception e) {
            return "Erro ao processar resposta: " + e.getMessage() + "\nResposta original: " + response;
        }
    }

    private String buildPrompt(ResearchRequest request) {
        StringBuilder prompt = new StringBuilder();
        // Add operation-specific instructions
        switch (request.getOperation()) {
            case "summarize":
                prompt.append("Faça um resumo claro, conciso e objetivo do seguinte texto:\n\n ");
                break;
            case "analyze":
                prompt.append("Faça uma análise detalhada do seguinte texto:\n\n ");
                break;
            case "translate":
                prompt.append("Traduza o seguinte texto para o idioma desejado:\n\n ");
                break;
            default:
                throw new IllegalArgumentException("Operação não suportada: " + request.getOperation());
        }
        prompt.append(request.getContent());
        return prompt.toString();
    }
}
