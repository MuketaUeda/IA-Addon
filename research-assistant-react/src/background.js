chrome.action.onClicked.addListener((tab) => {
  // Abre o side panel quando o usuário clica no ícone da extensão
  if (chrome.sidePanel) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});


