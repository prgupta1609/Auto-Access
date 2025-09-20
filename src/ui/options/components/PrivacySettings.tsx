import React, { useState } from 'react';

const PrivacySettings: React.FC = () => {
  const [clearDataConfirm, setClearDataConfirm] = useState(false);

  const handleClearAllData = async () => {
    if (!clearDataConfirm) {
      setClearDataConfirm(true);
      return;
    }

    try {
      // Clear all extension data
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();
      
      // Clear cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      alert('All data has been cleared successfully.');
      setClearDataConfirm(false);
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Privacy & Data</h2>
        <p className="text-gray-600 mt-1">
          Control your data and privacy settings
        </p>
      </div>

      {/* Data Storage */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Storage</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-900">Local Storage</h4>
              <p className="text-sm text-gray-600">
                All your settings, profiles, and preferences are stored locally in your browser
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-900">Encrypted Storage</h4>
              <p className="text-sm text-gray-600">
                Sensitive data like API keys are encrypted before storage
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-900">No Cloud Sync</h4>
              <p className="text-sm text-gray-600">
                Your data stays on your device and is not synced to external servers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Collection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Collection</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Local Processing</h4>
              <p className="text-sm text-gray-600">
                All accessibility features work locally without sending data to external servers
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Optional Analytics</h4>
              <p className="text-sm text-gray-600">
                Anonymous usage data is only collected if you opt-in to help improve the extension
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">API Key Privacy</h4>
              <p className="text-sm text-gray-600">
                Your API keys are only used to communicate with the services you've configured
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Third-Party Services */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Third-Party Services</h3>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">OpenAI</h4>
            <p className="text-sm text-gray-600 mb-2">
              Used for AI-powered image captioning and text-to-speech when you provide an API key
            </p>
            <div className="text-xs text-gray-500">
              <strong>Data sent:</strong> Images for captioning, text for TTS<br/>
              <strong>Privacy policy:</strong> <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">openai.com/privacy</a>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">ElevenLabs</h4>
            <p className="text-sm text-gray-600 mb-2">
              Used for premium text-to-speech voices when you provide an API key
            </p>
            <div className="text-xs text-gray-500">
              <strong>Data sent:</strong> Text for speech synthesis<br/>
              <strong>Privacy policy:</strong> <a href="https://elevenlabs.io/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">elevenlabs.io/privacy</a>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">AssemblyAI</h4>
            <p className="text-sm text-gray-600 mb-2">
              Used for advanced speech-to-text when you provide an API key
            </p>
            <div className="text-xs text-gray-500">
              <strong>Data sent:</strong> Audio for transcription<br/>
              <strong>Privacy policy:</strong> <a href="https://www.assemblyai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">assemblyai.com/privacy</a>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">HuggingFace</h4>
            <p className="text-sm text-gray-600 mb-2">
              Used for open-source AI models when you provide an API key
            </p>
            <div className="text-xs text-gray-500">
              <strong>Data sent:</strong> Images for captioning<br/>
              <strong>Privacy policy:</strong> <a href="https://huggingface.co/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">huggingface.co/privacy</a>
            </div>
          </div>
        </div>
      </div>

      {/* Data Control */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Control</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Clear All Data</h4>
              <p className="text-sm text-gray-600">
                Remove all stored settings, profiles, and cached data
              </p>
            </div>
            <button
              className={`btn ${clearDataConfirm ? 'btn-danger' : 'btn-secondary'}`}
              onClick={handleClearAllData}
            >
              {clearDataConfirm ? 'Confirm Clear' : 'Clear Data'}
            </button>
          </div>
          
          {clearDataConfirm && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h5 className="font-medium text-yellow-900">Warning</h5>
                  <p className="text-sm text-yellow-800 mt-1">
                    This will permanently delete all your settings, profiles, and cached data. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GDPR Compliance */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">GDPR Compliance</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900">Right to Access</h4>
              <p className="text-sm text-blue-800">
                All your data is stored locally and accessible through browser developer tools
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900">Right to Erasure</h4>
              <p className="text-sm text-blue-800">
                Use the "Clear All Data" button above to delete all your data
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900">Data Portability</h4>
              <p className="text-sm text-blue-800">
                Export your settings and profiles using browser storage export features
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions or Concerns?</h3>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            If you have any questions about our privacy practices or want to exercise your data rights, 
            please contact us:
          </p>
          
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href="mailto:privacy@autoaccess.dev" className="text-blue-600 hover:underline text-sm">
              privacy@autoaccess.dev
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
