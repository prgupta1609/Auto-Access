import React, { useState, useEffect } from 'react';
import { AccessibilityProfile } from '../../../lib/types';

interface ProfileSelectorProps {
  currentProfile: AccessibilityProfile | null;
  onProfileChange: (profile: AccessibilityProfile) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  currentProfile,
  onProfileChange
}) => {
  const [profiles, setProfiles] = useState<AccessibilityProfile[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const result = await chrome.storage.sync.get(['profiles']);
      if (result.profiles) {
        setProfiles(result.profiles);
      } else {
        // Create default profiles
        const defaultProfiles = createDefaultProfiles();
        setProfiles(defaultProfiles);
        await chrome.storage.sync.set({ profiles: defaultProfiles });
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const createDefaultProfiles = (): AccessibilityProfile[] => {
    const now = new Date();
    
    return [
      {
        id: 'default',
        name: 'Default',
        description: 'Balanced accessibility features',
        settings: {
          globalMode: false,
          ocrEnabled: true,
          ttsEnabled: true,
          sttEnabled: false,
          contrastFix: false,
          keyboardMode: false,
          captions: false,
          signLanguage: false,
          fontSize: 1
        },
        siteOverrides: {},
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'blind',
        name: 'Blind User',
        description: 'Optimized for screen reader users',
        settings: {
          globalMode: true,
          ocrEnabled: true,
          ttsEnabled: true,
          sttEnabled: true,
          contrastFix: false,
          keyboardMode: true,
          captions: true,
          signLanguage: false,
          fontSize: 1
        },
        siteOverrides: {},
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'low-vision',
        name: 'Low Vision',
        description: 'Enhanced visual accessibility',
        settings: {
          globalMode: true,
          ocrEnabled: true,
          ttsEnabled: true,
          sttEnabled: false,
          contrastFix: true,
          keyboardMode: false,
          captions: false,
          signLanguage: false,
          fontSize: 1.2,
          colorBlindPreset: 'protanopia'
        },
        siteOverrides: {},
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'dyslexic',
        name: 'Dyslexic',
        description: 'Reading and comprehension support',
        settings: {
          globalMode: false,
          ocrEnabled: true,
          ttsEnabled: true,
          sttEnabled: false,
          contrastFix: true,
          keyboardMode: false,
          captions: true,
          signLanguage: false,
          fontSize: 1.1
        },
        siteOverrides: {},
        createdAt: now,
        updatedAt: now
      }
    ];
  };

  const handleProfileSelect = (profile: AccessibilityProfile) => {
    onProfileChange(profile);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            {currentProfile?.name || 'Select Profile'}
          </span>
          {currentProfile && (
            <span className="text-xs text-gray-500">
              {currentProfile.description}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                currentProfile?.id === profile.id ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
              }`}
              onClick={() => handleProfileSelect(profile)}
            >
              <div className="font-medium text-sm">{profile.name}</div>
              <div className="text-xs text-gray-500 mt-1">{profile.description}</div>
            </button>
          ))}
          
          <div className="border-t border-gray-200">
            <button
              className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 focus:outline-none focus:bg-blue-50"
              onClick={() => {
                chrome.runtime.openOptionsPage();
                setIsOpen(false);
              }}
            >
              Manage Profiles...
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
