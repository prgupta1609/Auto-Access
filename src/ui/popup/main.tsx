import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const PopupApp: React.FC = () => {
  const [isGlobalMode, setIsGlobalMode] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [isContrastFix, setIsContrastFix] = useState(false);
  const [isVoiceCommands, setIsVoiceCommands] = useState(false);
  const [isImageLabeling, setIsImageLabeling] = useState(false);

  useEffect(() => {
    // Get current states from content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_STATUS' }, (response) => {
          if (response) {
            setIsGlobalMode(response.globalMode || false);
            setIsTTSActive(response.ttsActive || false);
            setIsContrastFix(response.contrastFix || false);
            setIsVoiceCommands(response.voiceCommands || false);
            setIsImageLabeling(response.imageLabeling || false);
          }
        });
      }
    });
  }, []);

  const toggleGlobalMode = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_GLOBAL_MODE' });
        setIsGlobalMode(!isGlobalMode);
      }
    });
  };

  const toggleTTS = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_TTS' });
        setIsTTSActive(!isTTSActive);
      }
    });
  };

  const toggleContrast = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_CONTRAST' });
        setIsContrastFix(!isContrastFix);
      }
    });
  };

  const toggleVoiceCommands = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_VOICE_COMMANDS' });
        setIsVoiceCommands(!isVoiceCommands);
      }
    });
  };

  const toggleImageLabeling = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_IMAGE_LABELING' });
        setIsImageLabeling(!isImageLabeling);
      }
    });
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1>AutoAccess</h1>
        <p>AI-Powered Accessibility</p>
      </div>
      
      <div className="popup-content">
        <div className="feature-section">
          <button 
            className={`feature-btn ${isGlobalMode ? 'active' : ''}`}
            onClick={toggleGlobalMode}
          >
            <span className="icon">🌐</span>
            <span className="text">Global Mode</span>
          </button>
          
          <div className="tts-section">
            <button 
              className={`feature-btn ${isTTSActive ? 'active' : ''}`}
              onClick={toggleTTS}
            >
              <span className="icon">🔊</span>
              <span className="text">Text-to-Speech</span>
            </button>
            <div className="keyboard-shortcuts">
              <h4>Keyboard Shortcuts:</h4>
              <div className="shortcut-list">
                <div className="shortcut-item">
                  <kbd>Alt + A</kbd>
                  <span>Toggle Global Mode</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Alt + R</kbd>
                  <span>Toggle TTS</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Alt + S</kbd>
                  <span>Stop TTS</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Tab</kbd>
                  <span>Navigate (in Global Mode)</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Enter</kbd>
                  <span>Activate Element</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Esc</kbd>
                  <span>Exit Global Mode</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            className={`feature-btn ${isContrastFix ? 'active' : ''}`}
            onClick={toggleContrast}
          >
            <span className="icon">🎨</span>
            <span className="text">Contrast Fix</span>
          </button>

          <button 
            className={`feature-btn ${isVoiceCommands ? 'active' : ''}`}
            onClick={toggleVoiceCommands}
          >
            <span className="icon">🎤</span>
            <span className="text">Voice Commands</span>
          </button>

          <button 
            className={`feature-btn ${isImageLabeling ? 'active' : ''}`}
            onClick={toggleImageLabeling}
          >
            <span className="icon">🎨</span>
            <span className="text">AI Image Labeling</span>
          </button>
        </div>
        
        <div className="popup-footer">
          <button className="options-btn" onClick={openOptions}>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}
