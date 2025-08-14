import React, { useState, useEffect } from 'react';

const OperationPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('summarize');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const operations = [
    { value: 'summarize', label: 'Resumir', description: 'Gera um resumo conciso do texto' },
    { value: 'analyze', label: 'Analisar', description: 'Faz uma análise detalhada do conteúdo' },
    { value: 'translate', label: 'Traduzir', description: 'Traduz o texto para português' }
  ];

  // Carregar preferência de dark mode do storage
  useEffect(() => {
    chrome.storage.sync.get(['darkMode'], (result) => {
      setIsDarkMode(result.darkMode || false);
    });
  }, []);

  // Salvar preferência de dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    chrome.storage.sync.set({ darkMode: newDarkMode });
  };

  const getSelectedText = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' });
      
      if (response && response.text) {
        setSelectedText(response.text);
        return response.text;
      } else {
        setError('Nenhum texto selecionado. Selecione um texto na página primeiro.');
        return null;
      }
    } catch (error) {
      setError('Erro ao capturar texto selecionado. Tente recarregar a página.');
      return null;
    }
  };

  const handleProcess = async () => {
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const text = await getSelectedText();
      if (!text) {
        setIsLoading(false);
        return;
      }

      // Importar o serviço dinamicamente
      const { researchService } = await import('../services/api.js');
      const response = await researchService.process(text, selectedOperation);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    const operation = operations.find(op => op.value === selectedOperation);
    return isLoading ? 'Processando...' : operation?.label || 'Processar';
  };

  return (
    <div className={`h-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="p-4">
        <div className="max-w-full">
          {/* Header com título e toggle de dark mode */}
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Research Assistant
            </h1>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
              title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Escolha a operação:
            </label>
            <select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
              disabled={isLoading}
            >
              {operations.map((operation) => (
                <option key={operation.value} value={operation.value}>
                  {operation.label} - {operation.description}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <button
              onClick={handleProcess}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {getButtonText()}
            </button>
          </div>

          {selectedText && (
            <div className="mb-4">
              <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Texto selecionado:
              </h3>
              <div className={`border rounded-md p-3 text-sm max-h-32 overflow-y-auto ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-gray-300' 
                  : 'bg-white border-gray-300 text-gray-600'
              }`}>
                {selectedText}
              </div>
            </div>
          )}

          <div className="results-section max-h-96 overflow-y-auto">
            {isLoading && (
              <div className={`text-center italic text-sm py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Processando...
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3 text-red-700 text-sm dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}
            
            {result && (
              <div className={`border-l-4 border-blue-500 p-3 rounded-md text-sm leading-relaxed ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-200' 
                  : 'bg-white text-gray-700'
              }`}>
                <h3 className="font-medium mb-2">
                  {operations.find(op => op.value === selectedOperation)?.label}:
                </h3>
                <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {result}
                </div>
              </div>
            )}
          </div>

          <div className={`mt-4 text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Selecione um texto na página, escolha a operação e clique no botão para processar.
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationPanel;

