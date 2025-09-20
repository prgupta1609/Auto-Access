import { imageScanner, ImageInfo, ImageAnalysis, BulkAnalysisProgress } from './imageScanner';
import { aiCaptioningService, APIKeys } from './aiCaptioningService';
import { ocrService } from './ocrService';

export interface ImageLabelingState {
  isActive: boolean;
  isScanning: boolean;
  isBulkProcessing: boolean;
  images: Map<string, ImageInfo>;
  analyses: Map<string, ImageAnalysis>;
  describeButtons: Map<string, HTMLElement>;
  resultsCards: Map<string, HTMLElement>;
  bulkProgress: BulkAnalysisProgress | null;
}

export interface ImageLabelingOptions {
  autoScan: boolean;
  showDescribeButtons: boolean;
  cloudMode: boolean;
  apiKeys: APIKeys;
  respectReducedMotion: boolean;
}

class ImageLabelingService {
  private state: ImageLabelingState = {
    isActive: false,
    isScanning: false,
    isBulkProcessing: false,
    images: new Map(),
    analyses: new Map(),
    describeButtons: new Map(),
    resultsCards: new Map(),
    bulkProgress: null
  };

  private options: ImageLabelingOptions = {
    autoScan: true,
    showDescribeButtons: true,
    cloudMode: false,
    apiKeys: {},
    respectReducedMotion: false
  };

  private bulkProgressCard: HTMLElement | null = null;
  private beforeAfterToggle: HTMLElement | null = null;
  private originalAltTexts = new Map<string, string>();

  async initialize(options: Partial<ImageLabelingOptions> = {}): Promise<void> {
    this.options = { ...this.options, ...options };
    
    console.log('Image Labeling Service - Initializing with options:', {
      autoScan: this.options.autoScan,
      showDescribeButtons: this.options.showDescribeButtons,
      cloudMode: this.options.cloudMode,
      apiKeys: {
        openai: this.options.apiKeys.openai ? `${this.options.apiKeys.openai.substring(0, 10)}...` : 'none',
        huggingface: this.options.apiKeys.huggingface ? `${this.options.apiKeys.huggingface.substring(0, 10)}...` : 'none'
      }
    });
    
    // Initialize services
    await ocrService.initialize();
    aiCaptioningService.setAPIKeys(this.options.apiKeys);
    
    // Check for reduced motion preference
    this.options.respectReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    console.log('Image Labeling Service - Initialization complete');
  }

  async refreshAPIKeys(): Promise<void> {
    try {
      // Get fresh API keys from storage
      const syncStorage = await chrome.storage.sync.get(['apiKeys']);
      const localStorage = await chrome.storage.local.get(['apiKeys']);
      const apiKeys = syncStorage.apiKeys || localStorage.apiKeys || {};
      
      // Update the service with new keys
      this.options.apiKeys = apiKeys;
      aiCaptioningService.setAPIKeys(apiKeys);
      
      console.log('API keys refreshed:', {
        openai: apiKeys.openai ? `${apiKeys.openai.substring(0, 10)}...` : 'none',
        huggingface: apiKeys.huggingface ? `${apiKeys.huggingface.substring(0, 10)}...` : 'none'
      });
    } catch (error) {
      console.error('Failed to refresh API keys:', error);
    }
  }

  async start(): Promise<void> {
    if (this.state.isActive) return;
    
    this.state.isActive = true;
    console.log('Starting Image Labeling Service...');
    
    // Expose the service to global scope for button callbacks
    (window as any).autoaccessImageLabeling = this;
    
    // Store original alt texts for before/after comparison
    this.storeOriginalAltTexts();
    
    // Create before/after toggle
    this.createBeforeAfterToggle();
    
    // Start watching for new images
    imageScanner.startWatching((imageInfo) => {
      this.addImage(imageInfo);
    });
    
    // Initial scan
    if (this.options.autoScan) {
      await this.scanPage();
    }
  }

  async stop(): Promise<void> {
    if (!this.state.isActive) return;
    
    this.state.isActive = false;
    console.log('Stopping Image Labeling Service...');
    
    // Stop watching
    imageScanner.stopWatching();
    
    // Remove all UI elements
    this.removeAllDescribeButtons();
    this.removeAllResultsCards();
    this.removeBulkProgressCard();
    this.removeBeforeAfterToggle();
    
    // Clear state
    this.state.images.clear();
    this.state.analyses.clear();
    this.state.describeButtons.clear();
    this.state.resultsCards.clear();
    this.state.bulkProgress = null;
  }

  async scanPage(): Promise<void> {
    if (this.state.isScanning) return;
    
    this.state.isScanning = true;
    console.log('Scanning page for images...');
    
    try {
      const imageInfos = await imageScanner.scanPage();
      
      // Add new images
      imageInfos.forEach(imageInfo => {
        this.addImage(imageInfo);
      });
      
      console.log(`Found ${imageInfos.length} images on page`);
      
    } catch (error) {
      console.error('Page scan failed:', error);
    } finally {
      this.state.isScanning = false;
    }
  }

  private addImage(imageInfo: ImageInfo): void {
    this.state.images.set(imageInfo.id, imageInfo);
    
    if (this.options.showDescribeButtons && imageInfo.needsDescription) {
      this.createDescribeButton(imageInfo);
    }
  }

  private createDescribeButton(imageInfo: ImageInfo): void {
    if (this.state.describeButtons.has(imageInfo.id)) return;
    
    // Create button element
    const button = document.createElement('div');
    button.id = `describe-btn-${imageInfo.id}`;
    button.className = 'autoaccess-describe-button';
    
    // Add button content
    button.innerHTML = `
      <button class="px-3 py-2 rounded-lg text-sm font-medium shadow-lg border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 focus:ring-purple-500 hover:from-purple-600 hover:to-pink-600">
        <div class="flex items-center space-x-2">
          <span>🔍</span>
          <span>Describe</span>
        </div>
      </button>
    `;
    
    // Position button
    this.updateButtonPosition(button, imageInfo);
    
    // Add click handler
    button.addEventListener('click', () => {
      this.analyzeImage(imageInfo.id);
    });
    
    // Add to page
    document.body.appendChild(button);
    this.state.describeButtons.set(imageInfo.id, button);
    
    // Add animation if motion is not reduced
    if (!this.options.respectReducedMotion) {
      button.style.transform = 'scale(0)';
      button.style.opacity = '0';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
        button.style.opacity = '1';
      }, 100);
    }
  }

  private updateButtonPosition(button: HTMLElement, imageInfo: ImageInfo): void {
    const rect = imageInfo.element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    button.style.position = 'absolute';
    button.style.top = `${rect.top + scrollY}px`;
    button.style.left = `${rect.left + scrollX}px`;
    button.style.zIndex = '10000';
  }

  async analyzeImage(imageId: string): Promise<void> {
    const imageInfo = this.state.images.get(imageId);
    if (!imageInfo) return;
    
    // Update button to show processing state
    this.updateDescribeButtonState(imageId, 'processing');
    
    try {
      const analysis = await imageScanner.analyzeImage(imageInfo);
      this.state.analyses.set(imageId, analysis);
      
      // Show results card
      this.showResultsCard(imageId, analysis);
      
      // Update button to show completed state
      this.updateDescribeButtonState(imageId, 'completed');
      
    } catch (error) {
      console.error('Image analysis failed:', error);
      this.updateDescribeButtonState(imageId, 'error');
    }
  }

  private updateDescribeButtonState(imageId: string, state: 'processing' | 'completed' | 'error'): void {
    const button = this.state.describeButtons.get(imageId);
    if (!button) return;
    
    const buttonElement = button.querySelector('button');
    if (!buttonElement) return;
    
    switch (state) {
      case 'processing':
        buttonElement.innerHTML = `
          <div class="flex items-center space-x-2">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Analyzing...</span>
          </div>
        `;
        buttonElement.className = 'px-3 py-2 rounded-lg text-sm font-medium shadow-lg border-2 transition-all duration-300 bg-blue-500 text-white border-blue-600';
        break;
        
      case 'completed':
        buttonElement.innerHTML = `
          <div class="flex items-center space-x-2">
            <span>✓</span>
            <span>Described</span>
          </div>
        `;
        buttonElement.className = 'px-3 py-2 rounded-lg text-sm font-medium shadow-lg border-2 transition-all duration-300 bg-green-500 text-white border-green-600';
        break;
        
      case 'error':
        buttonElement.innerHTML = `
          <div class="flex items-center space-x-2">
            <span>⚠</span>
            <span>Error</span>
          </div>
        `;
        buttonElement.className = 'px-3 py-2 rounded-lg text-sm font-medium shadow-lg border-2 transition-all duration-300 bg-red-500 text-white border-red-600';
        break;
    }
  }

  private showResultsCard(imageId: string, analysis: ImageAnalysis): void {
    // Remove existing card if any
    this.removeResultsCard(imageId);
    
    const imageInfo = this.state.images.get(imageId);
    if (!imageInfo) return;
    
    // Create results card
    const card = document.createElement('div');
    card.id = `results-card-${imageId}`;
    card.className = 'autoaccess-results-card';
    
    // Position card as a fixed overlay in the center of the screen
    card.style.position = 'fixed';
    card.style.top = '50%';
    card.style.left = '50%';
    card.style.transform = 'translate(-50%, -50%)';
    card.style.zIndex = '99999';
    card.style.maxWidth = '500px';
    card.style.width = '90vw';
    card.style.maxHeight = '80vh';
    card.style.overflowY = 'auto';
    
    // Add backdrop overlay
    const backdrop = document.createElement('div');
    backdrop.id = `results-backdrop-${imageId}`;
    backdrop.className = 'autoaccess-results-backdrop';
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    backdrop.style.zIndex = '99998';
    backdrop.style.backdropFilter = 'blur(4px)';
    
    // Add click-to-close functionality to backdrop
    backdrop.addEventListener('click', () => {
      this.removeResultsCard(imageId);
    });
    
    // Add card content with enhanced styling
    const shortCaption = analysis.captionResult?.shortCaption || 
                        analysis.ocrResult?.ocr.text || 
                        'No description available';
    const longDescription = analysis.captionResult?.longDescription || '';
    const provenance = analysis.captionResult?.provenance || 'local';
    const confidence = analysis.captionResult?.confidence || 0.6;
    
    // Determine colors based on provenance
    const getProvenanceColors = (prov: string) => {
      switch (prov) {
        case 'openai': return 'from-blue-500 to-indigo-600';
        case 'huggingface': return 'from-purple-500 to-pink-600';
        case 'local': return 'from-green-500 to-teal-600';
        default: return 'from-gray-500 to-gray-600';
      }
    };
    
    const getProvenanceIcon = (prov: string) => {
      switch (prov) {
        case 'openai': return '🤖';
        case 'huggingface': return '🤗';
        case 'local': return '🏠';
        default: return '🔍';
      }
    };
    
    const getConfidenceColor = (conf: number) => {
      if (conf >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
      if (conf >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      return 'bg-red-100 text-red-800 border-red-200';
    };
    
    card.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.2);
        overflow: hidden;
        animation: slideInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, ${provenance === 'openai' ? '#667eea 0%, #764ba2 100%' : provenance === 'huggingface' ? '#a855f7 0%, #ec4899 100%' : '#10b981 0%, #059669 100%'});
          padding: 20px;
          color: white;
          position: relative;
          overflow: hidden;
        ">
          <div style="
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
          "></div>
          <div style="display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                background: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 8px;
                font-size: 24px;
                backdrop-filter: blur(10px);
              ">${getProvenanceIcon(provenance)}</div>
              <div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 600;">AI Image Analysis</h3>
                <div style="
                  background: rgba(255, 255, 255, 0.2);
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 500;
                  margin-top: 4px;
                  backdrop-filter: blur(10px);
                ">${provenance.toUpperCase()}</div>
              </div>
            </div>
            <button onclick="this.closest('.autoaccess-results-card').remove()" style="
              background: rgba(255, 255, 255, 0.2);
              border: none;
              border-radius: 8px;
              padding: 8px;
              color: white;
              cursor: pointer;
              font-size: 16px;
              backdrop-filter: blur(10px);
              transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✕</button>
          </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 24px;">
          <!-- AI Description Section -->
          <div style="margin-bottom: 20px;">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;
            ">
              <span style="font-size: 16px;">🎨</span>
              <label style="font-weight: 600; color: #374151; font-size: 14px;">AI Description</label>
            </div>
            <div style="
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border: 2px solid #0ea5e9;
              border-radius: 16px;
              padding: 16px;
              position: relative;
              overflow: hidden;
            ">
              <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #0ea5e9, #3b82f6, #8b5cf6);
                animation: shimmer 2s infinite;
              "></div>
              <p style="
                margin: 0;
                color: #1e40af;
                font-weight: 500;
                font-size: 15px;
                line-height: 1.5;
              ">${shortCaption}</p>
              ${longDescription && longDescription !== shortCaption ? `
                <details style="margin-top: 12px;">
                  <summary style="
                    color: #0ea5e9;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    list-style: none;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                  " onmouseover="this.style.color='#0284c7'" onmouseout="this.style.color='#0ea5e9'">
                    <span>▼</span> Show detailed description
                  </summary>
                  <div style="
                    margin-top: 12px;
                    padding-left: 16px;
                    border-left: 3px solid #0ea5e9;
                    background: rgba(14, 165, 233, 0.05);
                    border-radius: 8px;
                    padding: 12px;
                  ">
                    <p style="
                      margin: 0;
                      color: #374151;
                      font-size: 14px;
                      line-height: 1.6;
                    ">${longDescription}</p>
                  </div>
                </details>
              ` : ''}
            </div>
            <div style="
              display: flex;
              align-items: center;
              gap: 12px;
              margin-top: 12px;
            ">
              <span style="
                background: ${confidence >= 0.8 ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : confidence >= 0.6 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'linear-gradient(135deg, #fee2e2, #fecaca)'};
                color: ${confidence >= 0.8 ? '#166534' : confidence >= 0.6 ? '#92400e' : '#991b1b'};
                border: 1px solid ${confidence >= 0.8 ? '#16a34a' : confidence >= 0.6 ? '#d97706' : '#dc2626'};
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
              ">${Math.round(confidence * 100)}% confidence</span>
              <span style="
                color: #6b7280;
                font-size: 12px;
                background: #f3f4f6;
                padding: 4px 8px;
                border-radius: 8px;
              ">${analysis.processingTime}ms</span>
            </div>
          </div>
          
          
          <!-- Action Buttons -->
          <div style="
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          ">
            <button onclick="this.closest('.autoaccess-results-card').remove()" style="
              background: #f3f4f6;
              border: 2px solid #d1d5db;
              color: #374151;
              padding: 12px 20px;
              border-radius: 12px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            " onmouseover="this.style.background='#e5e7eb'; this.style.borderColor='#9ca3af'" onmouseout="this.style.background='#f3f4f6'; this.style.borderColor='#d1d5db'">
              Cancel
            </button>
            <button onclick="if(window.autoaccessImageLabeling && window.autoaccessImageLabeling.acceptDescription) { window.autoaccessImageLabeling.acceptDescription('${imageId}', '${shortCaption.replace(/'/g, "\\'")}'); } else { console.error('AutoAccess service not available'); }" style="
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border: none;
              color: white;
              padding: 12px 24px;
              border-radius: 12px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
              transition: all 0.2s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(16, 185, 129, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)'">
              ✓ Accept & Save
            </button>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes slideInScale {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, -20px) rotate(180deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      </style>
    `;
    
    // Add backdrop and card to page
    document.body.appendChild(backdrop);
    document.body.appendChild(card);
    this.state.resultsCards.set(imageId, card);
    
    // Add animation if motion is not reduced
    if (!this.options.respectReducedMotion) {
      backdrop.style.opacity = '0';
      card.style.opacity = '0';
      card.style.transform = 'translate(-50%, -50%) scale(0.8)';
      setTimeout(() => {
        backdrop.style.opacity = '1';
        card.style.opacity = '1';
        card.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 100);
    }
  }

  async acceptDescription(imageId: string, altText: string): Promise<void> {
    try {
      const imageInfo = this.state.images.get(imageId);
      if (!imageInfo) {
        console.warn(`Image info not found for ID: ${imageId}`);
        return;
      }
      
      // Update alt text
      imageInfo.element.alt = altText;
      
      // Save to storage
      await this.saveAltText(imageId, altText);
      
      // Remove results card
      this.removeResultsCard(imageId);
      
      // Update button state
      this.updateDescribeButtonState(imageId, 'completed');
      
      console.log(`Updated alt text for image ${imageId}: ${altText}`);
    } catch (error) {
      console.error('Error in acceptDescription:', error);
    }
  }

  async describeAllImages(): Promise<void> {
    if (this.state.isBulkProcessing) return;
    
    this.state.isBulkProcessing = true;
    console.log('Starting bulk image analysis...');
    
    // Get all images that need description
    const imagesToAnalyze = Array.from(this.state.images.values())
      .filter(img => img.needsDescription);
    
    if (imagesToAnalyze.length === 0) {
      console.log('No images need description');
      this.state.isBulkProcessing = false;
      return;
    }
    
    // Show progress card
    this.showBulkProgressCard();
    
    try {
      // Perform bulk analysis
      await imageScanner.analyzeBulkImages(
        imagesToAnalyze,
        (progress) => {
          this.state.bulkProgress = progress;
          this.updateBulkProgressCard(progress);
        }
      );
      
      console.log('Bulk analysis completed');
      
    } catch (error) {
      console.error('Bulk analysis failed:', error);
    } finally {
      this.state.isBulkProcessing = false;
    }
  }

  private showBulkProgressCard(): void {
    this.removeBulkProgressCard();
    
    this.bulkProgressCard = document.createElement('div');
    this.bulkProgressCard.id = 'autoaccess-bulk-progress';
    this.bulkProgressCard.className = 'fixed top-4 right-4 z-10002 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md';
    
    document.body.appendChild(this.bulkProgressCard);
  }

  private updateBulkProgressCard(progress: BulkAnalysisProgress): void {
    if (!this.bulkProgressCard) return;
    
    const percentage = Math.round((progress.completed / progress.total) * 100);
    const isComplete = progress.completed >= progress.total;
    
    this.bulkProgressCard.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <span class="text-2xl">🚀</span>
          <h3 class="font-semibold text-gray-800">Bulk Image Analysis</h3>
        </div>
        ${!isComplete ? '<button class="text-gray-400 hover:text-gray-600 transition-colors" onclick="window.autoaccessImageLabeling.cancelBulkAnalysis()">✕</button>' : ''}
      </div>
      
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Progress</span>
          <span class="text-sm text-gray-500">${progress.completed} / ${progress.total}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out" style="width: ${percentage}%"></div>
        </div>
        <div class="flex items-center justify-between mt-1">
          <span class="text-xs text-gray-500">${percentage}% complete</span>
          ${progress.errors > 0 ? `<span class="text-xs text-red-500">${progress.errors} errors</span>` : ''}
        </div>
      </div>
      
      ${progress.current && !isComplete ? `
        <div class="mb-4">
          <div class="flex items-center space-x-2">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span class="text-sm text-gray-600">Processing...</span>
          </div>
          <p class="text-xs text-gray-500 mt-1 truncate" title="${progress.current}">${progress.current}</p>
        </div>
      ` : ''}
      
      ${isComplete ? `
        <div class="mb-4">
          <div class="flex items-center space-x-2 mb-2">
            <span class="text-green-500">✓</span>
            <span class="text-sm font-medium text-gray-700">Analysis Complete!</span>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="text-center p-2 bg-green-50 rounded-lg">
              <div class="font-semibold text-green-700">${progress.results.filter(r => !r.error).length}</div>
              <div class="text-green-600">Successful</div>
            </div>
            ${progress.errors > 0 ? `
              <div class="text-center p-2 bg-red-50 rounded-lg">
                <div class="font-semibold text-red-700">${progress.errors}</div>
                <div class="text-red-600">Failed</div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
      
      <div class="flex justify-end">
        <button class="px-4 py-2 ${isComplete ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg text-sm font-medium transition-colors" onclick="window.autoaccessImageLabeling.${isComplete ? 'closeBulkProgress' : 'cancelBulkAnalysis'}()">
          ${isComplete ? 'Close' : 'Cancel'}
        </button>
      </div>
    `;
  }

  private removeBulkProgressCard(): void {
    if (this.bulkProgressCard) {
      this.bulkProgressCard.remove();
      this.bulkProgressCard = null;
    }
  }

  private createBeforeAfterToggle(): void {
    this.removeBeforeAfterToggle();
    
    this.beforeAfterToggle = document.createElement('div');
    this.beforeAfterToggle.id = 'autoaccess-before-after-toggle';
    this.beforeAfterToggle.className = 'fixed bottom-4 right-4 z-10002 bg-white rounded-lg shadow-lg border border-gray-200 p-3';
    
    this.beforeAfterToggle.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="text-sm font-medium text-gray-700">Demo Mode:</span>
        <button id="before-after-btn" class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
          Show Original
        </button>
      </div>
    `;
    
    // Add click handler
    const button = this.beforeAfterToggle.querySelector('#before-after-btn');
    if (button) {
      button.addEventListener('click', () => {
        this.toggleBeforeAfter();
      });
    }
    
    document.body.appendChild(this.beforeAfterToggle);
  }

  private toggleBeforeAfter(): void {
    const button = this.beforeAfterToggle?.querySelector('#before-after-btn');
    if (!button) return;
    
    const isShowingOriginal = button.textContent === 'Show Original';
    
    if (isShowingOriginal) {
      // Show original alt texts
      this.state.images.forEach((imageInfo, id) => {
        const originalAlt = this.originalAltTexts.get(id);
        if (originalAlt !== undefined) {
          imageInfo.element.alt = originalAlt;
        }
      });
      button.textContent = 'Show Enhanced';
      button.className = 'px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors';
    } else {
      // Show enhanced alt texts
      this.state.images.forEach((imageInfo, id) => {
        const analysis = this.state.analyses.get(id);
        if (analysis) {
          const enhancedAlt = analysis.captionResult?.shortCaption || 
                             analysis.ocrResult?.ocr.text || 
                             imageInfo.element.alt;
          imageInfo.element.alt = enhancedAlt;
        }
      });
      button.textContent = 'Show Original';
      button.className = 'px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors';
    }
  }

  private removeBeforeAfterToggle(): void {
    if (this.beforeAfterToggle) {
      this.beforeAfterToggle.remove();
      this.beforeAfterToggle = null;
    }
  }

  private storeOriginalAltTexts(): void {
    this.originalAltTexts.clear();
    this.state.images.forEach((imageInfo, id) => {
      this.originalAltTexts.set(id, imageInfo.element.alt);
    });
  }

  private removeAllDescribeButtons(): void {
    this.state.describeButtons.forEach(button => button.remove());
    this.state.describeButtons.clear();
  }

  private removeAllResultsCards(): void {
    this.state.resultsCards.forEach(card => card.remove());
    this.state.resultsCards.clear();
  }

  private removeResultsCard(imageId: string): void {
    const card = this.state.resultsCards.get(imageId);
    if (card) {
      card.remove();
      this.state.resultsCards.delete(imageId);
    }
    
    // Also remove backdrop if it exists
    const backdrop = document.getElementById(`results-backdrop-${imageId}`);
    if (backdrop) {
      backdrop.remove();
    }
  }

  private async saveAltText(imageId: string, altText: string): Promise<void> {
    try {
      const storage = await chrome.storage.local.get(['imageAltTexts']);
      const imageAltTexts = storage.imageAltTexts || {};
      imageAltTexts[imageId] = {
        altText,
        timestamp: Date.now(),
        url: window.location.href
      };
      await chrome.storage.local.set({ imageAltTexts });
    } catch (error) {
      console.error('Failed to save alt text:', error);
    }
  }

  // Public methods for global access
  cancelBulkAnalysis(): void {
    this.state.isBulkProcessing = false;
    this.removeBulkProgressCard();
  }

  closeBulkProgress(): void {
    this.removeBulkProgressCard();
  }

  getState(): ImageLabelingState {
    return { ...this.state };
  }

  getOptions(): ImageLabelingOptions {
    return { ...this.options };
  }
}

// Export singleton instance
export const imageLabelingService = new ImageLabelingService();

// Make service globally accessible for inline event handlers
(window as any).autoaccessImageLabeling = imageLabelingService;
