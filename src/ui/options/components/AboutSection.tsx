import React from 'react';

const AboutSection: React.FC = () => {
  const version = '1.0.0';
  const buildDate = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">About AutoAccess</h2>
        <p className="text-gray-600 mt-1">
          Complete accessibility solution with AI-powered features
        </p>
      </div>

      {/* Version Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Version Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900">Version</h4>
            <p className="text-sm text-gray-600">{version}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">Build Date</h4>
            <p className="text-sm text-gray-600">{buildDate}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">License</h4>
            <p className="text-sm text-gray-600">MIT</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">Repository</h4>
            <a 
              href="https://github.com/autoaccess/autoaccess" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">Global Accessibility Mode</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">AI-Powered OCR</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">Text-to-Speech</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">Speech-to-Text</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">Contrast Fixer</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">Keyboard Navigation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">Live Captions</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">Sign Language Overlay</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">Accessibility Auditing</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">Custom Profiles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Technology Stack</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">⚛️</div>
            <div className="text-sm font-medium text-gray-900">React</div>
            <div className="text-xs text-gray-600">UI Framework</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">🔷</div>
            <div className="text-sm font-medium text-gray-900">TypeScript</div>
            <div className="text-xs text-gray-600">Type Safety</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-sm font-medium text-gray-900">Vite</div>
            <div className="text-xs text-gray-600">Build Tool</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">🎨</div>
            <div className="text-sm font-medium text-gray-900">Tailwind</div>
            <div className="text-xs text-gray-600">Styling</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-sm font-medium text-gray-900">axe-core</div>
            <div className="text-xs text-gray-600">Auditing</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm font-medium text-gray-900">Tesseract.js</div>
            <div className="text-xs text-gray-600">OCR</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">🤖</div>
            <div className="text-sm font-medium text-gray-900">OpenAI</div>
            <div className="text-xs text-gray-600">AI Services</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">🧪</div>
            <div className="text-sm font-medium text-gray-900">Vitest</div>
            <div className="text-xs text-gray-600">Testing</div>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credits & Acknowledgments</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Open Source Libraries</h4>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• <a href="https://github.com/dequelabs/axe-core" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">axe-core</a> - Accessibility testing engine</li>
              <li>• <a href="https://github.com/naptha/tesseract.js" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Tesseract.js</a> - OCR library</li>
              <li>• <a href="https://github.com/mozilla/pdf.js" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PDF.js</a> - PDF rendering</li>
              <li>• <a href="https://github.com/airbnb/lottie-web" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lottie Web</a> - Animation library</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">AI Services</h4>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI</a> - GPT models for image captioning</li>
              <li>• <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ElevenLabs</a> - Premium TTS voices</li>
              <li>• <a href="https://www.assemblyai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AssemblyAI</a> - Speech-to-text</li>
              <li>• <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">HuggingFace</a> - Open-source AI models</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">Accessibility Standards</h4>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">WCAG 2.1 AA</a> - Web Content Accessibility Guidelines</li>
              <li>• <a href="https://www.w3.org/WAI/ARIA/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ARIA</a> - Accessible Rich Internet Applications</li>
              <li>• <a href="https://www.section508.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Section 508</a> - US Federal accessibility standards</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Support & Resources</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">Documentation</h4>
              <a 
                href="https://github.com/autoaccess/autoaccess/wiki" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                User Guide & Developer Docs
              </a>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Bug Reports</h4>
              <a 
                href="https://github.com/autoaccess/autoaccess/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Report Issues on GitHub
              </a>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Feature Requests</h4>
              <a 
                href="https://github.com/autoaccess/autoaccess/discussions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Suggest New Features
              </a>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">Community</h4>
              <a 
                href="https://discord.gg/autoaccess" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Discord Server
              </a>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Email Support</h4>
              <a 
                href="mailto:support@autoaccess.dev" 
                className="text-blue-600 hover:underline text-sm"
              >
                support@autoaccess.dev
              </a>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Privacy</h4>
              <a 
                href="mailto:privacy@autoaccess.dev" 
                className="text-blue-600 hover:underline text-sm"
              >
                privacy@autoaccess.dev
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* License */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">License</h3>
        
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            AutoAccess is licensed under the MIT License. This means you are free to use, 
            modify, and distribute the software for any purpose, including commercial use.
          </p>
          
          <p>
            The MIT License is a permissive free software license that places minimal 
            restrictions on how the software can be used, modified, and distributed.
          </p>
          
          <p>
            For the full license text, see the <a 
              href="https://github.com/autoaccess/autoaccess/blob/main/LICENSE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              LICENSE file
            </a> in the repository.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
