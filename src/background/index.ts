// AutoAccess Background Script
// This script runs in the background and handles extension lifecycle

console.log('AutoAccess background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('AutoAccess extension installed:', details);
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      globalMode: false,
      ttsEnabled: false,
      contrastFix: false,
      apiKeys: {},
      hasSeenWelcome: false
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html'),
      active: true
    });
  } else if (details.reason === 'update') {
    // Check if user has seen welcome page for updates
    chrome.storage.sync.get(['hasSeenWelcome'], (result) => {
      if (!result.hasSeenWelcome) {
        chrome.tabs.create({
          url: chrome.runtime.getURL('welcome.html'),
          active: true
        });
      }
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'GET_API_KEYS':
      chrome.storage.sync.get(['apiKeys'], (result) => {
        sendResponse({ apiKeys: result.apiKeys || {} });
      });
      return true; // Keep message channel open for async response
      
    case 'SET_API_KEYS':
      chrome.storage.sync.set({ apiKeys: message.apiKeys }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'GET_ACTIVE_PROFILE':
      chrome.storage.sync.get(['activeProfile'], (result) => {
        sendResponse({ profile: result.activeProfile || null });
      });
      return true;
      
    case 'SET_ACTIVE_PROFILE':
      chrome.storage.sync.set({ activeProfile: message.payload }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'OPEN_OPTIONS':
      chrome.runtime.openOptionsPage();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  
  switch (command) {
    case 'toggle-global-mode':
      // Send message to active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_GLOBAL_MODE' });
        }
      });
      break;
      
    case 'toggle-tts':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_TTS' });
        }
      });
      break;
      
    case 'toggle-stt':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_STT' });
        }
      });
      break;
  }
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Content script will be injected automatically via manifest
    console.log('Tab updated:', tab.url);
  }
});