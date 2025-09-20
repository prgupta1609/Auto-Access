import { test, expect } from '@playwright/test';

test.describe('AutoAccess Extension', () => {
  test.beforeEach(async ({ page }) => {
    // Load the extension
    await page.goto('chrome-extension://[extension-id]/popup.html');
  });

  test('should load popup interface', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AutoAccess');
    await expect(page.locator('.toolbar-container')).toBeVisible();
  });

  test('should toggle global accessibility mode', async ({ page }) => {
    const globalModeButton = page.locator('[data-action="global-mode"]');
    
    await globalModeButton.click();
    await expect(globalModeButton).toHaveClass(/active/);
    
    await globalModeButton.click();
    await expect(globalModeButton).not.toHaveClass(/active/);
  });

  test('should open options page', async ({ page }) => {
    const settingsButton = page.locator('[data-action="settings"]');
    
    await settingsButton.click();
    
    // Check if options page opened (this would be in a new tab)
    // In a real test, you'd need to handle the new tab
  });

  test('should display profile selector', async ({ page }) => {
    const profileSelector = page.locator('.profile-selector');
    await expect(profileSelector).toBeVisible();
  });

  test('should show quick actions', async ({ page }) => {
    const quickActions = page.locator('.quick-actions');
    await expect(quickActions).toBeVisible();
    
    const auditButton = page.locator('[data-action="audit"]');
    await expect(auditButton).toBeVisible();
  });
});

test.describe('Accessibility Features', () => {
  test('should run accessibility audit on nytimes.com', async ({ page }) => {
    await page.goto('https://www.nytimes.com');
    
    // Inject extension content script
    await page.evaluate(() => {
      // Simulate extension injection
      const script = document.createElement('script');
      script.src = 'chrome-extension://[extension-id]/content.js';
      document.head.appendChild(script);
    });

    // Wait for extension to load
    await page.waitForTimeout(2000);

    // Run audit
    const auditResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        const event = new CustomEvent('autoaccess-audit-run', {
          detail: { resolve }
        });
        document.dispatchEvent(event);
      });
    });

    expect(auditResult).toBeDefined();
    expect(auditResult.violations).toBeDefined();
    expect(Array.isArray(auditResult.violations)).toBe(true);
  });

  test('should generate image captions on amazon.com', async ({ page }) => {
    await page.goto('https://www.amazon.com');
    
    // Inject extension
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = 'chrome-extension://[extension-id]/content.js';
      document.head.appendChild(script);
    });

    await page.waitForTimeout(2000);

    // Find an image and test OCR
    const images = await page.locator('img').all();
    if (images.length > 0) {
      const firstImage = images[0];
      
      const ocrResult = await page.evaluate((img) => {
        return new Promise((resolve) => {
          const event = new CustomEvent('autoaccess-ocr-extract', {
            detail: { 
              imageData: img.src,
              resolve 
            }
          });
          document.dispatchEvent(event);
        });
      }, await firstImage.getAttribute('src'));

      expect(ocrResult).toBeDefined();
      expect(ocrResult.text).toBeDefined();
    }
  });

  test('should apply contrast fixes', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Inject extension
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = 'chrome-extension://[extension-id]/content.js';
      document.head.appendChild(script);
    });

    await page.waitForTimeout(2000);

    // Apply contrast fix
    await page.evaluate(() => {
      const event = new CustomEvent('autoaccess-contrast-fix', {
        detail: { 
          options: { targetRatio: 4.5 }
        }
      });
      document.dispatchEvent(event);
    });

    // Check if contrast fixer is active
    const isActive = await page.evaluate(() => {
      return window.autoaccess?.contrastFixer?.isCurrentlyActive() || false;
    });

    expect(isActive).toBe(true);
  });

  test('should enable keyboard navigation', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Inject extension
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = 'chrome-extension://[extension-id]/content.js';
      document.head.appendChild(script);
    });

    await page.waitForTimeout(2000);

    // Enable keyboard mode
    await page.evaluate(() => {
      const event = new CustomEvent('autoaccess-keyboard-navigate', {
        detail: { direction: 'next' }
      });
      document.dispatchEvent(event);
    });

    // Check if keyboard engine is active
    const isActive = await page.evaluate(() => {
      return window.autoaccess?.keyboardEngine?.isActive() || false;
    });

    expect(isActive).toBe(true);
  });
});

test.describe('React SPA Testing', () => {
  test('should work with React SPA navigation', async ({ page }) => {
    // Create a simple React app for testing
    await page.goto('data:text/html,<html><body><div id="root"></div><script>/* React app would go here */</script></body></html>');
    
    // Inject extension
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = 'chrome-extension://[extension-id]/content.js';
      document.head.appendChild(script);
    });

    await page.waitForTimeout(2000);

    // Simulate SPA route change
    await page.evaluate(() => {
      // Simulate adding new content (like a route change)
      const newContent = document.createElement('div');
      newContent.innerHTML = '<h1>New Page</h1><button>Click me</button>';
      document.getElementById('root')?.appendChild(newContent);
      
      // Trigger route change event
      const event = new CustomEvent('popstate');
      window.dispatchEvent(event);
    });

    await page.waitForTimeout(1000);

    // Check if extension still works after route change
    const hasToolbar = await page.evaluate(() => {
      return document.getElementById('autoaccess-toolbar') !== null;
    });

    expect(hasToolbar).toBe(true);
  });
});
