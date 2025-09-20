import Tesseract from 'tesseract.js';
import { OCRResult } from './types.js';

export class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.loadWorker();
    await this.initializationPromise;
    this.isInitialized = true;
  }

  private async loadWorker(): Promise<void> {
    try {
      this.worker = await Tesseract.createWorker();

      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:()[]{}"\'',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO
      });
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw error;
    }
  }

  async extractText(imageElement: HTMLImageElement | HTMLCanvasElement | string): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      const { data } = await this.worker.recognize(imageElement);
      
      return {
        text: data.text.trim(),
        confidence: data.confidence / 100, // Convert to 0-1 scale
        boundingBox: data.words.length > 0 ? {
          x: Math.min(...data.words.map(w => w.bbox.x0)),
          y: Math.min(...data.words.map(w => w.bbox.y0)),
          width: Math.max(...data.words.map(w => w.bbox.x1)) - Math.min(...data.words.map(w => w.bbox.x0)),
          height: Math.max(...data.words.map(w => w.bbox.y1)) - Math.min(...data.words.map(w => w.bbox.y0))
        } : undefined
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      return {
        text: '',
        confidence: 0
      };
    }
  }

  async extractTextFromImageUrl(imageUrl: string): Promise<OCRResult> {
    return this.extractText(imageUrl);
  }

  async extractTextFromCanvas(canvas: HTMLCanvasElement): Promise<OCRResult> {
    return this.extractText(canvas);
  }

  async extractTextFromImageElement(img: HTMLImageElement): Promise<OCRResult> {
    return this.extractText(img);
  }

  async batchExtractText(images: Array<{ element: HTMLImageElement | HTMLCanvasElement | string; id: string }>): Promise<Record<string, OCRResult>> {
    const results: Record<string, OCRResult> = {};
    
    // Process images in parallel for better performance
    const promises = images.map(async ({ element, id }) => {
      try {
        const result = await this.extractText(element);
        return { id, result };
      } catch (error) {
        console.error(`OCR failed for image ${id}:`, error);
        return { id, result: { text: '', confidence: 0 } };
      }
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ id, result }) => {
      results[id] = result;
    });

    return results;
  }

  async extractTextFromPDF(pdfUrl: string, pageNumber: number = 1): Promise<OCRResult> {
    try {
      // Load PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';

      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const page = await pdf.getPage(pageNumber);
      
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      return await this.extractTextFromCanvas(canvas);
    } catch (error) {
      console.error('PDF OCR extraction failed:', error);
      return {
        text: '',
        confidence: 0
      };
    }
  }

  async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on character patterns
    const patterns = {
      'en': /[a-zA-Z]/g,
      'zh': /[\u4e00-\u9fff]/g,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/g,
      'ko': /[\uac00-\ud7af]/g,
      'ar': /[\u0600-\u06ff]/g,
      'ru': /[\u0400-\u04ff]/g,
      'es': /[ñáéíóúü]/gi,
      'fr': /[àâäéèêëïîôöùûüÿç]/gi,
      'de': /[äöüß]/gi
    };

    const scores: Record<string, number> = {};
    
    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      scores[lang] = matches ? matches.length : 0;
    }

    const totalChars = text.length;
    if (totalChars === 0) return 'en';

    // Return language with highest score
    const bestLang = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];

    return scores[bestLang] / totalChars > 0.1 ? bestLang : 'en';
  }

  async setLanguage(language: string): Promise<void> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      await this.worker.loadLanguage(language);
      await this.worker.initialize(language);
    } catch (error) {
      console.warn(`Failed to load language ${language}, falling back to English:`, error);
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
    }
  }

  getSupportedLanguages(): string[] {
    return [
      'eng', 'spa', 'fra', 'deu', 'ita', 'por', 'rus', 'jpn', 'kor', 'chi_sim', 'chi_tra',
      'ara', 'hin', 'ben', 'tel', 'tam', 'guj', 'kan', 'mal', 'mar', 'pun', 'urd'
    ];
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      this.initializationPromise = null;
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }

  getMemoryUsage(): number {
    // Estimate memory usage (this is approximate)
    return this.worker ? 50 * 1024 * 1024 : 0; // ~50MB for Tesseract worker
  }
}
