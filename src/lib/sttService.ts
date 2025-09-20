import { STTOptions } from './types.js';

export class STTService {
  private recognition: any = null;
  private isListening = false;
  private openaiKey?: string;
  private assemblyaiKey?: string;
  private onResultCallback?: (text: string, isFinal: boolean) => void;
  private onErrorCallback?: (error: string) => void;

  constructor(apiKeys?: { openai?: string; assemblyai?: string }) {
    this.openaiKey = apiKeys?.openai;
    this.assemblyaiKey = apiKeys?.assemblyai;
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (this.onResultCallback) {
          if (finalTranscript) {
            this.onResultCallback(finalTranscript, true);
          }
          if (interimTranscript) {
            this.onResultCallback(interimTranscript, false);
          }
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  async startListening(
    options: STTOptions = {},
    onResult?: (text: string, isFinal: boolean) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const { provider = 'browser', language = 'en-US', continuous = true } = options;

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;

    try {
      switch (provider) {
        case 'openai':
          if (this.openaiKey) {
            await this.startOpenAIListening(options, onResult, onError);
            return;
          }
          break;
        case 'assemblyai':
          if (this.assemblyaiKey) {
            await this.startAssemblyAIListening(options, onResult, onError);
            return;
          }
          break;
        default:
          await this.startBrowserListening({ language, continuous });
      }
    } catch (error) {
      console.warn(`STT provider ${provider} failed, falling back to browser:`, error);
      await this.startBrowserListening({ language, continuous });
    }
  }

  private async startBrowserListening(options: { language: string; continuous: boolean }): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    this.recognition.lang = options.language;
    this.recognition.continuous = options.continuous;
    this.recognition.start();
    this.isListening = true;
  }

  private async startOpenAIListening(
    options: STTOptions,
    onResult?: (text: string, isFinal: boolean) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    // OpenAI Whisper API implementation would go here
    // For now, fall back to browser STT
    console.warn('OpenAI STT not implemented, using browser fallback');
    await this.startBrowserListening({
      language: options.language || 'en-US',
      continuous: options.continuous || true
    });
  }

  private async startAssemblyAIListening(
    options: STTOptions,
    onResult?: (text: string, isFinal: boolean) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    // AssemblyAI implementation would go here
    // For now, fall back to browser STT
    console.warn('AssemblyAI STT not implemented, using browser fallback');
    await this.startBrowserListening({
      language: options.language || 'en-US',
      continuous: options.continuous || true
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  getSupportedLanguages(): string[] {
    // Return common language codes
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA',
      'es-ES', 'es-MX', 'es-AR',
      'fr-FR', 'fr-CA',
      'de-DE', 'it-IT', 'pt-BR', 'pt-PT',
      'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW',
      'ru-RU', 'ar-SA', 'hi-IN'
    ];
  }

  async processVoiceCommand(text: string): Promise<{ command: string; confidence: number }> {
    const commands = [
      { pattern: /(?:read|speak|say)\s+(.+)/i, action: 'read' },
      { pattern: /(?:stop|pause|halt)/i, action: 'stop' },
      { pattern: /(?:next|continue|forward)/i, action: 'next' },
      { pattern: /(?:previous|back|go back)/i, action: 'previous' },
      { pattern: /(?:scroll|move)\s+(up|down|left|right)/i, action: 'scroll' },
      { pattern: /(?:click|select|choose)\s+(.+)/i, action: 'click' },
      { pattern: /(?:find|search|look for)\s+(.+)/i, action: 'search' },
      { pattern: /(?:help|what can you do)/i, action: 'help' }
    ];

    for (const { pattern, action } of commands) {
      const match = text.match(pattern);
      if (match) {
        return {
          command: action,
          confidence: 0.8
        };
      }
    }

    return {
      command: 'unknown',
      confidence: 0.1
    };
  }

  async executeVoiceCommand(command: string, text: string): Promise<void> {
    switch (command) {
      case 'read':
        // Trigger TTS to read the specified content
        const content = text.replace(/^(?:read|speak|say)\s+/i, '');
        chrome.runtime.sendMessage({
          type: 'TTS_READ',
          payload: { text: content }
        });
        break;
      
      case 'stop':
        chrome.runtime.sendMessage({
          type: 'TTS_STOP'
        });
        break;
      
      case 'next':
        // Navigate to next element
        chrome.runtime.sendMessage({
          type: 'KEYBOARD_NAVIGATE',
          payload: { direction: 'next' }
        });
        break;
      
      case 'previous':
        // Navigate to previous element
        chrome.runtime.sendMessage({
          type: 'KEYBOARD_NAVIGATE',
          payload: { direction: 'previous' }
        });
        break;
      
      case 'scroll':
        const direction = text.match(/(up|down|left|right)/i)?.[1]?.toLowerCase();
        if (direction) {
          chrome.runtime.sendMessage({
            type: 'SCROLL',
            payload: { direction }
          });
        }
        break;
      
      case 'click':
        const target = text.replace(/^(?:click|select|choose)\s+/i, '');
        chrome.runtime.sendMessage({
          type: 'CLICK_ELEMENT',
          payload: { target }
        });
        break;
      
      case 'search':
        const query = text.replace(/^(?:find|search|look for)\s+/i, '');
        chrome.runtime.sendMessage({
          type: 'SEARCH',
          payload: { query }
        });
        break;
      
      case 'help':
        chrome.runtime.sendMessage({
          type: 'SHOW_HELP'
        });
        break;
      
      default:
        console.log('Unknown voice command:', text);
    }
  }

  updateAPIKeys(apiKeys: { openai?: string; assemblyai?: string }): void {
    if (apiKeys.openai) this.openaiKey = apiKeys.openai;
    if (apiKeys.assemblyai) this.assemblyaiKey = apiKeys.assemblyai;
  }

  hasCloudCapabilities(): boolean {
    return !!(this.openaiKey || this.assemblyaiKey);
  }
}
