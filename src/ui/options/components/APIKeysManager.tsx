import React, { useState } from 'react';
import { APIKeys } from '../../../lib/types';

interface APIKeysManagerProps {
  apiKeys: APIKeys;
  onAPIKeysChange: (apiKeys: APIKeys) => void;
}

const APIKeysManager: React.FC<APIKeysManagerProps> = ({
  apiKeys,
  onAPIKeysChange
}) => {
  const [localApiKeys, setLocalApiKeys] = useState<APIKeys>(apiKeys);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleKeyChange = (service: string, value: string) => {
    setLocalApiKeys(prev => ({
      ...prev,
      [service]: value
    }));
    
    // Clear error when user starts typing
    if (errors[service]) {
      setErrors(prev => ({ ...prev, [service]: '' }));
    }
  };

  const handleChromeWebstoreChange = (field: string, value: string) => {
    setLocalApiKeys(prev => ({
      ...prev,
      chromeWebstore: {
        ...prev.chromeWebstore,
        [field]: value
      }
    }));
  };

  const validateKey = (service: string, value: string): string => {
    if (!value.trim()) return '';
    
    switch (service) {
      case 'openai':
        if (!value.startsWith('sk-')) {
          return 'OpenAI API key should start with "sk-"';
        }
        break;
      case 'elevenlabs':
        if (value.length < 20) {
          return 'ElevenLabs API key should be at least 20 characters';
        }
        break;
      case 'assemblyai':
        if (value.length < 20) {
          return 'AssemblyAI API key should be at least 20 characters';
        }
        break;
      case 'huggingface':
        if (value.length < 20) {
          return 'HuggingFace API key should be at least 20 characters';
        }
        break;
    }
    
    return '';
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate individual keys
    Object.entries(localApiKeys).forEach(([key, value]) => {
      if (key !== 'chromeWebstore' && typeof value === 'string') {
        const error = validateKey(key, value);
        if (error) {
          newErrors[key] = error;
        }
      }
    });
    
    // Validate Chrome Web Store keys
    if (localApiKeys.chromeWebstore) {
      const { clientId, clientSecret, refreshToken } = localApiKeys.chromeWebstore;
      if (clientId && clientId.length < 10) {
        newErrors['chromeWebstore.clientId'] = 'Client ID should be at least 10 characters';
      }
      if (clientSecret && clientSecret.length < 10) {
        newErrors['chromeWebstore.clientSecret'] = 'Client Secret should be at least 10 characters';
      }
      if (refreshToken && refreshToken.length < 10) {
        newErrors['chromeWebstore.refreshToken'] = 'Refresh Token should be at least 10 characters';
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onAPIKeysChange(localApiKeys);
    }
  };

  const toggleKeyVisibility = (service: string) => {
    setShowKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const hasCloudFeatures = !!(localApiKeys.openai || localApiKeys.elevenlabs || localApiKeys.assemblyai || localApiKeys.huggingface);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
        <p className="text-gray-600 mt-1">
          Configure API keys to enable cloud-powered features like AI image captioning and advanced TTS/STT
        </p>
      </div>

      {/* Cloud Features Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cloud Features</h3>
            <p className="text-sm text-gray-600 mt-1">
              {hasCloudFeatures 
                ? 'Cloud features are enabled with your API keys'
                : 'Add API keys to enable cloud-powered features'
              }
            </p>
          </div>
          <div className={`status-indicator ${hasCloudFeatures ? 'status-active' : 'status-inactive'}`}>
            {hasCloudFeatures ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>

      {/* AI Services */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Services</h3>
        
        <div className="space-y-4">
          {/* OpenAI */}
          <div className="form-group">
            <label className="form-label">
              OpenAI API Key
              <span className="text-xs text-gray-500 ml-2">(for GPT-4 image captioning and TTS)</span>
            </label>
            <div className="relative">
              <input
                type={showKeys.openai ? 'text' : 'password'}
                className={`form-input pr-10 ${errors.openai ? 'border-red-500' : ''}`}
                value={localApiKeys.openai || ''}
                onChange={(e) => handleKeyChange('openai', e.target.value)}
                placeholder="sk-..."
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => toggleKeyVisibility('openai')}
              >
                {showKeys.openai ? (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.openai && <p className="text-red-500 text-sm mt-1">{errors.openai}</p>}
          </div>

          {/* ElevenLabs */}
          <div className="form-group">
            <label className="form-label">
              ElevenLabs API Key
              <span className="text-xs text-gray-500 ml-2">(for premium TTS voices)</span>
            </label>
            <div className="relative">
              <input
                type={showKeys.elevenlabs ? 'text' : 'password'}
                className={`form-input pr-10 ${errors.elevenlabs ? 'border-red-500' : ''}`}
                value={localApiKeys.elevenlabs || ''}
                onChange={(e) => handleKeyChange('elevenlabs', e.target.value)}
                placeholder="Enter your ElevenLabs API key"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => toggleKeyVisibility('elevenlabs')}
              >
                {showKeys.elevenlabs ? (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.elevenlabs && <p className="text-red-500 text-sm mt-1">{errors.elevenlabs}</p>}
          </div>

          {/* AssemblyAI */}
          <div className="form-group">
            <label className="form-label">
              AssemblyAI API Key
              <span className="text-xs text-gray-500 ml-2">(for advanced speech-to-text)</span>
            </label>
            <div className="relative">
              <input
                type={showKeys.assemblyai ? 'text' : 'password'}
                className={`form-input pr-10 ${errors.assemblyai ? 'border-red-500' : ''}`}
                value={localApiKeys.assemblyai || ''}
                onChange={(e) => handleKeyChange('assemblyai', e.target.value)}
                placeholder="Enter your AssemblyAI API key"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => toggleKeyVisibility('assemblyai')}
              >
                {showKeys.assemblyai ? (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.assemblyai && <p className="text-red-500 text-sm mt-1">{errors.assemblyai}</p>}
          </div>

          {/* HuggingFace */}
          <div className="form-group">
            <label className="form-label">
              HuggingFace API Key
              <span className="text-xs text-gray-500 ml-2">(for open-source AI models)</span>
            </label>
            <div className="relative">
              <input
                type={showKeys.huggingface ? 'text' : 'password'}
                className={`form-input pr-10 ${errors.huggingface ? 'border-red-500' : ''}`}
                value={localApiKeys.huggingface || ''}
                onChange={(e) => handleKeyChange('huggingface', e.target.value)}
                placeholder="Enter your HuggingFace API key"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => toggleKeyVisibility('huggingface')}
              >
                {showKeys.huggingface ? (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.huggingface && <p className="text-red-500 text-sm mt-1">{errors.huggingface}</p>}
          </div>
        </div>
      </div>

      {/* Chrome Web Store API */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chrome Web Store API</h3>
        <p className="text-sm text-gray-600 mb-4">
          Required for automated extension publishing and updates
        </p>
        
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Client ID</label>
            <input
              type="text"
              className={`form-input ${errors['chromeWebstore.clientId'] ? 'border-red-500' : ''}`}
              value={localApiKeys.chromeWebstore?.clientId || ''}
              onChange={(e) => handleChromeWebstoreChange('clientId', e.target.value)}
              placeholder="Enter Chrome Web Store Client ID"
            />
            {errors['chromeWebstore.clientId'] && <p className="text-red-500 text-sm mt-1">{errors['chromeWebstore.clientId']}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Client Secret</label>
            <input
              type="password"
              className={`form-input ${errors['chromeWebstore.clientSecret'] ? 'border-red-500' : ''}`}
              value={localApiKeys.chromeWebstore?.clientSecret || ''}
              onChange={(e) => handleChromeWebstoreChange('clientSecret', e.target.value)}
              placeholder="Enter Chrome Web Store Client Secret"
            />
            {errors['chromeWebstore.clientSecret'] && <p className="text-red-500 text-sm mt-1">{errors['chromeWebstore.clientSecret']}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Refresh Token</label>
            <input
              type="password"
              className={`form-input ${errors['chromeWebstore.refreshToken'] ? 'border-red-500' : ''}`}
              value={localApiKeys.chromeWebstore?.refreshToken || ''}
              onChange={(e) => handleChromeWebstoreChange('refreshToken', e.target.value)}
              placeholder="Enter Chrome Web Store Refresh Token"
            />
            {errors['chromeWebstore.refreshToken'] && <p className="text-red-500 text-sm mt-1">{errors['chromeWebstore.refreshToken']}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          onClick={handleSave}
        >
          Save API Keys
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Privacy & Security</h4>
            <p className="text-sm text-blue-800 mt-1">
              Your API keys are stored locally in your browser and are never shared with third parties. 
              They are only used to communicate directly with the respective services you've configured.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIKeysManager;
