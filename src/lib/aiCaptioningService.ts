export interface CaptionRequest {
  imageDataUrl: string;
  imageType: 'photo' | 'diagram' | 'chart' | 'screenshot' | 'unknown';
  complexity: 'simple' | 'moderate' | 'complex';
  ocrText?: string;
  hasText: boolean;
}

export interface CaptionResult {
  shortCaption: string;
  longDescription: string;
  confidence: number;
  model: string;
  processingTime: number;
  provenance: 'openai' | 'huggingface' | 'local';
}

export interface APIKeys {
  openai?: string;
  huggingface?: string;
}

class AICaptioningService {
  private apiKeys: APIKeys = {};
  private rateLimiter = new Map<string, number>();
  private readonly RATE_LIMIT = 60; // requests per minute
  private readonly BATCH_SIZE = 4;

  setAPIKeys(keys: APIKeys): void {
    this.apiKeys = keys;
    console.log('AI Captioning Service - API keys set:', {
      openai: keys.openai ? `${keys.openai.substring(0, 10)}...` : 'none',
      huggingface: keys.huggingface ? `${keys.huggingface.substring(0, 10)}...` : 'none',
      hasOpenAI: !!(keys.openai && keys.openai.trim().length > 0),
      hasHuggingFace: !!(keys.huggingface && keys.huggingface.trim().length > 0)
    });
  }

  private async checkRateLimit(service: string): Promise<boolean> {
    const now = Date.now();
    const minuteAgo = now - 60000;
    
    if (!this.rateLimiter.has(service)) {
      this.rateLimiter.set(service, 0);
    }
    
    const count = this.rateLimiter.get(service)!;
    if (count >= this.RATE_LIMIT) {
      return false;
    }
    
    this.rateLimiter.set(service, count + 1);
    
    // Clean up old entries
    setTimeout(() => {
      const current = this.rateLimiter.get(service) || 0;
      this.rateLimiter.set(service, Math.max(0, current - 1));
    }, 60000);
    
    return true;
  }

  async generateCaption(request: CaptionRequest): Promise<CaptionResult> {
    const startTime = Date.now();
    
    // Check if we have valid API keys
    const hasValidOpenAI = !!(this.apiKeys.openai && this.apiKeys.openai.trim().length > 0);
    const hasValidHuggingFace = !!(this.apiKeys.huggingface && this.apiKeys.huggingface.trim().length > 0);
    
    console.log('Caption generation request:', {
      hasValidOpenAI,
      hasValidHuggingFace,
      imageDataUrlLength: request.imageDataUrl?.length || 0,
      imageType: request.imageType,
      hasText: request.hasText
    });
    
    // Check if image data URL is valid for AI processing
    const isCORSFallback = request.imageDataUrl && 
                          request.imageDataUrl.includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    
    const isDataUrl = request.imageDataUrl && request.imageDataUrl.startsWith('data:image/');
    const isHttpUrl = request.imageDataUrl && request.imageDataUrl.startsWith('http');
    const isHttpsUrl = request.imageDataUrl && request.imageDataUrl.startsWith('https://');
    
    const canUseAI = request.imageDataUrl && 
                     request.imageDataUrl.length > 50 && // Reduced from 100 to allow shorter URLs
                     !request.imageDataUrl.includes('data:image/svg+xml') && // SVG images often cause issues
                     !isCORSFallback && // Don't try AI on CORS fallback images
                     (isDataUrl || isHttpUrl || isHttpsUrl) && // Must be a valid image URL
                     (hasValidOpenAI || hasValidHuggingFace);
    
    console.log('AI Captioning Service - Processing decision:', {
      hasValidOpenAI,
      hasValidHuggingFace,
      imageDataUrlLength: request.imageDataUrl?.length || 0,
      imageDataUrlStart: request.imageDataUrl?.substring(0, 50) || 'none',
      isCORSFallback,
      isDataUrl,
      isHttpUrl,
      isHttpsUrl,
      canUseAI
    });
    
    if (!canUseAI) {
      if (isCORSFallback) {
        console.log('CORS-blocked image detected - using local fallback');
      } else if (!hasValidOpenAI && !hasValidHuggingFace) {
        console.log('No valid API keys - using local fallback');
      } else {
        console.log('Invalid image data URL - using local fallback');
      }
      return this.generateLocalCaption(request, startTime);
    }
    
    // Try OpenAI first if available
    if (hasValidOpenAI && await this.checkRateLimit('openai')) {
      try {
        console.log('Attempting OpenAI captioning...');
        const result = await this.generateOpenAICaption(request, startTime);
        console.log('OpenAI captioning successful');
        return result;
      } catch (error) {
        console.warn('OpenAI captioning failed, trying fallback:', error);
        // If it's a CORS or image processing error, don't try other services
        if (this.isCORSRelatedError(error)) {
          console.log('CORS/Canvas error detected, using local fallback');
          return this.generateLocalCaption(request, startTime);
        }
      }
    }
    
    // Try HuggingFace if available
    if (hasValidHuggingFace && await this.checkRateLimit('huggingface')) {
      try {
        console.log('Attempting HuggingFace captioning...');
        const result = await this.generateHuggingFaceCaption(request, startTime);
        console.log('HuggingFace captioning successful');
        return result;
      } catch (error) {
        console.warn('HuggingFace captioning failed, using local fallback:', error);
        // If it's a CORS or image processing error, don't try other services
        if (this.isCORSRelatedError(error)) {
          console.log('CORS/Canvas error detected, using local fallback');
          return this.generateLocalCaption(request, startTime);
        }
      }
    }
    
    // Fallback to local generation
    console.log('Using local caption generation');
    return this.generateLocalCaption(request, startTime);
  }

  private isCORSRelatedError(error: any): boolean {
    const errorMessage = error.message || error.toString();
    return errorMessage.includes('CORS') || 
           errorMessage.includes('tainted') || 
           errorMessage.includes('canvas') ||
           errorMessage.includes('cross-origin') ||
           errorMessage.includes('security restrictions');
  }

  private async generateOpenAICaption(request: CaptionRequest, startTime: number): Promise<CaptionResult> {
    const model = request.complexity === 'complex' ? 'gpt-4o' : 'gpt-4o-mini';
    
    const prompt = this.buildPrompt(request);
    
    console.log('Sending request to OpenAI:', {
      model,
      prompt: prompt.substring(0, 100) + '...',
      imageDataUrlLength: request.imageDataUrl.length
    });
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`,
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
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: request.imageDataUrl
                }
              }
            ]
          }
        ],
        max_tokens: request.complexity === 'complex' ? 500 : 200,
        temperature: 0.7
      })
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response data:', data);
    
    const content = data.choices[0]?.message?.content || '';
    
    if (!content) {
      throw new Error('No content received from OpenAI API');
    }
    
    const { shortCaption, longDescription } = this.parseCaptionResponse(content);
    
    return {
      shortCaption,
      longDescription,
      confidence: 0.9,
      model,
      processingTime: Date.now() - startTime,
      provenance: 'openai'
    };
  }

  private async generateHuggingFaceCaption(request: CaptionRequest, startTime: number): Promise<CaptionResult> {
    const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.huggingface}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: request.imageDataUrl,
        parameters: {
          max_length: request.complexity === 'complex' ? 100 : 50,
          num_beams: 3
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const caption = Array.isArray(data) ? data[0]?.generated_text : data.generated_text || '';
    
    return {
      shortCaption: caption,
      longDescription: caption,
      confidence: 0.8,
      model: 'blip-image-captioning-large',
      processingTime: Date.now() - startTime,
      provenance: 'huggingface'
    };
  }

  private generateLocalCaption(request: CaptionRequest, startTime: number): CaptionResult {
    // Generate local captions based on image analysis
    let shortCaption = '';
    let longDescription = '';
    let confidence = 0.6;
    let isCORSBlocked = false;
    
    // Check if this is a CORS-blocked image
    const isCORSFallback = request.imageDataUrl && 
                          request.imageDataUrl.includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    
    if (!request.imageDataUrl || request.imageDataUrl.length < 100 || isCORSFallback) {
      isCORSBlocked = true;
      confidence = 0.4; // Lower confidence for CORS-limited images
    }
    
    if (request.hasText && request.ocrText && request.ocrText.trim().length > 0) {
      // If image has text, create caption based on OCR
      const textPreview = request.ocrText.substring(0, 100);
      shortCaption = `Image containing text: "${textPreview}${request.ocrText.length > 100 ? '...' : ''}"`;
      longDescription = `This image contains text that reads: "${request.ocrText}". The text appears to be ${request.imageType === 'chart' ? 'part of a chart or graph' : request.imageType === 'diagram' ? 'part of a diagram' : 'document text'}.`;
      confidence = 0.7; // Higher confidence when we have OCR text
    } else {
      // Generate more detailed generic caption based on image type
      switch (request.imageType) {
        case 'chart':
          shortCaption = 'Chart or graph showing data visualization';
          longDescription = 'This appears to be a chart or graph displaying data in a visual format. The image may contain numerical data, trends, or comparisons presented graphically. This type of visualization is commonly used to represent statistical information, business metrics, or scientific data.';
          break;
        case 'diagram':
          shortCaption = 'Diagram showing process or structure';
          longDescription = 'This appears to be a diagram illustrating a process, structure, or relationship. It may show workflow, organizational structure, or conceptual relationships. Diagrams are often used to explain complex systems, procedures, or hierarchies in a visual format.';
          break;
        case 'screenshot':
          shortCaption = 'Screenshot of interface or application';
          longDescription = 'This appears to be a screenshot showing a user interface, application window, or digital content. It may display software, websites, or digital media. Screenshots are commonly used to demonstrate software functionality, document user interfaces, or share digital content.';
          break;
        case 'photo':
          shortCaption = 'Photograph showing visual content';
          longDescription = 'This appears to be a photograph containing visual content that may be important for understanding the context of the webpage. The image likely contains real-world objects, people, places, or events that are relevant to the page content.';
          break;
        default:
          shortCaption = 'Image showing visual content';
          longDescription = 'This image contains visual content that may be important for understanding the context of the webpage. The image appears to be a visual element that supports or enhances the textual content of the page.';
      }
    }
    
    // Add note about CORS limitation if applicable
    if (isCORSBlocked) {
      longDescription += ' Note: This description was generated locally due to browser security restrictions on cross-origin images. For more detailed AI-powered descriptions, try using images from the same website domain.';
    }
    
    return {
      shortCaption,
      longDescription,
      confidence,
      model: 'local-analysis',
      processingTime: Date.now() - startTime,
      provenance: 'local'
    };
  }

  private buildPrompt(request: CaptionRequest): string {
    const basePrompt = `Generate an accessible description for this image.`;
    
    let contextPrompt = '';
    if (request.hasText && request.ocrText) {
      contextPrompt = ` The image contains text that reads: "${request.ocrText}".`;
    }
    
    const typePrompt = ` This appears to be a ${request.imageType}.`;
    const complexityPrompt = ` Please provide a ${request.complexity === 'simple' ? 'brief' : request.complexity === 'moderate' ? 'detailed' : 'comprehensive'} description.`;
    
    const formatPrompt = ` Respond with two parts:
1. SHORT: A concise caption (1-2 sentences)
2. LONG: A detailed description (2-4 sentences)

Format your response as:
SHORT: [brief caption]
LONG: [detailed description]`;
    
    return basePrompt + contextPrompt + typePrompt + complexityPrompt + formatPrompt;
  }

  private parseCaptionResponse(content: string): { shortCaption: string; longDescription: string } {
    const shortMatch = content.match(/SHORT:\s*(.+?)(?=LONG:|$)/s);
    const longMatch = content.match(/LONG:\s*(.+?)$/s);
    
    return {
      shortCaption: shortMatch ? shortMatch[1].trim() : content.substring(0, 100),
      longDescription: longMatch ? longMatch[1].trim() : content
    };
  }

  async generateBulkCaptions(requests: CaptionRequest[]): Promise<CaptionResult[]> {
    const results: CaptionResult[] = [];
    
    // Process in batches
    for (let i = 0; i < requests.length; i += this.BATCH_SIZE) {
      const batch = requests.slice(i, i + this.BATCH_SIZE);
      const batchPromises = batch.map(request => this.generateCaption(request));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch ${i / this.BATCH_SIZE + 1} failed:`, error);
        // Add fallback results for failed batch
        const fallbackResults = batch.map(request => 
          this.generateLocalCaption(request, Date.now())
        );
        results.push(...fallbackResults);
      }
      
      // Small delay between batches to respect rate limits
      if (i + this.BATCH_SIZE < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  hasCloudCapability(): boolean {
    const hasOpenAI = !!(this.apiKeys.openai && this.apiKeys.openai.trim().length > 0);
    const hasHuggingFace = !!(this.apiKeys.huggingface && this.apiKeys.huggingface.trim().length > 0);
    
    console.log('AI Captioning Service - Cloud capability check:', {
      hasOpenAI,
      hasHuggingFace,
      openaiKeyLength: this.apiKeys.openai?.length || 0,
      huggingfaceKeyLength: this.apiKeys.huggingface?.length || 0,
      openaiKeyStart: this.apiKeys.openai ? this.apiKeys.openai.substring(0, 10) : 'none',
      huggingfaceKeyStart: this.apiKeys.huggingface ? this.apiKeys.huggingface.substring(0, 10) : 'none'
    });
    
    return hasOpenAI || hasHuggingFace;
  }

  getAvailableServices(): string[] {
    const services = [];
    if (this.apiKeys.openai) services.push('OpenAI');
    if (this.apiKeys.huggingface) services.push('HuggingFace');
    return services;
  }

  async testAPIKey(service: 'openai' | 'huggingface'): Promise<boolean> {
    if (!this.apiKeys[service]) {
      console.log(`No ${service} API key available`);
      return false;
    }

    try {
      if (service === 'openai') {
        // Test OpenAI API with a simple request
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.openai}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('OpenAI API key is valid');
          return true;
        } else {
          console.error('OpenAI API key test failed:', response.status, response.statusText);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`${service} API key test failed:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const aiCaptioningService = new AICaptioningService();
