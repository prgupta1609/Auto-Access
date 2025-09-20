import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIClient } from '../../src/lib/aiClient';

describe('AIClient', () => {
  let aiClient: AIClient;
  let mockFetch: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.mocked(fetch);
    aiClient = new AIClient();
  });

  describe('generateImageCaption', () => {
    it('should generate caption with OpenAI when API key is available', async () => {
      const apiKeys = { openai: 'sk-test-key' };
      aiClient.updateAPIKeys(apiKeys);

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'A beautiful sunset over mountains' } }],
          usage: { total_tokens: 50 }
        })
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await aiClient.generateImageCaption('data:image/jpeg;base64,test');

      expect(result).toEqual({
        short: 'A beautiful sunset over mountains',
        long: 'A beautiful sunset over mountains',
        confidence: 0.9,
        tokens: 50,
        model: 'gpt-4o-mini'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer sk-test-key',
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should fall back to local processing when no API keys are available', async () => {
      const result = await aiClient.generateImageCaption('data:image/jpeg;base64,test');

      expect(result).toEqual({
        short: 'Image detected - description not available',
        long: 'This image could not be automatically described. Please provide an alternative text description.',
        confidence: 0.1,
        model: 'local-fallback'
      });
    });

    it('should handle OpenAI API errors gracefully', async () => {
      const apiKeys = { openai: 'sk-test-key' };
      aiClient.updateAPIKeys(apiKeys);

      const mockResponse = {
        ok: false,
        status: 401
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await aiClient.generateImageCaption('data:image/jpeg;base64,test');

      expect(result).toEqual({
        short: 'Image detected - description not available',
        long: 'This image could not be automatically described. Please provide an alternative text description.',
        confidence: 0.1,
        model: 'local-fallback'
      });
    });
  });

  describe('batchProcessImages', () => {
    it('should process multiple images in batches', async () => {
      const images = [
        { data: 'image1', id: 'img1' },
        { data: 'image2', id: 'img2' },
        { data: 'image3', id: 'img3' },
        { data: 'image4', id: 'img4' },
        { data: 'image5', id: 'img5' }
      ];

      const result = await aiClient.batchProcessImages(images);

      expect(Object.keys(result)).toHaveLength(5);
      expect(result.img1).toBeDefined();
      expect(result.img2).toBeDefined();
      expect(result.img3).toBeDefined();
      expect(result.img4).toBeDefined();
      expect(result.img5).toBeDefined();
    });
  });

  describe('hasCloudCapabilities', () => {
    it('should return false when no API keys are set', () => {
      expect(aiClient.hasCloudCapabilities()).toBe(false);
    });

    it('should return true when OpenAI key is set', () => {
      aiClient.updateAPIKeys({ openai: 'sk-test-key' });
      expect(aiClient.hasCloudCapabilities()).toBe(true);
    });

    it('should return true when HuggingFace key is set', () => {
      aiClient.updateAPIKeys({ huggingface: 'hf-test-key' });
      expect(aiClient.hasCloudCapabilities()).toBe(true);
    });
  });
});
