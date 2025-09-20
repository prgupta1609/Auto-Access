import { StorageBudget } from './types.js';

export class WASMLoader {
  private loadedModels: Map<string, any> = new Map();
  private storageBudget: StorageBudget = { used: 0, available: 0, percentage: 0 };
  private readonly MAX_STORAGE_MB = 50;
  private readonly WARNING_THRESHOLD_MB = 40;

  async loadModel(modelName: string, modelUrl: string, options: {
    onProgress?: (progress: number) => void;
    onError?: (error: Error) => void;
  } = {}): Promise<any> {
    if (this.loadedModels.has(modelName)) {
      return this.loadedModels.get(modelName);
    }

    try {
      // Check storage budget before loading
      await this.updateStorageBudget();
      
      if (this.storageBudget.percentage > 80) {
        const warning = `Storage usage is at ${this.storageBudget.percentage}%. Large models may not fit.`;
        console.warn(warning);
        if (options.onError) {
          options.onError(new Error(warning));
        }
      }

      // Load the WASM model
      const model = await this.loadWASMModel(modelUrl, options);
      
      this.loadedModels.set(modelName, model);
      
      // Update storage budget after loading
      await this.updateStorageBudget();
      
      return model;
    } catch (error) {
      console.error(`Failed to load WASM model ${modelName}:`, error);
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  private async loadWASMModel(modelUrl: string, options: {
    onProgress?: (progress: number) => void;
  } = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', modelUrl, true);
      xhr.responseType = 'arraybuffer';

      xhr.onprogress = (event) => {
        if (event.lengthComputable && options.onProgress) {
          const progress = (event.loaded / event.total) * 100;
          options.onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const wasmModule = new WebAssembly.Module(xhr.response);
            const wasmInstance = new WebAssembly.Instance(wasmModule);
            resolve(wasmInstance);
          } catch (error) {
            reject(new Error(`Failed to instantiate WASM module: ${error}`));
          }
        } else {
          reject(new Error(`Failed to load WASM model: HTTP ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error while loading WASM model'));
      };

      xhr.send();
    });
  }

  async loadONNXModel(modelName: string, modelUrl: string, options: {
    onProgress?: (progress: number) => void;
    onError?: (error: Error) => void;
  } = {}): Promise<any> {
    if (this.loadedModels.has(modelName)) {
      return this.loadedModels.get(modelName);
    }

    try {
      // Check storage budget
      await this.updateStorageBudget();
      
      if (this.storageBudget.percentage > 80) {
        const warning = `Storage usage is at ${this.storageBudget.percentage}%. ONNX model may not fit.`;
        console.warn(warning);
        if (options.onError) {
          options.onError(new Error(warning));
        }
      }

      // Load ONNX.js runtime
      const onnx = await this.loadONNXRuntime();
      
      // Load the model
      const model = await onnx.InferenceSession.create(modelUrl, {
        executionProviders: ['webgl', 'cpu'],
        graphOptimizationLevel: 'all'
      });

      this.loadedModels.set(modelName, model);
      
      // Update storage budget
      await this.updateStorageBudget();
      
      return model;
    } catch (error) {
      console.error(`Failed to load ONNX model ${modelName}:`, error);
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  private async loadONNXRuntime(): Promise<any> {
    // Dynamically import ONNX.js
    // const onnx = await import('onnxruntime-web');
    const onnx = null; // Disabled for now
    return onnx;
  }

  async loadLocalOCRModel(): Promise<any> {
    const modelName = 'local-ocr';
    
    if (this.loadedModels.has(modelName)) {
      return this.loadedModels.get(modelName);
    }

    try {
      // Load a lightweight OCR model for local processing
      const model = await this.loadModel(modelName, '/models/ocr-model.wasm', {
        onProgress: (progress) => {
          console.log(`Loading OCR model: ${Math.round(progress)}%`);
        },
        onError: (error) => {
          console.error('OCR model loading failed:', error);
        }
      });

      return model;
    } catch (error) {
      console.warn('Local OCR model not available, falling back to Tesseract.js');
      return null;
    }
  }

  async loadLocalCaptionModel(): Promise<any> {
    const modelName = 'local-caption';
    
    if (this.loadedModels.has(modelName)) {
      return this.loadedModels.get(modelName);
    }

    try {
      // Load a lightweight image captioning model
      const model = await this.loadONNXModel(modelName, '/models/caption-model.onnx', {
        onProgress: (progress) => {
          console.log(`Loading caption model: ${Math.round(progress)}%`);
        },
        onError: (error) => {
          console.error('Caption model loading failed:', error);
        }
      });

      return model;
    } catch (error) {
      console.warn('Local caption model not available, using cloud services');
      return null;
    }
  }

  async unloadModel(modelName: string): Promise<void> {
    if (this.loadedModels.has(modelName)) {
      const model = this.loadedModels.get(modelName);
      
      // Clean up model resources
      if (model && typeof model.dispose === 'function') {
        model.dispose();
      }
      
      this.loadedModels.delete(modelName);
      
      // Update storage budget
      await this.updateStorageBudget();
    }
  }

  async unloadAllModels(): Promise<void> {
    const modelNames = Array.from(this.loadedModels.keys());
    
    for (const modelName of modelNames) {
      await this.unloadModel(modelName);
    }
  }

  private async updateStorageBudget(): Promise<void> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        
        this.storageBudget = {
          used: Math.round(used / (1024 * 1024)), // Convert to MB
          available: Math.round(available / (1024 * 1024)), // Convert to MB
          percentage: available > 0 ? Math.round((used / available) * 100) : 0
        };
      } else {
        // Fallback estimation
        this.storageBudget = {
          used: this.estimateStorageUsage(),
          available: this.MAX_STORAGE_MB,
          percentage: Math.round((this.estimateStorageUsage() / this.MAX_STORAGE_MB) * 100)
        };
      }
    } catch (error) {
      console.warn('Failed to get storage estimate:', error);
      this.storageBudget = {
        used: this.estimateStorageUsage(),
        available: this.MAX_STORAGE_MB,
        percentage: Math.round((this.estimateStorageUsage() / this.MAX_STORAGE_MB) * 100)
      };
    }
  }

  private estimateStorageUsage(): number {
    // Rough estimation based on loaded models
    let estimatedUsage = 0;
    
    this.loadedModels.forEach((model, name) => {
      // Rough estimates for different model types
      if (name.includes('ocr')) {
        estimatedUsage += 10; // ~10MB for OCR models
      } else if (name.includes('caption')) {
        estimatedUsage += 25; // ~25MB for caption models
      } else {
        estimatedUsage += 5; // Default 5MB estimate
      }
    });
    
    return estimatedUsage;
  }

  getStorageBudget(): StorageBudget {
    return { ...this.storageBudget };
  }

  isStorageWarning(): boolean {
    return this.storageBudget.used > this.WARNING_THRESHOLD_MB;
  }

  isStorageCritical(): boolean {
    return this.storageBudget.used > this.MAX_STORAGE_MB;
  }

  getLoadedModels(): string[] {
    return Array.from(this.loadedModels.keys());
  }

  isModelLoaded(modelName: string): boolean {
    return this.loadedModels.has(modelName);
  }

  getModelSize(modelName: string): number {
    // This would need to be implemented based on actual model sizes
    // For now, return estimated sizes
    if (modelName.includes('ocr')) return 10;
    if (modelName.includes('caption')) return 25;
    return 5;
  }

  async clearCache(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear loaded models
      await this.unloadAllModels();
      
      // Update storage budget
      await this.updateStorageBudget();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async optimizeStorage(): Promise<void> {
    const models = Array.from(this.loadedModels.entries());
    
    // Sort by last used time (if available) or by size
    models.sort(([, a], [, b]) => {
      // This would need to track actual usage
      return 0;
    });
    
    // Unload least recently used models if storage is critical
    if (this.isStorageCritical()) {
      const modelsToUnload = models.slice(0, Math.ceil(models.length / 2));
      
      for (const [modelName] of modelsToUnload) {
        await this.unloadModel(modelName);
      }
    }
  }
}
