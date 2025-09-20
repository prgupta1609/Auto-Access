import React, { useState } from 'react';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  onClose
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10003 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔒</span>
              <h2 className="text-xl font-semibold">Cloud Features Consent</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close consent modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 text-xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Privacy-First Design</h3>
                <p className="text-blue-700 text-sm">
                  AutoAccess is designed with privacy in mind. All image processing can be done locally on your device. 
                  Cloud features are optional and require your explicit consent.
                </p>
              </div>
            </div>
          </div>

          {/* Local vs Cloud */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-green-500 text-xl">🏠</span>
                <h3 className="font-semibold text-gray-800">Local Processing</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>OCR text extraction using Tesseract.js</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Basic image type detection</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Generic alt-text generation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>No data leaves your device</span>
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-blue-500 text-xl">☁️</span>
                <h3 className="font-semibold text-gray-800">Cloud Processing</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500">✓</span>
                  <span>AI-powered image descriptions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500">✓</span>
                  <span>Context-aware alt-text generation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500">✓</span>
                  <span>Higher accuracy and detail</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500">⚠</span>
                  <span>Images sent to AI services</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Usage */}
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>{isExpanded ? '▼' : '▶'}</span>
              <span>What happens to my images in cloud mode?</span>
            </button>
            
            {isExpanded && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">OpenAI (if enabled):</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Images are sent to OpenAI's API for analysis</li>
                      <li>OpenAI may use data for service improvement (see their privacy policy)</li>
                      <li>Images are not stored permanently by OpenAI</li>
                      <li>API calls are rate-limited to 60 requests per minute</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Hugging Face (if enabled):</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Images are sent to Hugging Face's inference API</li>
                      <li>Data usage follows Hugging Face's privacy policy</li>
                      <li>Images are processed for caption generation only</li>
                      <li>No permanent storage of your images</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-yellow-800">
                      <strong>Important:</strong> You can disable cloud features at any time in the extension settings. 
                      Local processing will continue to work without sending any data externally.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Consent Options */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-800 mb-4">Choose your preference:</h3>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="consent"
                  value="local"
                  className="mt-1"
                  defaultChecked
                />
                <div>
                  <div className="font-medium text-gray-800">Local Processing Only</div>
                  <div className="text-sm text-gray-600">
                    Use only local OCR and basic image analysis. No data leaves your device.
                  </div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="consent"
                  value="cloud"
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-800">Enable Cloud Features</div>
                  <div className="text-sm text-gray-600">
                    Allow AI-powered image descriptions using OpenAI/Hugging Face APIs.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex items-center justify-between">
          <button
            onClick={onDecline}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Local Only
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
