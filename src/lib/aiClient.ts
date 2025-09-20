import { AICaptionResult, APIKeys } from './types.js';

export class AIClient {
  private openaiKey?: string;
  private huggingfaceKey?: string;
  private rateLimitQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private readonly RATE_LIMIT = 60; // requests per minute
  private readonly BATCH_SIZE = 4;

  constructor(apiKeys?: APIKeys) {
    this.openaiKey = apiKeys?.openai;
    this.huggingfaceKey = apiKeys?.huggingface;
  }

  async generateImageCaption(
    imageData: string | ArrayBuffer,
    options: { detailed?: boolean; maxTokens?: number } = {}
  ): Promise<AICaptionResult> {
    const { detailed = false, maxTokens = 150 } = options;

    // Try OpenAI first if available
    if (this.openaiKey) {
      try {
        return await this.generateOpenAICaption(imageData, detailed, maxTokens);
      } catch (error) {
        console.warn('OpenAI caption generation failed:', error);
      }
    }

    // Fallback to HuggingFace if available
    if (this.huggingfaceKey) {
      try {
        return await this.generateHuggingFaceCaption(imageData);
      } catch (error) {
        console.warn('HuggingFace caption generation failed:', error);
      }
    }

    // Final fallback to local processing
    return this.generateLocalCaption(imageData);
  }

  private async generateOpenAICaption(
    imageData: string | ArrayBuffer,
    detailed: boolean,
    maxTokens: number
  ): Promise<AICaptionResult> {
    const model = detailed ? 'gpt-4o' : 'gpt-4o-mini';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: detailed 
                  ? 'Provide a detailed description of this image for accessibility purposes. Include all important visual elements, text, colors, and context.'
                  : 'Provide a brief, concise description of this image for accessibility purposes.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: typeof imageData === 'string' ? imageData : `data:image/jpeg;base64,${this.arrayBufferToBase64(imageData)}`
                }
              }
            ]
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || 'No description available';
    
    return {
      short: detailed ? content : content.substring(0, 100),
      long: detailed ? content : content,
      confidence: 0.9,
      tokens: data.usage?.total_tokens,
      model
    };
  }

  private async generateHuggingFaceCaption(imageData: string | ArrayBuffer): Promise<AICaptionResult> {
    const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.huggingfaceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: typeof imageData === 'string' ? imageData : this.arrayBufferToBase64(imageData)
      })
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();
    const caption = Array.isArray(data) ? data[0]?.generated_text : data.generated_text || 'No description available';
    
    return {
      short: caption,
      long: caption,
      confidence: 0.8,
      model: 'blip-image-captioning-base'
    };
  }

  private generateLocalCaption(imageData: string | ArrayBuffer): AICaptionResult {
    // Basic local fallback - could be enhanced with local ML models
    return {
      short: 'Image detected - description not available',
      long: 'This image could not be automatically described. Please provide an alternative text description.',
      confidence: 0.1,
      model: 'local-fallback'
    };
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async batchProcessImages(
    images: Array<{ data: string | ArrayBuffer; id: string }>,
    options: { detailed?: boolean } = {}
  ): Promise<Record<string, AICaptionResult>> {
    const results: Record<string, AICaptionResult> = {};
    
    // Process in batches to respect rate limits
    for (let i = 0; i < images.length; i += this.BATCH_SIZE) {
      const batch = images.slice(i, i + this.BATCH_SIZE);
      const batchPromises = batch.map(async (image) => {
        const result = await this.generateImageCaption(image.data, options);
        return { id: image.id, result };
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ id, result }) => {
        results[id] = result;
      });
      
      // Rate limiting delay
      if (i + this.BATCH_SIZE < images.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  updateAPIKeys(apiKeys: Partial<APIKeys>): void {
    if (apiKeys.openai) this.openaiKey = apiKeys.openai;
    if (apiKeys.huggingface) this.huggingfaceKey = apiKeys.huggingface;
  }

  hasCloudCapabilities(): boolean {
    return !!(this.openaiKey || this.huggingfaceKey);
  }
}
