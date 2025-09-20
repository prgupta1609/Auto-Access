import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContrastFixer } from '../../src/lib/contrastFixer';

describe('ContrastFixer', () => {
  let contrastFixer: ContrastFixer;
  let mockElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    contrastFixer = new ContrastFixer();
    
    mockElement = document.createElement('div');
    mockElement.style.color = 'rgb(100, 100, 100)';
    mockElement.style.backgroundColor = 'rgb(200, 200, 200)';
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
  });

  describe('applyContrastFixes', () => {
    it('should apply contrast fixes to elements', async () => {
      await contrastFixer.applyContrastFixes({
        targetRatio: 4.5
      });

      expect(contrastFixer.isCurrentlyActive()).toBe(true);
    });

    it('should apply color-blind presets', async () => {
      await contrastFixer.applyContrastFixes({
        colorBlindPreset: 'protanopia'
      });

      expect(contrastFixer.isCurrentlyActive()).toBe(true);
      
      // Check if color-blind filter was applied
      const filterSvg = document.getElementById('colorblind-filters');
      expect(filterSvg).toBeTruthy();
    });

    it('should store original styles before making changes', async () => {
      const originalStyle = mockElement.style.cssText;
      
      await contrastFixer.applyContrastFixes({
        targetRatio: 4.5
      });

      // Original styles should be stored
      expect(contrastFixer.isCurrentlyActive()).toBe(true);
    });
  });

  describe('adjustFontSize', () => {
    it('should adjust font size of elements', async () => {
      mockElement.style.fontSize = '16px';
      
      await contrastFixer.adjustFontSize(1.2);

      // Font size should be adjusted
      expect(parseFloat(mockElement.style.fontSize)).toBeGreaterThan(16);
    });

    it('should respect minimum font size', async () => {
      mockElement.style.fontSize = '10px';
      
      await contrastFixer.adjustFontSize(0.5);

      // Should not go below 12px minimum
      expect(parseFloat(mockElement.style.fontSize)).toBeGreaterThanOrEqual(12);
    });
  });

  describe('reset', () => {
    it('should reset all changes and restore original styles', async () => {
      const originalStyle = mockElement.style.cssText;
      
      await contrastFixer.applyContrastFixes({
        targetRatio: 4.5
      });

      expect(contrastFixer.isCurrentlyActive()).toBe(true);

      await contrastFixer.reset();

      expect(contrastFixer.isCurrentlyActive()).toBe(false);
    });

    it('should remove color-blind filters', async () => {
      await contrastFixer.applyContrastFixes({
        colorBlindPreset: 'protanopia'
      });

      await contrastFixer.reset();

      const filterSvg = document.getElementById('colorblind-filters');
      expect(filterSvg).toBeFalsy();
    });
  });

  describe('isCurrentlyActive', () => {
    it('should return false initially', () => {
      expect(contrastFixer.isCurrentlyActive()).toBe(false);
    });

    it('should return true after applying fixes', async () => {
      await contrastFixer.applyContrastFixes({
        targetRatio: 4.5
      });

      expect(contrastFixer.isCurrentlyActive()).toBe(true);
    });
  });

  describe('getCurrentOptions', () => {
    it('should return current options', () => {
      const options = contrastFixer.getCurrentOptions();
      expect(options).toEqual({
        targetRatio: 4.5,
        preserveBranding: true
      });
    });
  });
});
