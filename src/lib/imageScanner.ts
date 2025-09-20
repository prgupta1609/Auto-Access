import { ocrService, ImageAnalysisResult } from './ocrService';
import { aiCaptioningService, CaptionRequest, CaptionResult } from './aiCaptioningService';

export interface ImageInfo {
  element: HTMLImageElement;
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  position: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  isVisible: boolean;
  hasAltText: boolean;
  needsDescription: boolean;
}

export interface ImageAnalysis {
  imageInfo: ImageInfo;
  ocrResult?: ImageAnalysisResult;
  captionResult?: CaptionResult;
  processingTime: number;
  error?: string;
}

export interface BulkAnalysisProgress {
  total: number;
  completed: number;
  current: string;
  errors: number;
  results: ImageAnalysis[];
}

class ImageScanner {
  private processedImages = new Set<string>();
  private analysisCache = new Map<string, ImageAnalysis>();
  private isScanning = false;
  private scanObservers: MutationObserver[] = [];

  async scanPage(): Promise<ImageInfo[]> {
    const images = this.findImages();
    return this.analyzeImageInfo(images);
  }

  private findImages(): HTMLImageElement[] {
    // Find all img elements
    const imgElements = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
    
    // Filter out images that shouldn't be processed
    return imgElements.filter(img => {
      // Skip very small images (likely decorative)
      if (img.naturalWidth < 50 || img.naturalHeight < 50) {
        return false;
      }
      
      // Skip images with data URIs that are very small (likely icons)
      if (img.src.startsWith('data:') && img.src.length < 1000) {
        return false;
      }
      
      // Skip images that are hidden
      const style = window.getComputedStyle(img);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }
      
      // Skip images that are too far off-screen
      const rect = img.getBoundingClientRect();
      if (rect.top > window.innerHeight + 1000 || rect.bottom < -1000) {
        return false;
      }
      
      return true;
    });
  }

  private analyzeImageInfo(images: HTMLImageElement[]): ImageInfo[] {
    return images.map((img, index) => {
      const rect = img.getBoundingClientRect();
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      return {
        element: img,
        id: img.id || `autoaccess-img-${index}`,
        src: img.src,
        alt: img.alt || '',
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        position: {
          top: rect.top + scrollY,
          left: rect.left + scrollX,
          right: rect.right + scrollX,
          bottom: rect.bottom + scrollY
        },
        isVisible: this.isElementVisible(img),
        hasAltText: !!img.alt && img.alt.trim().length > 0,
        needsDescription: !img.alt || img.alt.trim().length === 0 || this.isGenericAltText(img.alt)
      };
    });
  }

  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  }

  private isGenericAltText(alt: string): boolean {
    const genericPatterns = [
      /^image$/i,
      /^picture$/i,
      /^photo$/i,
      /^img$/i,
      /^\.(jpg|jpeg|png|gif|svg|webp)$/i,
      /^\d+$/,
      /^[a-f0-9]{8,}$/i, // Hash-like strings
      /^placeholder$/i,
      /^spacer$/i,
      /^divider$/i
    ];
    
    return genericPatterns.some(pattern => pattern.test(alt.trim()));
  }

  private generateBasicDescription(imageInfo: ImageInfo): string {
    const src = imageInfo.src.toLowerCase();
    const alt = imageInfo.alt.toLowerCase();
    
    // Check for common patterns in URL or alt text
    if (src.includes('chart') || src.includes('graph') || alt.includes('chart') || alt.includes('graph')) {
      return 'Chart or graph showing data visualization';
    }
    
    if (src.includes('diagram') || src.includes('flow') || alt.includes('diagram') || alt.includes('flow')) {
      return 'Diagram showing process or structure';
    }
    
    if (src.includes('screenshot') || src.includes('screen') || alt.includes('screenshot')) {
      return 'Screenshot of interface or application';
    }
    
    if (src.includes('logo') || alt.includes('logo')) {
      return 'Logo or brand image';
    }
    
    if (src.includes('icon') || alt.includes('icon')) {
      return 'Icon or symbol';
    }
    
    if (src.includes('banner') || alt.includes('banner')) {
      return 'Banner or header image';
    }
    
    if (src.includes('product') || alt.includes('product')) {
      return 'Product image';
    }
    
    // Check for specific domains and provide context-aware descriptions
    if (src.includes('gettyimages.com') || src.includes('istockphoto.com')) {
      return 'Stock photography image from Getty Images or iStock';
    }
    
    if (src.includes('shutterstock.com')) {
      return 'Stock photography image from Shutterstock';
    }
    
    if (src.includes('unsplash.com')) {
      return 'High-quality photography from Unsplash';
    }
    
    if (src.includes('pexels.com')) {
      return 'Stock photography from Pexels';
    }
    
    if (src.includes('profile') || src.includes('avatar')) {
      return 'Profile picture or avatar image';
    }
    
    if (src.includes('thumbnail') || src.includes('thumb')) {
      return 'Thumbnail or preview image';
    }
    
    // Check image dimensions for hints
    if (imageInfo.width > imageInfo.height * 2) {
      return 'Wide banner or header image';
    }
    
    if (imageInfo.height > imageInfo.width * 2) {
      return 'Tall vertical image';
    }
    
    if (imageInfo.width === imageInfo.height) {
      return 'Square image';
    }
    
    // Default fallback
    return 'Image showing visual content';
  }

  async analyzeImage(imageInfo: ImageInfo): Promise<ImageAnalysis> {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = this.getImageCacheKey(imageInfo);
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }
    
    try {
      // Validate image element
      if (!imageInfo.element || !imageInfo.element.complete) {
        throw new Error('Image not loaded or invalid');
      }
      
      // Check if image is accessible (not CORS blocked)
      if (imageInfo.element.naturalWidth === 0 || imageInfo.element.naturalHeight === 0) {
        throw new Error('Image dimensions are zero - possible CORS issue');
      }
      
      let ocrResult: ImageAnalysisResult | undefined;
      let captionResult: CaptionResult | undefined;
      
      // Try OCR analysis first
      try {
        ocrResult = await ocrService.analyzeImage(imageInfo.element);
        console.log('OCR analysis completed successfully');
      } catch (ocrError) {
        console.warn('OCR analysis failed, continuing without OCR:', ocrError);
        // Continue without OCR - this is not critical
      }
      
      // Try AI captioning if cloud features are available
      try {
        if (aiCaptioningService.hasCloudCapability()) {
          const imageDataUrl = await this.imageToDataUrl(imageInfo.element);
          
          const captionRequest: CaptionRequest = {
            imageDataUrl,
            imageType: ocrResult?.imageType || 'photo',
            complexity: ocrResult?.estimatedComplexity || 'moderate',
            ocrText: ocrResult?.ocr.text || '',
            hasText: ocrResult?.hasText || false
          };
          
          captionResult = await aiCaptioningService.generateCaption(captionRequest);
          console.log('AI captioning completed successfully');
        }
      } catch (captionError) {
        console.warn('AI captioning failed, using fallback:', captionError);
        // Continue with fallback captioning
      }
      
      // If we have neither OCR nor AI caption, generate basic description
      if (!ocrResult && !captionResult) {
        const basicDescription = this.generateBasicDescription(imageInfo);
        captionResult = {
          shortCaption: basicDescription,
          longDescription: `This appears to be a ${basicDescription.toLowerCase()}.`,
          confidence: 0.3,
          model: 'basic-analysis',
          processingTime: 0,
          provenance: 'local'
        };
      }
      
      const analysis: ImageAnalysis = {
        imageInfo,
        ocrResult,
        captionResult,
        processingTime: Date.now() - startTime
      };
      
      // Cache the result
      this.analysisCache.set(cacheKey, analysis);
      
      return analysis;
      
    } catch (error) {
      console.error('Image analysis failed:', error);
      
      // Provide fallback analysis even when everything fails
      const fallbackAnalysis: ImageAnalysis = {
        imageInfo,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      // Try to provide basic description based on image characteristics
      if (imageInfo.hasAltText && !this.isGenericAltText(imageInfo.alt)) {
        // Use existing alt text if it's meaningful
        fallbackAnalysis.captionResult = {
          shortCaption: imageInfo.alt,
          longDescription: `This image shows: ${imageInfo.alt}`,
          confidence: 0.5,
          model: 'existing-alt-text',
          processingTime: 0,
          provenance: 'local'
        };
      } else {
        // Generate basic description based on image type
        const basicDescription = this.generateBasicDescription(imageInfo);
        fallbackAnalysis.captionResult = {
          shortCaption: basicDescription,
          longDescription: `This appears to be a ${basicDescription.toLowerCase()}.`,
          confidence: 0.3,
          model: 'basic-analysis',
          processingTime: 0,
          provenance: 'local'
        };
      }
      
      return fallbackAnalysis;
    }
  }

  async analyzeBulkImages(
    imageInfos: ImageInfo[],
    onProgress?: (progress: BulkAnalysisProgress) => void
  ): Promise<ImageAnalysis[]> {
    if (this.isScanning) {
      throw new Error('Bulk analysis already in progress');
    }
    
    this.isScanning = true;
    const results: ImageAnalysis[] = [];
    let completed = 0;
    let errors = 0;
    
    try {
      for (const imageInfo of imageInfos) {
        if (onProgress) {
          onProgress({
            total: imageInfos.length,
            completed,
            current: imageInfo.src,
            errors,
            results: [...results]
          });
        }
        
        try {
          const analysis = await this.analyzeImage(imageInfo);
          results.push(analysis);
          completed++;
        } catch (error) {
          console.error(`Failed to analyze image ${imageInfo.src}:`, error);
          results.push({
            imageInfo,
            processingTime: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          errors++;
          completed++;
        }
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (onProgress) {
        onProgress({
          total: imageInfos.length,
          completed,
          current: '',
          errors,
          results: [...results]
        });
      }
      
      return results;
      
    } finally {
      this.isScanning = false;
    }
  }

  private async imageToDataUrl(img: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Processing image:', {
          src: img.src,
          isDataUrl: img.src.startsWith('data:'),
          isSameOrigin: this.isSameOrigin(img.src)
        });
        
        // First, try to use the image's src directly if it's a data URL or same-origin
        if (img.src.startsWith('data:') || this.isSameOrigin(img.src)) {
          console.log('Using same-origin image directly:', img.src);
          resolve(img.src);
          return;
        }
        
        console.log('Image detected as cross-origin, using fallback approach');
        
        // For cross-origin images, try multiple approaches
        this.handleCrossOriginImage(img)
          .then(resolve)
          .catch((error) => {
            // If all methods fail, reject with a clear message
            reject(new Error(`Cross-origin image cannot be processed due to browser security restrictions: ${img.src}. ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`Image processing failed: ${error.message}`));
      }
    });
  }

  private isSameOrigin(url: string): boolean {
    try {
      const imgUrl = new URL(url);
      const currentUrl = new URL(window.location.href);
      
      // Check exact origin match
      if (imgUrl.origin === currentUrl.origin) {
        return true;
      }
      
      // Check for common CDN patterns that should be considered same-origin
      const currentHostname = currentUrl.hostname;
      const imgHostname = imgUrl.hostname;
      
      // For Unsplash specifically
      if (currentHostname === 'unsplash.com' && imgHostname === 'images.unsplash.com') {
        console.log('Unsplash same-origin detected');
        return true;
      }
      
      // For Unsplash with www
      if (currentHostname === 'www.unsplash.com' && imgHostname === 'images.unsplash.com') {
        console.log('Unsplash www same-origin detected');
        return true;
      }
      
      // For other common patterns
      if (currentHostname === 'pexels.com' && imgHostname === 'images.pexels.com') {
        return true;
      }
      
      // For subdomain patterns (e.g., cdn.example.com when on example.com)
      if (imgHostname.endsWith('.' + currentHostname) || currentHostname.endsWith('.' + imgHostname)) {
        return true;
      }
      
      console.log('Origin check:', {
        currentOrigin: currentUrl.origin,
        imgOrigin: imgUrl.origin,
        currentHostname,
        imgHostname,
        isSameOrigin: false
      });
      
      return false;
    } catch (error) {
      console.warn('Error checking same-origin:', error);
      return false;
    }
  }

  private async handleCrossOriginImage(img: HTMLImageElement): Promise<string> {
    // For cross-origin images, we'll provide a fallback data URL that indicates CORS limitation
    // This prevents the extension from trying multiple failed approaches
    
    console.log('Cross-origin image detected, using fallback approach');
    
    // Create a simple fallback data URL that indicates CORS limitation
    const fallbackDataUrl = this.createFallbackDataUrl(img);
    
    // Log the limitation but don't throw an error
    console.log('Cross-origin image cannot be processed due to browser security restrictions. Using fallback description.');
    
    return fallbackDataUrl;
  }

  private createFallbackDataUrl(img: HTMLImageElement): string {
    // Create a simple 1x1 pixel data URL that indicates CORS limitation
    // This prevents the AI services from trying to process the actual image
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  // Removed unused proxy methods to eliminate CORS errors

  private async tryCanvasMethod(img: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set canvas size
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        
        // Check if image is accessible
        if (canvas.width === 0 || canvas.height === 0) {
          reject(new Error('Image has zero dimensions'));
          return;
        }
        
        // Try to draw image
        try {
          ctx.drawImage(img, 0, 0);
          
          // Try to convert to data URL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          // Check if data URL is valid
          if (dataUrl && dataUrl.length > 100) {
            resolve(dataUrl);
          } else {
            reject(new Error('Generated data URL is invalid or too short'));
          }
        } catch (drawError) {
          // This is likely a CORS error - provide a helpful message
          reject(new Error(`Canvas tainted by CORS policy. Image from external domain cannot be processed: ${img.src}`));
        }
      } catch (error) {
        reject(new Error(`Canvas processing failed: ${error.message}`));
      }
    });
  }

  private getImageCacheKey(imageInfo: ImageInfo): string {
    // Create a cache key based on image source and dimensions
    return `${imageInfo.src}-${imageInfo.width}-${imageInfo.height}`;
  }

  startWatching(onImageAdded?: (imageInfo: ImageInfo) => void): void {
    // Watch for new images being added to the page
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added element is an image
            if (element.tagName === 'IMG') {
              const imageInfo = this.analyzeImageInfo([element as HTMLImageElement])[0];
              if (imageInfo && onImageAdded) {
                onImageAdded(imageInfo);
              }
            }
            
            // Check for images within the added element
            const images = element.querySelectorAll('img');
            images.forEach(img => {
              const imageInfo = this.analyzeImageInfo([img as HTMLImageElement])[0];
              if (imageInfo && onImageAdded) {
                onImageAdded(imageInfo);
              }
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    this.scanObservers.push(observer);
  }

  stopWatching(): void {
    this.scanObservers.forEach(observer => observer.disconnect());
    this.scanObservers = [];
  }

  clearCache(): void {
    this.analysisCache.clear();
    this.processedImages.clear();
  }

  getCacheSize(): number {
    return this.analysisCache.size;
  }

  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }
}

// Export singleton instance
export const imageScanner = new ImageScanner();
