import React, { useState, useEffect } from 'react';
import { AuditResult } from '../lib/types';
import AuditPanel from './components/AuditPanel';
import ElementInspector from './components/ElementInspector';
import AccessibilityTree from './components/AccessibilityTree';
import OverlayManager from './components/OverlayManager';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Listen for messages from content script
    const handleMessage = (message: any) => {
      if (message.type === 'AUDIT_RESULT') {
        setAuditResult(message.payload);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'RUN_AUDIT' });
        setAuditResult(response);
      }
    } catch (error) {
      console.error('Failed to run audit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'audit', label: 'Audit', icon: '🔍' },
    { id: 'inspector', label: 'Inspector', icon: '🔎' },
    { id: 'tree', label: 'A11y Tree', icon: '🌳' },
    { id: 'overlays', label: 'Overlays', icon: '🎨' }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">AutoAccess DevTools</h1>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={runAudit}
            disabled={isLoading}
          >
            {isLoading ? 'Running...' : 'Run Audit'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-blue-600 focus:border-blue-500 ${
                  activeTab === tab.id ? 'text-blue-600 border-blue-500' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'audit' && (
          <AuditPanel
            auditResult={auditResult}
            onElementSelect={setSelectedElement}
          />
        )}
        
        {activeTab === 'inspector' && (
          <ElementInspector
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
          />
        )}
        
        {activeTab === 'tree' && (
          <AccessibilityTree />
        )}
        
        {activeTab === 'overlays' && (
          <OverlayManager />
        )}
      </div>
    </div>
  );
};

export default App;
