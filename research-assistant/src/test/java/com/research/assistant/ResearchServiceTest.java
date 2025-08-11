package com.research.assistant;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=",
    "gemini.api.key=test_key_123"
})
class ResearchServiceTest {

    @Autowired
    private ResearchService researchService;

    @Test
    void testApiKeyLoading() {
        // Teste simples para verificar se o serviço está sendo injetado
        assertNotNull(researchService);
        
        // Criar uma requisição de teste
        ResearchRequest request = new ResearchRequest();
        request.setContent("Texto de teste");
        request.setOperation("summarize");
        
        // Executar o método
        String result = researchService.processContent(request);
        
        // Verificar se a resposta contém informações sobre a API key
        assertNotNull(result);
        System.out.println("Resultado: " + result);
        
        // Verificar se contém informações sobre erro da API (esperado com chave de teste)
        assertTrue(result.contains("Erro ao chamar API") || result.contains("400 Bad Request"));
        assertTrue(result.contains("test_key_1"));
    }
}
