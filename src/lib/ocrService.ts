import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  processingTime: number;
}

export interface ImageAnalysisResult {
  ocr: OCRResult;
  hasText: boolean;
  imageType: 'photo' | 'diagram' | 'chart' | 'screenshot' | 'unknown';
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
}

class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      console.log('Initializing OCR service...');
      
      this.worker = await Tesseract.createWorker('eng');
      
      // Configure for better accuracy
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:()[]{}"\'@#$%^&*+-=<>/\\|`~_ ',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY
      });

      this.isInitialized = true;
      console.log('OCR service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw error;
    }
  }

  async analyzeImage(imageElement: HTMLImageElement): Promise<ImageAnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR service not initialized');
    }

    const startTime = Date.now();

    try {
      // Check if image is accessible and not CORS-blocked
      if (imageElement.naturalWidth === 0 || imageElement.naturalHeight === 0) {
        throw new Error('Image has zero dimensions - possible CORS issue');
      }

      // Try to perform OCR directly on the image element first
      let data;
      try {
        const { data: directData } = await this.worker.recognize(imageElement);
        data = directData;
      } catch (directError) {
        console.warn('Direct OCR failed, trying canvas method:', directError);
        
        // Fallback to canvas method
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        // Set canvas size to image size
        canvas.width = imageElement.naturalWidth || imageElement.width;
        canvas.height = imageElement.naturalHeight || imageElement.height;

        // Draw image to canvas
        ctx.drawImage(imageElement, 0, 0);

        // Perform OCR on canvas
        const { data: canvasData } = await this.worker.recognize(canvas);
        data = canvasData;
      }
      
      const processingTime = Date.now() - startTime;

      const ocrResult: OCRResult = {
        text: data.text.trim(),
        confidence: data.confidence,
        words: data.words.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: {
            x0: word.bbox.x0,
            y0: word.bbox.y0,
            x1: word.bbox.x1,
            y1: word.bbox.y1
          }
        })),
        processingTime
      };

      // Analyze image characteristics
      const imageType = this.detectImageType(imageElement, ocrResult);
      const estimatedComplexity = this.estimateComplexity(ocrResult, imageElement);
      const hasText = ocrResult.text.length > 0 && ocrResult.confidence > 30;

      return {
        ocr: ocrResult,
        hasText,
        imageType,
        estimatedComplexity
      };

    } catch (error) {
      console.warn('OCR analysis failed, returning fallback result:', error);
      
      // Return a fallback result instead of throwing
      const processingTime = Date.now() - startTime;
      const imageType = this.detectImageType(imageElement, { text: '', confidence: 0, words: [], processingTime: 0 });
      const estimatedComplexity = this.estimateComplexity({ text: '', confidence: 0, words: [], processingTime: 0 }, imageElement);
      
      return {
        ocr: {
          text: '',
          confidence: 0,
          words: [],
          processingTime
        },
        hasText: false,
        imageType,
        estimatedComplexity,
        error: error instanceof Error ? error.message : 'OCR analysis failed'
      };
    }
  }

  private detectImageType(imageElement: HTMLImageElement, ocrResult: OCRResult): ImageAnalysisResult['imageType'] {
    const src = imageElement.src.toLowerCase();
    const alt = imageElement.alt.toLowerCase();
    
    // Check for common patterns
    if (src.includes('chart') || src.includes('graph') || alt.includes('chart') || alt.includes('graph')) {
      return 'chart';
    }
    
    if (src.includes('diagram') || src.includes('flow') || alt.includes('diagram') || alt.includes('flow')) {
      return 'diagram';
    }
    
    if (src.includes('screenshot') || src.includes('screen') || alt.includes('screenshot')) {
      return 'screenshot';
    }
    
    // If it has significant text, might be a diagram or chart
    if (ocrResult.text.length > 50 && ocrResult.confidence > 60) {
      return 'diagram';
    }
    
    // Default to photo
    return 'photo';
  }

  private estimateComplexity(ocrResult: OCRResult, imageElement: HTMLImageElement): ImageAnalysisResult['estimatedComplexity'] {
    const textLength = ocrResult.text.length;
    const wordCount = ocrResult.words.length;
    const imageSize = imageElement.naturalWidth * imageElement.naturalHeight;
    
    // Simple heuristics for complexity
    if (textLength < 20 && wordCount < 5) {
      return 'simple';
    }
    
    if (textLength > 100 || wordCount > 20 || imageSize > 1000000) {
      return 'complex';
    }
    
    return 'moderate';
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }
}

// Export singleton instance
export const ocrService = new OCRService();
