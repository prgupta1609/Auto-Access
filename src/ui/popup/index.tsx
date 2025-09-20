import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const Popup: React.FC = () => {
  const [isGlobalMode, setIsGlobalMode] = React.useState(false);
  const [isTTSActive, setIsTTSActive] = React.useState(false);
  const [isContrastFix, setIsContrastFix] = React.useState(false);

  const toggleGlobalMode = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_GLOBAL_MODE' });
        setIsGlobalMode(!isGlobalMode);
      }
    } catch (error) {
      console.error('Error toggling global mode:', error);
    }
  };

  const toggleTTS = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_TTS' });
        setIsTTSActive(!isTTSActive);
      }
    } catch (error) {
      console.error('Error toggling TTS:', error);
    }
  };

  const toggleContrast = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_CONTRAST' });
        setIsContrastFix(!isContrastFix);
      }
    } catch (error) {
      console.error('Error toggling contrast:', error);
    }
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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<Popup />);
