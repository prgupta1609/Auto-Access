import React from 'react';
import { AccessibilityProfile, APIKeys } from '../../../lib/types';

interface StatusBarProps {
  currentProfile: AccessibilityProfile | null;
  apiKeys: APIKeys;
  activeFeatures: Set<string>;
}

const StatusBar: React.FC<StatusBarProps> = ({
  currentProfile,
  apiKeys,
  activeFeatures
}) => {
  const hasCloudFeatures = !!(apiKeys.openai || apiKeys.elevenlabs || apiKeys.assemblyai || apiKeys.huggingface);
  const activeCount = activeFeatures.size;

  return (
    <div className="flex items-center justify-between text-xs text-gray-600">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span>{activeCount} active</span>
        </div>
        
        {hasCloudFeatures && (
          <div className="flex items-center space-x-1">
            <span className="text-blue-500">☁️</span>
            <span>Cloud enabled</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {currentProfile && (
          <span className="text-gray-500">
            {currentProfile.name}
          </span>
        )}
        
        <button
          className="text-blue-600 hover:text-blue-800 focus:outline-none"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default StatusBar;
