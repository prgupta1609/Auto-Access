# AutoAccess Developer Documentation

This document provides comprehensive technical documentation for developers working on AutoAccess or integrating with its APIs.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Modules](#core-modules)
4. [API Reference](#api-reference)
5. [Extension Architecture](#extension-architecture)
6. [Testing](#testing)
7. [Build & Deployment](#build--deployment)
8. [Contributing](#contributing)
9. [Performance Considerations](#performance-considerations)
10. [Security](#security)

## Architecture Overview

AutoAccess is built as a Chrome MV3 extension with a modern, modular architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│  Background Service Worker  │  Content Scripts  │  UI Pages │
│  ┌─────────────────────┐    │  ┌─────────────┐  │ ┌──────┐ │
│  │ Message Handling    │    │  │ DOM Access  │  │ │Popup │ │
│  │ API Management      │    │  │ A11y Engine │  │ │Options│ │
│  │ Storage Management  │    │  │ AI Services │  │ │DevTools││
│  │ Analytics           │    │  │ TTS/STT     │  │ └──────┘ │
│  └─────────────────────┘    │  └─────────────┘  │          │
├─────────────────────────────────────────────────────────────┤
│                    Core Libraries                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │AIClient │ │TTSService│ │STTService│ │OCRService│ │Auditor  ││
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │Contrast │ │Keyboard │ │WASM     │ │Storage  │ │Analytics││
│  │Fixer    │ │Engine   │ │Loader   │ │Manager  │ │         ││
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Modularity**: Each feature is self-contained with clear interfaces
2. **Privacy-First**: Local processing with optional cloud features
3. **Performance**: Lazy loading and efficient resource management
4. **Accessibility**: WCAG 2.1 AA compliant throughout
5. **Extensibility**: Plugin architecture for new features

## Project Structure

```
autoaccess/
├── src/
│   ├── background/           # Service worker
│   │   └── index.ts
│   ├── content/             # Content scripts
│   │   └── index.ts
│   ├── lib/                 # Core libraries
│   │   ├── types.ts         # TypeScript definitions
│   │   ├── aiClient.ts      # AI service integration
│   │   ├── ttsService.ts    # Text-to-speech
│   │   ├── sttService.ts    # Speech-to-text
│   │   ├── ocr.ts           # Optical character recognition
│   │   ├── contrastFixer.ts # Color contrast improvements
│   │   ├── keyboardEngine.ts# Keyboard navigation
│   │   ├── wasmLoader.ts    # WebAssembly model loading
│   │   └── audit.ts         # Accessibility auditing
│   ├── ui/                  # User interface components
│   │   ├── popup/           # Extension popup
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── components/
│   │   ├── options/         # Settings page
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── components/
│   │   ├── toolbar/         # Floating toolbar
│   │   │   └── index.ts
│   │   └── devtools/        # DevTools panel
│   │       ├── App.tsx
│   │       ├── main.tsx
│   │       └── components/
│   ├── manifest.json        # Extension manifest
│   ├── devtools.html        # DevTools page
│   └── devtools.js          # DevTools setup
├── test/                    # Test files
│   ├── unit/               # Unit tests
│   ├── e2e/                # End-to-end tests
│   └── setup.ts            # Test setup
├── public/                  # Static assets
│   └── icons/              # Extension icons
├── .github/                 # GitHub workflows
│   └── workflows/
├── docs/                    # Documentation
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

## Core Modules

### AIClient (`src/lib/aiClient.ts`)

Handles AI-powered image captioning with multiple provider support.

```typescript
interface AIClient {
  generateImageCaption(imageData: string | ArrayBuffer, options?: CaptionOptions): Promise<AICaptionResult>;
  batchProcessImages(images: ImageData[], options?: BatchOptions): Promise<Record<string, AICaptionResult>>;
  updateAPIKeys(apiKeys: Partial<APIKeys>): void;
  hasCloudCapabilities(): boolean;
}
```

**Features:**
- OpenAI GPT-4o integration
- HuggingFace fallback
- Rate limiting (60 req/min)
- Batch processing (groups of 4)
- Confidence scoring
- Local fallback processing

### TTSService (`src/lib/ttsService.ts`)

Text-to-speech with multiple voice providers and word highlighting.

```typescript
interface TTSService {
  speak(text: string, options?: TTSOptions, highlightCallback?: (wordIndex: number) => void): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  isCurrentlyPlaying(): boolean;
  getAvailableVoices(): SpeechSynthesisVoice[];
  highlightWordInElement(element: HTMLElement, wordIndex: number): void;
}
```

**Features:**
- Browser SpeechSynthesis API
- OpenAI TTS integration
- ElevenLabs premium voices
- Synchronized word highlighting
- Voice customization
- Error handling and fallbacks

### STTService (`src/lib/sttService.ts`)

Speech-to-text with voice command processing.

```typescript
interface STTService {
  startListening(options?: STTOptions, onResult?: ResultCallback, onError?: ErrorCallback): Promise<void>;
  stopListening(): void;
  isCurrentlyListening(): boolean;
  getSupportedLanguages(): string[];
  processVoiceCommand(text: string): Promise<CommandResult>;
  executeVoiceCommand(command: string, text: string): Promise<void>;
}
```

**Features:**
- Browser SpeechRecognition API
- OpenAI Whisper integration
- AssemblyAI advanced STT
- Voice command processing
- Multi-language support
- Continuous listening

### OCRService (`src/lib/ocr.ts`)

Optical character recognition with Tesseract.js integration.

```typescript
interface OCRService {
  initialize(): Promise<void>;
  extractText(imageElement: HTMLImageElement | HTMLCanvasElement | string): Promise<OCRResult>;
  batchExtractText(images: ImageData[]): Promise<Record<string, OCRResult>>;
  extractTextFromPDF(pdfUrl: string, pageNumber?: number): Promise<OCRResult>;
  detectLanguage(text: string): Promise<string>;
  setLanguage(language: string): Promise<void>;
  getSupportedLanguages(): string[];
  terminate(): Promise<void>;
}
```

**Features:**
- Tesseract.js integration
- PDF text extraction
- Batch processing
- Language detection
- Memory management
- Error handling

### ContrastFixer (`src/lib/contrastFixer.ts`)

WCAG 2.1 AA compliant color contrast improvements.

```typescript
interface ContrastFixer {
  applyContrastFixes(options?: ContrastFixOptions): Promise<void>;
  adjustFontSize(scale: number): Promise<void>;
  reset(): Promise<void>;
  isCurrentlyActive(): boolean;
  getCurrentOptions(): ContrastFixOptions;
}
```

**Features:**
- WCAG 2.1 AA compliance
- Color-blind presets
- Font size adjustment
- Brand color preservation
- Real-time preview
- Undo functionality

### KeyboardEngine (`src/lib/keyboardEngine.ts`)

Enhanced keyboard navigation with skip links and logical tab order.

```typescript
interface KeyboardEngine {
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  navigate(direction: NavigationDirection): void;
  isActive(): boolean;
  getCurrentElement(): HTMLElement | null;
  getFocusableElementsCount(): number;
  updateOptions(newOptions: Partial<KeyboardNavigationOptions>): void;
}
```

**Features:**
- Skip links generation
- Logical tab order
- ARIA attribute fixes
- SPA route change support
- Visual focus indicators
- Directional navigation

### WASMLoader (`src/lib/wasmLoader.ts`)

WebAssembly and ONNX model loading with storage management.

```typescript
interface WASMLoader {
  loadModel(modelName: string, modelUrl: string, options?: LoadOptions): Promise<any>;
  loadONNXModel(modelName: string, modelUrl: string, options?: LoadOptions): Promise<any>;
  loadLocalOCRModel(): Promise<any>;
  loadLocalCaptionModel(): Promise<any>;
  unloadModel(modelName: string): Promise<void>;
  unloadAllModels(): Promise<void>;
  getStorageBudget(): StorageBudget;
  isStorageWarning(): boolean;
  isStorageCritical(): boolean;
  clearCache(): Promise<void>;
  optimizeStorage(): Promise<void>;
}
```

**Features:**
- WASM model loading
- ONNX runtime integration
- Storage budget monitoring
- Memory optimization
- Cache management
- Error handling

### AccessibilityAuditor (`src/lib/audit.ts`)

Comprehensive accessibility auditing with axe-core integration.

```typescript
interface AccessibilityAuditor {
  initialize(): Promise<void>;
  runAudit(options?: AuditOptions): Promise<AuditResult>;
  runQuickAudit(): Promise<AuditResult>;
  runComprehensiveAudit(): Promise<AuditResult>;
  auditSpecificElements(selectors: string[]): Promise<AuditResult>;
  generateReport(auditResult: AuditResult): AuditReport;
  generateGitHubPR(accessibilityIssues: AuditResult): Promise<string>;
  exportReport(auditResult: AuditResult, format: 'json' | 'pdf'): Promise<Blob>;
  applySafeFixes(auditResult: AuditResult): Promise<FixResult>;
}
```

**Features:**
- axe-core integration
- Multiple audit levels
- Report generation
- GitHub PR creation
- Safe automated fixes
- Export functionality

## API Reference

### Message Passing

AutoAccess uses Chrome's message passing API for communication between components:

```typescript
// Background to Content Script
chrome.tabs.sendMessage(tabId, {
  type: 'TOGGLE_GLOBAL_MODE',
  payload: { enabled: true }
});

// Content Script to Background
chrome.runtime.sendMessage({
  type: 'GET_ACTIVE_PROFILE'
});

// UI to Background
chrome.runtime.sendMessage({
  type: 'UPDATE_API_KEYS',
  payload: { openai: 'sk-...' }
});
```

### Storage API

```typescript
// Sync storage (limited, synced across devices)
chrome.storage.sync.set({ profiles: profiles });
chrome.storage.sync.get(['profiles']);

// Local storage (unlimited, device-specific)
chrome.storage.local.set({ [`activeProfile_${tabId}`]: profile });
chrome.storage.local.get([`activeProfile_${tabId}`]);
```

### Content Script Injection

```typescript
// Execute script in page context
chrome.scripting.executeScript({
  target: { tabId },
  func: () => {
    // Code runs in page context
    document.dispatchEvent(new CustomEvent('autoaccess-event'));
  }
});
```

## Extension Architecture

### Service Worker (Background)

The service worker handles:
- Extension lifecycle management
- Message routing between components
- API key management
- Analytics collection
- Tab state management

```typescript
class BackgroundService {
  private apiKeys: APIKeys = {};
  private activeProfiles: Map<number, AccessibilityProfile> = new Map();
  private analyticsEnabled = false;

  async handleMessage(message: ExtensionMessage, sender: chrome.runtime.MessageSender): Promise<any> {
    switch (message.type) {
      case 'GET_API_KEYS':
        return { apiKeys: this.apiKeys };
      case 'UPDATE_API_KEYS':
        await this.updateAPIKeys(message.payload);
        return { success: true };
      // ... other message types
    }
  }
}
```

### Content Scripts

Content scripts run in the page context and provide:
- DOM manipulation capabilities
- Accessibility feature implementation
- Event handling
- Communication with background script

```typescript
class ContentScript {
  private aiClient: AIClient;
  private ttsService: TTSService;
  private contrastFixer: ContrastFixer;
  // ... other services

  constructor() {
    this.initializeServices();
    this.setupEventListeners();
    this.createToolbar();
  }

  private setupEventListeners(): void {
    document.addEventListener('autoaccess-toggle-global-mode', this.toggleGlobalMode.bind(this));
    document.addEventListener('autoaccess-tts-read', this.handleTTSRead.bind(this));
    // ... other event listeners
  }
}
```

### UI Components

#### Popup Interface
- React-based popup UI
- Profile management
- Quick actions
- Feature toggles
- Status indicators

#### Options Page
- Comprehensive settings
- Profile editor
- API key management
- Analytics controls
- Privacy settings

#### DevTools Panel
- Accessibility auditing
- Element inspection
- Accessibility tree view
- Overlay management
- Debug information

#### Floating Toolbar
- Shadow DOM implementation
- Draggable interface
- Feature shortcuts
- Status indicators
- Keyboard accessible

## Testing

### Unit Tests (Vitest)

```typescript
// Example unit test
describe('AIClient', () => {
  it('should generate caption with OpenAI when API key is available', async () => {
    const aiClient = new AIClient({ openai: 'sk-test-key' });
    const result = await aiClient.generateImageCaption('data:image/jpeg;base64,test');
    
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.model).toBe('gpt-4o-mini');
  });
});
```

### E2E Tests (Playwright)

```typescript
// Example E2E test
test('should run accessibility audit on nytimes.com', async ({ page }) => {
  await page.goto('https://www.nytimes.com');
  
  const auditResult = await page.evaluate(() => {
    return new Promise((resolve) => {
      const event = new CustomEvent('autoaccess-audit-run', { detail: { resolve } });
      document.dispatchEvent(event);
    });
  });

  expect(auditResult.violations).toBeDefined();
});
```

### Test Coverage

- **Unit Tests**: 90%+ coverage for core modules
- **E2E Tests**: Critical user flows
- **Accessibility Tests**: WCAG compliance
- **Performance Tests**: Memory and CPU usage
- **Security Tests**: Vulnerability scanning

## Build & Deployment

### Development Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
pnpm test:e2e

# Build for production
pnpm build

# Package extension
pnpm package
```

### Build Process

1. **TypeScript Compilation**: Type checking and compilation
2. **Vite Bundling**: Module bundling and optimization
3. **Asset Processing**: Icon optimization and copying
4. **Manifest Generation**: Extension manifest creation
5. **Package Creation**: ZIP file generation

### CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e

  build:
    needs: test
    steps:
      - run: pnpm build
      - run: pnpm package
      - uses: actions/upload-artifact@v3

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: samuelmeuli/action-chrome-extension@v1
        with:
          extension-id: ${{ secrets.CHROME_EXTENSION_ID }}
          client-id: ${{ secrets.CHROME_WEBSTORE_CLIENT_ID }}
          client-secret: ${{ secrets.CHROME_WEBSTORE_CLIENT_SECRET }}
          refresh-token: ${{ secrets.CHROME_WEBSTORE_REFRESH_TOKEN }}
          file-path: autoaccess.zip
```

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow coding standards and add tests
4. **Run tests**: `pnpm test && pnpm test:e2e`
5. **Commit changes**: Use conventional commit messages
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Create Pull Request**: Provide detailed description

### Coding Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent formatting
- **Conventional Commits**: Standardized commit messages
- **Test Coverage**: 90%+ for new code

### Code Review Process

1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one approval required
3. **Accessibility Review**: WCAG compliance check
4. **Security Review**: Vulnerability assessment
5. **Performance Review**: Memory and CPU impact

## Performance Considerations

### Memory Management

```typescript
// Example: Proper cleanup
class TTSService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  stop(): void {
    if (this.currentUtterance) {
      speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }
}
```

### Lazy Loading

```typescript
// Example: Lazy loading AI models
async loadModel(modelName: string): Promise<any> {
  if (this.loadedModels.has(modelName)) {
    return this.loadedModels.get(modelName);
  }
  
  // Load model only when needed
  const model = await this.loadWASMModel(modelUrl);
  this.loadedModels.set(modelName, model);
  return model;
}
```

### Storage Optimization

```typescript
// Example: Storage budget monitoring
async updateStorageBudget(): Promise<void> {
  const estimate = await navigator.storage.estimate();
  this.storageBudget = {
    used: Math.round(estimate.usage / (1024 * 1024)),
    available: Math.round(estimate.quota / (1024 * 1024)),
    percentage: Math.round((estimate.usage / estimate.quota) * 100)
  };
}
```

## Security

### API Key Management

```typescript
// Example: Secure API key storage
class APIKeyManager {
  async storeAPIKey(service: string, key: string): Promise<void> {
    const encrypted = await this.encrypt(key);
    await chrome.storage.sync.set({ [`${service}_key`]: encrypted });
  }

  async getAPIKey(service: string): Promise<string | null> {
    const encrypted = await chrome.storage.sync.get([`${service}_key`]);
    if (encrypted[`${service}_key`]) {
      return await this.decrypt(encrypted[`${service}_key`]);
    }
    return null;
  }
}
```

### Content Security Policy

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';"
  }
}
```

### Input Validation

```typescript
// Example: Input validation
function validateAPIKey(key: string, service: string): boolean {
  switch (service) {
    case 'openai':
      return key.startsWith('sk-') && key.length > 20;
    case 'elevenlabs':
      return key.length > 20;
    default:
      return false;
  }
}
```

---

## Additional Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [React TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)

For more information, visit our [GitHub repository](https://github.com/autoaccess/autoaccess) or join our [Discord community](https://discord.gg/autoaccess).
