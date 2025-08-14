const API_BASE_URL = 'http://localhost:8080';

export const researchService = {
  async search(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
      }
      throw new Error('Erro ao processar a pesquisa.');
    }
  },

  async process(text, operation) {
    try {
      const requestBody = { 
        content: text,
        operation: operation
      };

      // Adiciona targetLanguage para tradução
      if (operation === 'translate') {
        requestBody.targetLanguage = 'português brasileiro';
      }

      const response = await fetch(`${API_BASE_URL}/api/research/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
      }
      throw new Error('Erro ao processar o texto.');
    }
  },

  async summarize(text) {
    return this.process(text, 'summarize');
  },

  async analyze(text) {
    return this.process(text, 'analyze');
  },

  async translate(text) {
    return this.process(text, 'translate');
  }
};
