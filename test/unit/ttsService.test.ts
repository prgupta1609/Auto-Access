import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TTSService } from '../../src/lib/ttsService';

describe('TTSService', () => {
  let ttsService: TTSService;
  let mockSpeechSynthesis: any;
  let mockUtterance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUtterance = {
      text: '',
      voice: null,
      rate: 1,
      pitch: 1,
      volume: 1,
      onend: null,
      onerror: null,
      onboundary: null
    };

    mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => [
        { name: 'English (US)', lang: 'en-US' },
        { name: 'English (UK)', lang: 'en-GB' }
      ])
    };

    global.speechSynthesis = mockSpeechSynthesis;
    global.SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => {
      mockUtterance.text = text;
      return mockUtterance;
    });

    ttsService = new TTSService();
  });

  describe('speak', () => {
    it('should speak text using browser TTS by default', async () => {
      const speakPromise = ttsService.speak('Hello world');
      
      // Simulate utterance end
      setTimeout(() => {
        if (mockUtterance.onend) {
          mockUtterance.onend();
        }
      }, 100);

      await speakPromise;

      expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(mockUtterance);
      expect(mockUtterance.text).toBe('Hello world');
    });

    it('should handle word highlighting callback', async () => {
      const highlightCallback = vi.fn();
      
      const speakPromise = ttsService.speak('Hello world', {}, highlightCallback);
      
      // Simulate word boundary event
      setTimeout(() => {
        if (mockUtterance.onboundary) {
          mockUtterance.onboundary({ name: 'word' });
        }
      }, 100);

      // Simulate utterance end
      setTimeout(() => {
        if (mockUtterance.onend) {
          mockUtterance.onend();
        }
      }, 200);

      await speakPromise;

      expect(highlightCallback).toHaveBeenCalled();
    });

    it('should handle speech synthesis errors', async () => {
      const speakPromise = ttsService.speak('Hello world');
      
      // Simulate error
      setTimeout(() => {
        if (mockUtterance.onerror) {
          mockUtterance.onerror({ error: 'network' });
        }
      }, 100);

      await expect(speakPromise).rejects.toThrow('Speech synthesis error: network');
    });
  });

  describe('pause and resume', () => {
    it('should pause speech synthesis', () => {
      ttsService.pause();
      expect(mockSpeechSynthesis.pause).toHaveBeenCalled();
    });

    it('should resume speech synthesis', () => {
      ttsService.resume();
      expect(mockSpeechSynthesis.resume).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop speech synthesis and reset state', () => {
      ttsService.stop();
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(ttsService.isCurrentlyPlaying()).toBe(false);
    });
  });

  describe('getAvailableVoices', () => {
    it('should return available voices', () => {
      const voices = ttsService.getAvailableVoices();
      expect(voices).toHaveLength(2);
      expect(voices[0].name).toBe('English (US)');
      expect(voices[1].name).toBe('English (UK)');
    });
  });

  describe('highlightWordInElement', () => {
    it('should highlight word in element', () => {
      const element = document.createElement('div');
      element.textContent = 'Hello world test';
      document.body.appendChild(element);

      ttsService.highlightWordInElement(element, 1);

      // Check if highlighting was applied
      const highlightedElements = element.querySelectorAll('.tts-highlight');
      expect(highlightedElements.length).toBeGreaterThan(0);

      document.body.removeChild(element);
    });
  });

  describe('hasCloudCapabilities', () => {
    it('should return false when no API keys are set', () => {
      expect(ttsService.hasCloudCapabilities()).toBe(false);
    });

    it('should return true when OpenAI key is set', () => {
      ttsService.updateAPIKeys({ openai: 'sk-test-key' });
      expect(ttsService.hasCloudCapabilities()).toBe(true);
    });

    it('should return true when ElevenLabs key is set', () => {
      ttsService.updateAPIKeys({ elevenlabs: 'el-test-key' });
      expect(ttsService.hasCloudCapabilities()).toBe(true);
    });
  });
});
