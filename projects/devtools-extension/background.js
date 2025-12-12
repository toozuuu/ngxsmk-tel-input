/**
 * Background service worker for DevTools extension
 */

let devToolsPort = null;

// Listen for DevTools connection
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'devtools') {
    devToolsPort = port;
    
    port.onDisconnect.addListener(() => {
      devToolsPort = null;
    });
  }
});

// Forward messages from content scripts to DevTools
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (devToolsPort && message.type === 'components-update') {
    devToolsPort.postMessage(message);
  } else if (devToolsPort && message.type === 'component-update') {
    devToolsPort.postMessage(message);
  }
  return true;
});

