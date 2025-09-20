import React, { useState, useEffect } from 'react';
import { AccessibilityProfile, APIKeys } from '../../lib/types';
import ProfileManager from './components/ProfileManager';
import APIKeysManager from './components/APIKeysManager';
import AnalyticsSettings from './components/AnalyticsSettings';
import PrivacySettings from './components/PrivacySettings';
import AboutSection from './components/AboutSection';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profiles');
  const [profiles, setProfiles] = useState<AccessibilityProfile[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKeys>({});
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load profiles
      const profilesResult = await chrome.storage.sync.get(['profiles']);
      if (profilesResult.profiles) {
        setProfiles(profilesResult.profiles);
      }

      // Load API keys
      const keysResult = await chrome.storage.sync.get(['apiKeys']);
      if (keysResult.apiKeys) {
        setApiKeys(keysResult.apiKeys);
      }

      // Load analytics setting
      const analyticsResult = await chrome.storage.sync.get(['analyticsEnabled']);
      setAnalyticsEnabled(analyticsResult.analyticsEnabled || false);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilesChange = async (newProfiles: AccessibilityProfile[]) => {
    setProfiles(newProfiles);
    await chrome.storage.sync.set({ profiles: newProfiles });
  };

  const handleAPIKeysChange = async (newApiKeys: APIKeys) => {
    setApiKeys(newApiKeys);
    await chrome.storage.sync.set({ apiKeys: newApiKeys });
    
    // Notify background script
    await chrome.runtime.sendMessage({
      type: 'UPDATE_API_KEYS',
      payload: newApiKeys
    });
  };

  const handleAnalyticsChange = async (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    await chrome.storage.sync.set({ analyticsEnabled: enabled });
    
    // Notify background script
    await chrome.runtime.sendMessage({
      type: 'TOGGLE_ANALYTICS',
      payload: { enabled }
    });
  };

  const tabs = [
    { id: 'profiles', label: 'Profiles', icon: '👤' },
    { id: 'api-keys', label: 'API Keys', icon: '🔑' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">AutoAccess Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'profiles' && (
          <ProfileManager
            profiles={profiles}
            onProfilesChange={handleProfilesChange}
          />
        )}
        
        {activeTab === 'api-keys' && (
          <APIKeysManager
            apiKeys={apiKeys}
            onAPIKeysChange={handleAPIKeysChange}
          />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsSettings
            enabled={analyticsEnabled}
            onEnabledChange={handleAnalyticsChange}
          />
        )}
        
        {activeTab === 'privacy' && (
          <PrivacySettings />
        )}
        
        {activeTab === 'about' && (
          <AboutSection />
        )}
      </div>
    </div>
  );
};

export default App;
