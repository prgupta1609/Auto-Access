import { ContrastFixOptions } from './types.js';

export class ContrastFixer {
  private originalStyles: Map<HTMLElement, string> = new Map();
  private isActive = false;
  private currentOptions: ContrastFixOptions = {
    targetRatio: 4.5, // WCAG AA standard
    preserveBranding: true
  };

  async applyContrastFixes(options: ContrastFixOptions = { targetRatio: 4.5 }): Promise<void> {
    this.currentOptions = { ...this.currentOptions, ...options };
    this.isActive = true;

    // Store original styles before making changes
    this.storeOriginalStyles();

    // Apply color-blind presets if specified
    if (options.colorBlindPreset) {
      await this.applyColorBlindPreset(options.colorBlindPreset);
    }

    // Fix contrast issues
    await this.fixTextContrast();
    await this.fixBackgroundContrast();
    await this.fixBorderContrast();
    await this.fixImageContrast();
  }

  private storeOriginalStyles(): void {
    const elements = document.querySelectorAll('*');
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      if (!this.originalStyles.has(htmlElement)) {
        this.originalStyles.set(htmlElement, htmlElement.style.cssText);
      }
    });
  }

  private async applyColorBlindPreset(preset: 'protanopia' | 'deuteranopia' | 'tritanopia'): Promise<void> {
    const filters = {
      protanopia: 'url(#protanopia)',
      deuteranopia: 'url(#deuteranopia)',
      tritanopia: 'url(#tritanopia)'
    };

    // Create SVG filter definitions if they don't exist
    this.createColorBlindFilters();

    // Apply filter to body
    document.body.style.filter = filters[preset];
  }

  private createColorBlindFilters(): void {
    if (document.getElementById('colorblind-filters')) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.id = 'colorblind-filters';

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Protanopia filter
    const protanopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    protanopia.id = 'protanopia';
    protanopia.innerHTML = `
      <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
    `;

    // Deuteranopia filter
    const deuteranopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    deuteranopia.id = 'deuteranopia';
    deuteranopia.innerHTML = `
      <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
    `;

    // Tritanopia filter
    const tritanopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    tritanopia.id = 'tritanopia';
    tritanopia.innerHTML = `
      <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
    `;

    defs.appendChild(protanopia);
    defs.appendChild(deuteranopia);
    defs.appendChild(tritanopia);
    svg.appendChild(defs);
    document.body.appendChild(svg);
  }

  private async fixTextContrast(): Promise<void> {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, input, textarea, label');
    
    textElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      const textColor = this.parseColor(computedStyle.color);
      const backgroundColor = this.getBackgroundColor(htmlElement);
      
      if (textColor && backgroundColor) {
        const contrastRatio = this.calculateContrastRatio(textColor, backgroundColor);
        
        if (contrastRatio < this.currentOptions.targetRatio) {
          const newColor = this.findContrastingColor(backgroundColor, this.currentOptions.targetRatio);
          htmlElement.style.color = newColor;
        }
      }
    });
  }

  private async fixBackgroundContrast(): Promise<void> {
    const elements = document.querySelectorAll('*');
    
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      const backgroundColor = this.parseColor(computedStyle.backgroundColor);
      
      if (backgroundColor && backgroundColor !== 'transparent') {
        const textColor = this.parseColor(computedStyle.color);
        
        if (textColor) {
          const contrastRatio = this.calculateContrastRatio(textColor, backgroundColor);
          
          if (contrastRatio < this.currentOptions.targetRatio) {
            const newBackgroundColor = this.findContrastingBackgroundColor(textColor, this.currentOptions.targetRatio);
            htmlElement.style.backgroundColor = newBackgroundColor;
          }
        }
      }
    });
  }

  private async fixBorderContrast(): Promise<void> {
    const elements = document.querySelectorAll('*');
    
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      const borderColor = this.parseColor(computedStyle.borderColor);
      const backgroundColor = this.getBackgroundColor(htmlElement);
      
      if (borderColor && backgroundColor && borderColor !== 'transparent') {
        const contrastRatio = this.calculateContrastRatio(borderColor, backgroundColor);
        
        if (contrastRatio < this.currentOptions.targetRatio) {
          const newBorderColor = this.findContrastingColor(backgroundColor, this.currentOptions.targetRatio);
          htmlElement.style.borderColor = newBorderColor;
        }
      }
    });
  }

  private async fixImageContrast(): Promise<void> {
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      const htmlImg = img as HTMLImageElement;
      
      // Add high contrast filter to images
      htmlImg.style.filter = 'contrast(1.2) brightness(1.1)';
      
      // Add border for better visibility
      if (!htmlImg.style.border) {
        htmlImg.style.border = '2px solid #000';
      }
    });
  }

  private parseColor(colorString: string): { r: number; g: number; b: number } | null {
    if (!colorString || colorString === 'transparent') return null;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.fillStyle = colorString;
    const color = ctx.fillStyle;
    
    // Extract RGB values from rgb() or rgba() format
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    
    return null;
  }

  private getBackgroundColor(element: HTMLElement): { r: number; g: number; b: number } | null {
    let currentElement: HTMLElement | null = element;
    
    while (currentElement) {
      const computedStyle = window.getComputedStyle(currentElement);
      const backgroundColor = this.parseColor(computedStyle.backgroundColor);
      
      if (backgroundColor && backgroundColor !== 'transparent') {
        return backgroundColor;
      }
      
      currentElement = currentElement.parentElement;
    }
    
    // Fallback to white background
    return { r: 255, g: 255, b: 255 };
  }

  private calculateContrastRatio(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance(color: { r: number; g: number; b: number }): number {
    const { r, g, b } = color;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private findContrastingColor(backgroundColor: { r: number; g: number; b: number }, targetRatio: number): string {
    const bgLuminance = this.getLuminance(backgroundColor);
    
    // Try black and white first
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    
    const blackRatio = this.calculateContrastRatio(black, backgroundColor);
    const whiteRatio = this.calculateContrastRatio(white, backgroundColor);
    
    if (blackRatio >= targetRatio) return 'rgb(0, 0, 0)';
    if (whiteRatio >= targetRatio) return 'rgb(255, 255, 255)';
    
    // If neither black nor white works, find a color that does
    const targetLuminance = bgLuminance > 0.5 
      ? bgLuminance - (0.05 / targetRatio)
      : bgLuminance + (0.05 / targetRatio);
    
    // Convert luminance back to RGB
    const rgb = this.luminanceToRgb(targetLuminance);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  private findContrastingBackgroundColor(textColor: { r: number; g: number; b: number }, targetRatio: number): string {
    const textLuminance = this.getLuminance(textColor);
    
    // Try white and black backgrounds
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    
    const whiteRatio = this.calculateContrastRatio(textColor, white);
    const blackRatio = this.calculateContrastRatio(textColor, black);
    
    if (whiteRatio >= targetRatio) return 'rgb(255, 255, 255)';
    if (blackRatio >= targetRatio) return 'rgb(0, 0, 0)';
    
    // Find a background color that provides sufficient contrast
    const targetLuminance = textLuminance > 0.5 
      ? textLuminance - (0.05 / targetRatio)
      : textLuminance + (0.05 / targetRatio);
    
    const rgb = this.luminanceToRgb(targetLuminance);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  private luminanceToRgb(luminance: number): { r: number; g: number; b: number } {
    // This is a simplified conversion - in practice, you'd want a more sophisticated approach
    const value = Math.round(luminance * 255);
    return { r: value, g: value, b: value };
  }

  async adjustFontSize(scale: number): Promise<void> {
    const elements = document.querySelectorAll('*');
    
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      if (fontSize && fontSize > 0) {
        const newSize = Math.max(12, fontSize * scale); // Minimum 12px
        htmlElement.style.fontSize = `${newSize}px`;
      }
    });
  }

  async reset(): Promise<void> {
    if (!this.isActive) return;
    
    // Restore original styles
    this.originalStyles.forEach((originalStyle, element) => {
      element.style.cssText = originalStyle;
    });
    
    // Remove color-blind filters
    const filterSvg = document.getElementById('colorblind-filters');
    if (filterSvg) {
      filterSvg.remove();
    }
    
    // Reset body filter
    document.body.style.filter = '';
    
    this.originalStyles.clear();
    this.isActive = false;
  }

  isCurrentlyActive(): boolean {
    return this.isActive;
  }

  getCurrentOptions(): ContrastFixOptions {
    return { ...this.currentOptions };
  }
}
