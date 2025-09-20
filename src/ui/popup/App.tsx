import React, { useState, useEffect } from 'react';
import { AccessibilityProfile, APIKeys } from '../../lib/types';
import FeatureCard from './components/FeatureCard';
import ProfileSelector from './components/ProfileSelector';
import QuickActions from './components/QuickActions';
import StatusBar from './components/StatusBar';
import SettingsButton from './components/SettingsButton';

const App: React.FC = () => {
  const [currentProfile, setCurrentProfile] = useState<AccessibilityProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKeys>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeFeatures, setActiveFeatures] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current profile
      const profileResponse = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROFILE' });
      if (profileResponse.profile) {
        setCurrentProfile(profileResponse.profile);
        updateActiveFeatures(profileResponse.profile);
      }

      // Get API keys
      const keysResponse = await chrome.runtime.sendMessage({ type: 'GET_API_KEYS' });
      if (keysResponse.apiKeys) {
        setApiKeys(keysResponse.apiKeys);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateActiveFeatures = (profile: AccessibilityProfile) => {
    const active = new Set<string>();
    
    if (profile.settings.globalMode) active.add('global-mode');
    if (profile.settings.ocrEnabled) active.add('ocr');
    if (profile.settings.ttsEnabled) active.add('tts');
    if (profile.settings.sttEnabled) active.add('stt');
    if (profile.settings.contrastFix) active.add('contrast');
    if (profile.settings.keyboardMode) active.add('keyboard');
    if (profile.settings.captions) active.add('captions');
    if (profile.settings.signLanguage) active.add('sign-language');
    
    setActiveFeatures(active);
  };

  const handleFeatureToggle = async (featureId: string) => {
    if (!currentProfile) return;

    const newProfile = { ...currentProfile };
    
    switch (featureId) {
      case 'global-mode':
        newProfile.settings.globalMode = !newProfile.settings.globalMode;
        break;
      case 'ocr':
        newProfile.settings.ocrEnabled = !newProfile.settings.ocrEnabled;
        break;
      case 'tts':
        newProfile.settings.ttsEnabled = !newProfile.settings.ttsEnabled;
        break;
      case 'stt':
        newProfile.settings.sttEnabled = !newProfile.settings.sttEnabled;
        break;
      case 'contrast':
        newProfile.settings.contrastFix = !newProfile.settings.contrastFix;
        break;
      case 'keyboard':
        newProfile.settings.keyboardMode = !newProfile.settings.keyboardMode;
        break;
      case 'captions':
        newProfile.settings.captions = !newProfile.settings.captions;
        break;
      case 'sign-language':
        newProfile.settings.signLanguage = !newProfile.settings.signLanguage;
        break;
    }

    newProfile.updatedAt = new Date();
    setCurrentProfile(newProfile);
    updateActiveFeatures(newProfile);

    // Save to background script
    await chrome.runtime.sendMessage({
      type: 'SET_ACTIVE_PROFILE',
      payload: newProfile
    });
  };

  const handleProfileChange = async (profile: AccessibilityProfile) => {
    setCurrentProfile(profile);
    updateActiveFeatures(profile);
    
    await chrome.runtime.sendMessage({
      type: 'SET_ACTIVE_PROFILE',
      payload: profile
    });
  };

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'audit':
        await chrome.runtime.sendMessage({ type: 'AUDIT_RUN' });
        break;
      case 'read-page':
        await chrome.runtime.sendMessage({
          type: 'TTS_READ',
          payload: { text: document.title }
        });
        break;
      case 'contrast-fix':
        await chrome.runtime.sendMessage({
          type: 'CONTRAST_FIX',
          payload: { targetRatio: 4.5 }
        });
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">AutoAccess</h1>
          </div>
          <SettingsButton />
        </div>
      </div>

      {/* Profile Selector */}
      <div className="px-4 py-3 border-b border-gray-200">
        <ProfileSelector
          currentProfile={currentProfile}
          onProfileChange={handleProfileChange}
        />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-gray-200">
        <QuickActions onAction={handleQuickAction} />
      </div>

      {/* Features */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-3">
          <FeatureCard
            id="global-mode"
            title="Global Accessibility Mode"
            description="One-click comprehensive accessibility improvements"
            icon="🌐"
            isActive={activeFeatures.has('global-mode')}
            onToggle={handleFeatureToggle}
            hasCloudFeature={false}
          />
          
          <FeatureCard
            id="ocr"
            title="AI-Powered OCR"
            description="Extract and describe text from images"
            icon="📷"
            isActive={activeFeatures.has('ocr')}
            onToggle={handleFeatureToggle}
            hasCloudFeature={!!apiKeys.openai || !!apiKeys.huggingface}
          />
          
          <FeatureCard
            id="tts"
            title="Text-to-Speech"
            description="Read content aloud with highlighting"
            icon="🔊"
            isActive={activeFeatures.has('tts')}
            onToggle={handleFeatureToggle}
            hasCloudFeature={!!apiKeys.openai || !!apiKeys.elevenlabs}
          />
          
          <FeatureCard
            id="stt"
            title="Speech-to-Text"
            description="Voice navigation and commands"
            icon="🎤"
            isActive={activeFeatures.has('stt')}
            onToggle={handleFeatureToggle}
            hasCloudFeature={!!apiKeys.openai || !!apiKeys.assemblyai}
          />
          
          <FeatureCard
            id="contrast"
            title="Contrast Fixer"
            description="Improve color contrast and readability"
            icon="🎨"
            isActive={activeFeatures.has('contrast')}
            onToggle={handleFeatureToggle}
            hasCloudFeature={false}
          />
          
          <FeatureCard
            id="keyboard"
            title="Keyboard Navigation"
            description="Enhanced keyboard accessibility"
            icon="⌨️"
            isActive={activeFeatures.has('keyboard')}
            onToggle={handleFeatureToggle}
            hasCloudFeature={false}
          />
          
          <FeatureCard
            id="captions"
            title="Live Captions"
            description="Real-time captions for media"
            icon="📝"
            isActive={activeFeatures.has('captions')}
            onToggle={handleFeatureToggle}
            hasCloudFeature={false}
          />
          
          <FeatureCard
            id="sign-language"
            title="Sign Language Overlay"
            description="ASL avatar for key phrases"
            icon="👋"
            isActive={activeFeatures.has('sign-language')}
            onToggle={handleFeatureToggle}
            hasCloudFeature={false}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-4 py-2">
        <StatusBar
          currentProfile={currentProfile}
          apiKeys={apiKeys}
          activeFeatures={activeFeatures}
        />
      </div>
    </div>
  );
};

export default App;
