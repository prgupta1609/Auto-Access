import { TTSOptions } from './types.js';

export class TTSService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;
  private currentWordIndex = 0;
  private wordElements: HTMLElement[] = [];
  private openaiKey?: string;
  private elevenlabsKey?: string;

  constructor(apiKeys?: { openai?: string; elevenlabs?: string }) {
    this.openaiKey = apiKeys?.openai;
    this.elevenlabsKey = apiKeys?.elevenlabs;
  }

  async speak(
    text: string,
    options: TTSOptions = {},
    highlightCallback?: (wordIndex: number) => void
  ): Promise<void> {
    if (this.isPlaying) {
      this.stop();
    }

    const { provider = 'browser', voice, rate = 1, pitch = 1, volume = 1 } = options;

    try {
      switch (provider) {
        case 'openai':
          if (this.openaiKey) {
            await this.speakWithOpenAI(text, options, highlightCallback);
            return;
          }
          break;
        case 'elevenlabs':
          if (this.elevenlabsKey) {
            await this.speakWithElevenLabs(text, options, highlightCallback);
            return;
          }
          break;
        default:
          await this.speakWithBrowser(text, { voice, rate, pitch, volume }, highlightCallback);
      }
    } catch (error) {
      console.warn(`TTS provider ${provider} failed, falling back to browser:`, error);
      await this.speakWithBrowser(text, { voice, rate, pitch, volume }, highlightCallback);
    }
  }

  private async speakWithBrowser(
    text: string,
    options: { voice?: string; rate: number; pitch: number; volume: number },
    highlightCallback?: (wordIndex: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice if specified
      if (options.voice) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.rate = options.rate;
      utterance.pitch = options.pitch;
      utterance.volume = options.volume;

      // Word highlighting
      if (highlightCallback) {
        const words = text.split(/\s+/);
        let currentWordIndex = 0;

        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            highlightCallback(currentWordIndex);
            currentWordIndex++;
          }
        };
      }

      utterance.onend = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isPlaying = false;
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.isPlaying = true;
      speechSynthesis.speak(utterance);
    });
  }

  private async speakWithOpenAI(
    text: string,
    options: TTSOptions,
    highlightCallback?: (wordIndex: number) => void
  ): Promise<void> {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: options.voice || 'alloy',
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Word highlighting simulation
    if (highlightCallback) {
      const words = text.split(/\s+/);
      const wordDuration = audio.duration / words.length;
      
      words.forEach((_, index) => {
        setTimeout(() => {
          highlightCallback(index);
        }, index * wordDuration * 1000);
      });
    }

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.isPlaying = false;
        resolve();
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        this.isPlaying = false;
        reject(new Error('OpenAI TTS audio playback failed'));
      };

      this.isPlaying = true;
      audio.play();
    });
  }

  private async speakWithElevenLabs(
    text: string,
    options: TTSOptions,
    highlightCallback?: (wordIndex: number) => void
  ): Promise<void> {
    // ElevenLabs implementation would go here
    // For now, fall back to browser TTS
    console.warn('ElevenLabs TTS not implemented, using browser fallback');
    await this.speakWithBrowser(text, {
      voice: options.voice,
      rate: options.rate || 1,
      pitch: options.pitch || 1,
      volume: options.volume || 1
    }, highlightCallback);
  }

  pause(): void {
    if (this.isPlaying && this.currentUtterance) {
      speechSynthesis.pause();
    }
  }

  resume(): void {
    if (this.isPlaying && this.currentUtterance) {
      speechSynthesis.resume();
    }
  }

  stop(): void {
    if (this.isPlaying) {
      speechSynthesis.cancel();
      this.isPlaying = false;
      this.currentUtterance = null;
      this.currentWordIndex = 0;
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }

  highlightWordInElement(element: HTMLElement, wordIndex: number): void {
    // Remove previous highlights
    this.wordElements.forEach(el => {
      el.classList.remove('tts-highlight');
    });

    // Find and highlight the current word
    const words = element.textContent?.split(/\s+/) || [];
    if (wordIndex < words.length) {
      const textNodes = this.getTextNodes(element);
      let currentIndex = 0;
      
      for (const node of textNodes) {
        const nodeWords = node.textContent?.split(/\s+/) || [];
        if (currentIndex + nodeWords.length > wordIndex) {
          const wordInNode = wordIndex - currentIndex;
          const wordElement = this.wrapWordInNode(node, wordInNode);
          if (wordElement) {
            wordElement.classList.add('tts-highlight');
            this.wordElements.push(wordElement);
          }
          break;
        }
        currentIndex += nodeWords.length;
      }
    }
  }

  private getTextNodes(element: HTMLElement): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.textContent?.trim()) {
        textNodes.push(node as Text);
      }
    }

    return textNodes;
  }

  private wrapWordInNode(textNode: Text, wordIndex: number): HTMLElement | null {
    const words = textNode.textContent?.split(/\s+/) || [];
    if (wordIndex >= words.length) return null;

    const beforeWords = words.slice(0, wordIndex).join(' ');
    const targetWord = words[wordIndex];
    const afterWords = words.slice(wordIndex + 1).join(' ');

    const span = document.createElement('span');
    span.className = 'tts-word';
    span.textContent = targetWord;

    const parent = textNode.parentNode;
    if (!parent) return null;

    // Replace the text node with the new structure
    const beforeText = beforeWords ? document.createTextNode(beforeWords + ' ') : null;
    const afterText = afterWords ? document.createTextNode(' ' + afterWords) : null;

    if (beforeText) parent.insertBefore(beforeText, textNode);
    parent.insertBefore(span, textNode);
    if (afterText) parent.insertBefore(afterText, textNode);
    parent.removeChild(textNode);

    return span;
  }

  updateAPIKeys(apiKeys: { openai?: string; elevenlabs?: string }): void {
    if (apiKeys.openai) this.openaiKey = apiKeys.openai;
    if (apiKeys.elevenlabs) this.elevenlabsKey = apiKeys.elevenlabs;
  }

  hasCloudCapabilities(): boolean {
    return !!(this.openaiKey || this.elevenlabsKey);
  }
}
