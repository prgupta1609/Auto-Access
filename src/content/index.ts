// AutoAccess Content Script
// This script runs in the context of web pages to provide accessibility features

console.log('AutoAccess content script loaded');

// Simple content script that doesn't use ES6 modules
class AutoAccessContent {
  private isInitialized = false;
  private isGlobalModeActive = false;
  private originalStyles = new Map<HTMLElement, string>();
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isTTSActive = false;
  private ttsPointer: HTMLElement | null = null;
  private currentWordIndex = 0;
  private wordElements: HTMLElement[] = [];
  private isVoiceCommandsActive = false;
  private recognition: any = null;
  private voiceCommandStatus: HTMLElement | null = null;
  private isImageLabelingActive = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    
    console.log('Initializing AutoAccess content script...');
    
    // Add a simple toolbar
    this.createSimpleToolbar();
    
    // Listen for messages from the extension
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    this.isInitialized = true;
  }

  private createSimpleToolbar() {
    // Create a simple floating toolbar
    const toolbar = document.createElement('div');
    toolbar.id = 'autoaccess-toolbar';
    toolbar.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        gap: 4px;
      ">
        <button id="autoaccess-global-mode" style="
          background: none;
          border: none;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        " title="Toggle Global Accessibility Mode">🌐</button>
        <button id="autoaccess-tts" style="
          background: none;
          border: none;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        " title="Text-to-Speech">🔊</button>
        <button id="autoaccess-contrast" style="
          background: none;
          border: none;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        " title="Fix Contrast">🎨</button>
        <button id="autoaccess-shortcuts" style="
          background: none;
          border: none;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        " title="Show Keyboard Shortcuts">⌨️</button>
        <button id="autoaccess-microphone" style="
          background: none;
          border: none;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        " title="Voice Commands">🎤</button>
        <button id="autoaccess-image-labeling" style="
          background: none;
          border: none;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        " title="AI Image Labeling">🎨</button>
      </div>
    `;

    // Add event listeners
    toolbar.querySelector('#autoaccess-global-mode')?.addEventListener('click', () => {
      this.toggleGlobalMode();
    });

    toolbar.querySelector('#autoaccess-tts')?.addEventListener('click', () => {
      this.toggleTTS();
    });

    toolbar.querySelector('#autoaccess-contrast')?.addEventListener('click', () => {
      this.toggleContrast();
    });

    toolbar.querySelector('#autoaccess-shortcuts')?.addEventListener('click', () => {
      this.showKeyboardShortcuts();
    });

    toolbar.querySelector('#autoaccess-microphone')?.addEventListener('click', () => {
      this.toggleVoiceCommands();
    });

    toolbar.querySelector('#autoaccess-image-labeling')?.addEventListener('click', () => {
      this.toggleImageLabeling();
    });

    document.body.appendChild(toolbar);
  }

  private toggleGlobalMode() {
    this.isGlobalModeActive = !this.isGlobalModeActive;
    console.log('Global accessibility mode toggled:', this.isGlobalModeActive);
    
    if (this.isGlobalModeActive) {
      this.enableGlobalAccessibilityMode();
    } else {
      this.disableGlobalAccessibilityMode();
    }
    
    this.updateToolbarButtonStates();
  }

  private enableGlobalAccessibilityMode() {
    // Store original styles before making changes
    this.storeOriginalStyles();
    
    // Apply comprehensive accessibility improvements
    this.improveTypography();
    this.improveContrast();
    this.improveFocusIndicators();
    this.improveSpacing();
    this.addSkipLinks();
    this.fixAriaAttributes();
    
    // Show visual indicator
    this.showAccessibilityIndicator();
  }

  private disableGlobalAccessibilityMode() {
    // Restore original styles
    this.restoreOriginalStyles();
    
    // Remove accessibility enhancements
    this.removeSkipLinks();
    this.hideAccessibilityIndicator();
    
    // Clear stored styles
    this.originalStyles.clear();
  }

  private storeOriginalStyles() {
    // Store original styles for all elements we might modify
    const elementsToStore = document.querySelectorAll('*');
    elementsToStore.forEach(element => {
      const htmlElement = element as HTMLElement;
      if (!this.originalStyles.has(htmlElement)) {
        this.originalStyles.set(htmlElement, htmlElement.style.cssText);
      }
    });
  }

  private restoreOriginalStyles() {
    this.originalStyles.forEach((originalStyle, element) => {
      element.style.cssText = originalStyle;
    });
  }

  private improveTypography() {
    // Improve font size, line height, and readability
    document.body.style.fontSize = '18px';
    document.body.style.lineHeight = '1.6';
    document.body.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    
    // Improve heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      const htmlHeading = heading as HTMLElement;
      const level = parseInt(heading.tagName.charAt(1));
      htmlHeading.style.fontSize = `${Math.max(24 - (level - 1) * 2, 16)}px`;
      htmlHeading.style.fontWeight = 'bold';
      htmlHeading.style.marginTop = '1.5em';
      htmlHeading.style.marginBottom = '0.5em';
    });
  }

  private improveContrast() {
    // Improve text contrast
    const textElements = document.querySelectorAll('p, span, div, a, button, input, textarea, label');
    textElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      const color = computedStyle.color;
      
      // If text is light colored, make it darker
      if (color.includes('rgb(255, 255, 255)') || color.includes('rgb(255,255,255)')) {
        htmlElement.style.color = '#000000';
      } else if (color.includes('rgb(200, 200, 200)') || color.includes('rgb(200,200,200)')) {
        htmlElement.style.color = '#333333';
      }
    });
    
    // Improve background contrast
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#000000';
  }

  private improveFocusIndicators() {
    // Add better focus indicators
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
    focusableElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.outline = '3px solid #0066cc';
      htmlElement.style.outlineOffset = '2px';
    });
  }

  private improveSpacing() {
    // Improve spacing between elements
    const paragraphs = document.querySelectorAll('p');
    paragraphs.forEach(p => {
      const htmlP = p as HTMLElement;
      htmlP.style.marginBottom = '1em';
    });
    
    const lists = document.querySelectorAll('ul, ol');
    lists.forEach(list => {
      const htmlList = list as HTMLElement;
      htmlList.style.marginBottom = '1em';
      htmlList.style.paddingLeft = '2em';
    });
  }

  private addSkipLinks() {
    // Add skip to main content link
    if (!document.getElementById('skip-to-main')) {
      const skipLink = document.createElement('a');
      skipLink.id = 'skip-to-main';
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 10000;
        border-radius: 4px;
        transition: top 0.3s;
      `;
      
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
      });
      
      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
      });
      
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    // Ensure main content area exists
    if (!document.getElementById('main-content')) {
      const main = document.createElement('main');
      main.id = 'main-content';
      main.setAttribute('role', 'main');
      document.body.appendChild(main);
    }
  }

  private removeSkipLinks() {
    const skipLink = document.getElementById('skip-to-main');
    if (skipLink) {
      skipLink.remove();
    }
  }

  private fixAriaAttributes() {
    // Add ARIA labels to buttons without text
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      const htmlButton = button as HTMLElement;
      if (!htmlButton.textContent?.trim() && !htmlButton.getAttribute('aria-label')) {
        htmlButton.setAttribute('aria-label', 'Button');
      }
    });
    
    // Add ARIA labels to images without alt text
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const htmlImg = img as HTMLElement;
      if (!htmlImg.alt) {
        htmlImg.alt = 'Image';
      }
    });
  }

  private showAccessibilityIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'accessibility-indicator';
    indicator.textContent = 'Accessibility Mode Active';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #0066cc;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(indicator);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }, 3000);
  }

  private hideAccessibilityIndicator() {
    const indicator = document.getElementById('accessibility-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  private updateToolbarButtonStates() {
    const globalModeBtn = document.getElementById('autoaccess-global-mode');
    if (globalModeBtn) {
      if (this.isGlobalModeActive) {
        globalModeBtn.style.backgroundColor = 'rgba(0, 102, 204, 0.2)';
        globalModeBtn.style.border = '2px solid #0066cc';
      } else {
        globalModeBtn.style.backgroundColor = '';
        globalModeBtn.style.border = '';
      }
    }
  }

  private toggleTTS() {
    console.log('TTS toggled, current state:', this.isTTSActive);
    
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    if (this.isTTSActive) {
      this.stopTTS();
    } else {
      this.startTTS();
    }
  }

  private startTTS() {
    try {
      // Stop any current speech first
      this.stopTTS();
      
      // Get meaningful content from the page
      const content = this.extractReadableContent();
      
      if (!content.trim()) {
        console.log('No readable content found on this page');
        return;
      }

      // Create new utterance
      this.currentUtterance = new SpeechSynthesisUtterance(content);
      this.currentUtterance.rate = 0.9;
      this.currentUtterance.pitch = 1.0;
      this.currentUtterance.volume = 0.8;
      this.currentUtterance.lang = 'en-US';

      // Add comprehensive event listeners
      this.currentUtterance.onstart = () => {
        console.log('TTS started reading page content');
        this.isTTSActive = true;
        this.updateTTSButtonState();
        this.createTTSPointer();
        this.highlightContent();
      };

      this.currentUtterance.onend = () => {
        console.log('TTS finished reading page content');
        this.isTTSActive = false;
        this.currentUtterance = null;
        this.updateTTSButtonState();
        this.removeTTSPointer();
        this.clearHighlights();
      };

      this.currentUtterance.onerror = (event) => {
        console.error('TTS error:', event.error, 'Type:', event.type);
        this.isTTSActive = false;
        this.currentUtterance = null;
        this.updateTTSButtonState();
        this.removeTTSPointer();
        this.clearHighlights();
        
        // Handle specific error types
        switch (event.error) {
          case 'interrupted':
            console.log('TTS was interrupted - this is normal when stopping');
            break;
          case 'not-allowed':
            console.warn('TTS not allowed - user may need to interact with page first');
            break;
          case 'network':
            console.error('TTS network error');
            break;
          default:
            console.error('TTS unknown error:', event.error);
        }
      };

      this.currentUtterance.onpause = () => {
        console.log('TTS paused');
      };

      this.currentUtterance.onresume = () => {
        console.log('TTS resumed');
      };

      // Wait for voices to be loaded
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', () => {
          this.speakUtterance();
        }, { once: true });
      } else {
        this.speakUtterance();
      }

    } catch (error) {
      console.error('Error starting TTS:', error);
      this.isTTSActive = false;
      this.currentUtterance = null;
    }
  }

  private speakUtterance() {
    if (this.currentUtterance) {
      try {
        speechSynthesis.speak(this.currentUtterance);
      } catch (error) {
        console.error('Error speaking utterance:', error);
        this.isTTSActive = false;
        this.currentUtterance = null;
      }
    }
  }

  private stopTTS() {
    try {
      if (this.currentUtterance) {
        speechSynthesis.cancel();
        this.currentUtterance = null;
      }
      this.isTTSActive = false;
      this.updateTTSButtonState();
      this.removeTTSPointer();
      this.clearHighlights();
      console.log('TTS stopped');
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  private updateTTSButtonState() {
    const ttsBtn = document.getElementById('autoaccess-tts');
    if (ttsBtn) {
      if (this.isTTSActive) {
        ttsBtn.style.backgroundColor = 'rgba(0, 102, 204, 0.2)';
        ttsBtn.style.border = '2px solid #0066cc';
        ttsBtn.title = 'Stop Text-to-Speech';
      } else {
        ttsBtn.style.backgroundColor = '';
        ttsBtn.style.border = '';
        ttsBtn.title = 'Start Text-to-Speech';
      }
    }
  }

  private extractReadableContent(): string {
    try {
      // Create a temporary copy of the document to avoid modifying the original
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = document.body.innerHTML;
      
      // Remove unwanted elements
      const elementsToRemove = tempDiv.querySelectorAll(`
        script, style, nav, header, footer, 
        .nav, .navigation, .menu, .sidebar,
        .advertisement, .ads, .banner,
        .cookie-notice, .privacy-notice,
        .social-media, .social-share,
        [role="navigation"], [role="banner"], [role="contentinfo"],
        .skip-link, .sr-only
      `);
      
      elementsToRemove.forEach(el => el.remove());
      
      // Try to find main content areas (prioritized order)
      const contentSelectors = [
        'main',
        '[role="main"]',
        '.main-content',
        '.content',
        '.article',
        '.post',
        '.product-details',
        '.product-info',
        '.product-description',
        '#main-content',
        '.page-content',
        '.entry-content'
      ];
      
      let mainContent: Element | null = null;
      for (const selector of contentSelectors) {
        mainContent = tempDiv.querySelector(selector);
        if (mainContent) break;
      }
      
      let content = '';
      if (mainContent) {
        content = mainContent.textContent || '';
      } else {
        // Fallback: try to get content from common content areas
        const fallbackSelectors = [
          'h1, h2, h3, h4, h5, h6',
          'p',
          '.description',
          '.summary',
          '.overview'
        ];
        
        const fallbackElements = tempDiv.querySelectorAll(fallbackSelectors.join(', '));
        content = Array.from(fallbackElements)
          .map(el => el.textContent || '')
          .join(' ')
          .trim();
        
        // If still no content, use body as last resort
        if (!content) {
          content = tempDiv.textContent || '';
        }
      }
      
      // Clean up the content
      content = content
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();
      
      // Remove common UI elements that shouldn't be read
      const uiElements = [
        'Skip to main content',
        'Menu', 'Navigation', 'Search',
        'Login', 'Sign up', 'Register',
        'Cookie', 'Privacy', 'Terms',
        'Copyright', 'All rights reserved',
        'Add to cart', 'Buy now', 'Add to wishlist',
        'Share', 'Like', 'Follow',
        'Subscribe', 'Newsletter',
        'Advertisement', 'Sponsored',
        'Loading', 'Please wait'
      ];
      
      uiElements.forEach(element => {
        const regex = new RegExp(`\\b${element}\\b`, 'gi');
        content = content.replace(regex, '');
      });
      
      // Remove URLs and email addresses
      content = content.replace(/https?:\/\/[^\s]+/g, '');
      content = content.replace(/[^\s]+@[^\s]+/g, '');
      
      // Clean up extra spaces again
      content = content.replace(/\s+/g, ' ').trim();
      
      // Limit to reasonable length (first 800 characters for better content)
      if (content.length > 800) {
        content = content.substring(0, 800) + '...';
      }
      
    return content;
    
  } catch (error) {
    console.error('Error extracting readable content:', error);
    return 'Unable to extract content from this page.';
  }
}

  private createTTSPointer() {
    // Remove existing pointer if any
    this.removeTTSPointer();
    
    // Create the visual pointer
    this.ttsPointer = document.createElement('div');
    this.ttsPointer.id = 'autoaccess-tts-pointer';
    this.ttsPointer.innerHTML = '🔊';
    this.ttsPointer.style.cssText = `
      position: fixed;
      z-index: 10001;
      font-size: 20px;
      pointer-events: none;
      transition: all 0.3s ease;
      background: rgba(0, 102, 204, 0.9);
      color: white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
      border: 2px solid white;
      animation: pulse 1.5s infinite;
    `;
    
    // Add CSS animation
    if (!document.getElementById('tts-pointer-styles')) {
      const style = document.createElement('style');
      style.id = 'tts-pointer-styles';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .tts-highlight {
          background: rgba(0, 102, 204, 0.3) !important;
          border-radius: 3px !important;
          transition: background-color 0.3s ease !important;
          position: relative !important;
        }
        .tts-highlight::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px solid #0066cc;
          border-radius: 5px;
          pointer-events: none;
          z-index: 10000;
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(this.ttsPointer);
  }

  private removeTTSPointer() {
    if (this.ttsPointer) {
      this.ttsPointer.remove();
      this.ttsPointer = null;
    }
  }

  private highlightContent() {
    // Clear previous highlights
    this.clearHighlights();
    
    // Find the main content area
    const contentSelectors = [
      'main',
      '[role="main"]',
      '.main-content',
      '.content',
      '.article',
      '.post',
      '.product-details',
      '.product-info',
      '.product-description',
      '#main-content',
      '.page-content',
      '.entry-content'
    ];
    
    let mainContent: Element | null = null;
    for (const selector of contentSelectors) {
      mainContent = document.querySelector(selector);
      if (mainContent) break;
    }
    
    if (!mainContent) {
      // Fallback to body
      mainContent = document.body;
    }
    
    // Find all text elements
    const textElements = mainContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, td, th');
    
    // Add highlighting to text elements
    textElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      if (htmlElement.textContent && htmlElement.textContent.trim().length > 10) {
        htmlElement.classList.add('tts-highlight');
        this.wordElements.push(htmlElement);
        
        // Add click handler to move pointer to this element
        htmlElement.addEventListener('click', () => {
          this.movePointerToElement(htmlElement);
        });
      }
    });
    
    // Start the pointer movement animation
    this.startPointerMovement();
  }

  private clearHighlights() {
    // Remove all TTS highlights
    document.querySelectorAll('.tts-highlight').forEach(element => {
      element.classList.remove('tts-highlight');
    });
    
    // Clear word elements array
    this.wordElements = [];
    this.currentWordIndex = 0;
  }

  private startPointerMovement() {
    if (!this.ttsPointer || this.wordElements.length === 0) return;
    
    this.currentWordIndex = 0;
    this.movePointerToNextElement();
  }

  private movePointerToNextElement() {
    if (!this.ttsPointer || this.wordElements.length === 0) return;
    
    if (this.currentWordIndex < this.wordElements.length) {
      const element = this.wordElements[this.currentWordIndex];
      this.movePointerToElement(element);
      
      // Move to next element after a delay
      setTimeout(() => {
        this.currentWordIndex++;
        this.movePointerToNextElement();
      }, 2000); // 2 seconds per element
    }
  }

  private movePointerToElement(element: HTMLElement) {
    if (!this.ttsPointer) return;
    
    try {
      const rect = element.getBoundingClientRect();
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate position to center the pointer on the element
      const pointerX = rect.left + scrollX + (rect.width / 2) - 20; // 20px is half pointer width
      const pointerY = rect.top + scrollY + (rect.height / 2) - 20; // 20px is half pointer height
      
      // Ensure pointer stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const finalX = Math.max(10, Math.min(pointerX, viewportWidth - 50));
      const finalY = Math.max(10, Math.min(pointerY, viewportHeight - 50));
      
      this.ttsPointer.style.left = finalX + 'px';
      this.ttsPointer.style.top = finalY + 'px';
      
      // Scroll element into view if needed
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center', 
        inline: 'center' 
      });
      
    } catch (error) {
      console.error('Error moving TTS pointer:', error);
    }
  }

  private toggleContrast() {
    console.log('Contrast fix toggled');
    // Simple contrast improvements
    document.body.style.filter = document.body.style.filter === 'contrast(1.2) brightness(1.1)' ? '' : 'contrast(1.2) brightness(1.1)';
  }

  private toggleVoiceCommands() {
    if (this.isVoiceCommandsActive) {
      this.stopVoiceCommands();
    } else {
      this.startVoiceCommands();
    }
  }

  private startVoiceCommands() {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    // Request microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        this.initializeSpeechRecognition();
      })
      .catch((error) => {
        console.error('Microphone permission denied:', error);
        alert('Microphone permission is required for voice commands. Please allow microphone access and try again.');
      });
  }

  private initializeSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('Voice commands started');
      this.isVoiceCommandsActive = true;
      this.updateMicrophoneButtonState();
      this.showVoiceCommandStatus('🎤 Listening... Say a command');
    };

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('')
        .toLowerCase()
        .trim();

      console.log('Voice command detected:', transcript);
      this.showVoiceCommandStatus(`🎤 Heard: "${transcript}"`);

      if (event.results[event.results.length - 1].isFinal) {
        this.processVoiceCommand(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.showVoiceCommandStatus(`❌ Error: ${event.error}`);
      
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access in your browser settings.');
        this.stopVoiceCommands();
      }
    };

    this.recognition.onend = () => {
      console.log('Voice commands ended');
      if (this.isVoiceCommandsActive) {
        // Restart recognition if it was intentionally active
        setTimeout(() => {
          if (this.isVoiceCommandsActive) {
            this.recognition.start();
          }
        }, 100);
      }
    };

    this.recognition.start();
  }

  private stopVoiceCommands() {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.isVoiceCommandsActive = false;
    this.updateMicrophoneButtonState();
    this.hideVoiceCommandStatus();
  }

  private updateMicrophoneButtonState() {
    const micBtn = document.getElementById('autoaccess-microphone');
    if (micBtn) {
      if (this.isVoiceCommandsActive) {
        micBtn.style.background = 'rgba(34, 197, 94, 0.2)';
        micBtn.style.border = '2px solid #22c55e';
        micBtn.title = 'Stop Voice Commands';
      } else {
        micBtn.style.background = '';
        micBtn.style.border = '';
        micBtn.title = 'Start Voice Commands';
      }
    }
  }

  private showVoiceCommandStatus(message: string) {
    this.hideVoiceCommandStatus();
    
    this.voiceCommandStatus = document.createElement('div');
    this.voiceCommandStatus.id = 'autoaccess-voice-status';
    this.voiceCommandStatus.textContent = message;
    this.voiceCommandStatus.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 10003;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease-out;
    `;

    // Add animation styles
    if (!document.getElementById('voice-status-styles')) {
      const style = document.createElement('style');
      style.id = 'voice-status-styles';
      style.textContent = `
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(this.voiceCommandStatus);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.hideVoiceCommandStatus();
    }, 3000);
  }

  private hideVoiceCommandStatus() {
    if (this.voiceCommandStatus) {
      this.voiceCommandStatus.remove();
      this.voiceCommandStatus = null;
    }
  }

  private processVoiceCommand(transcript: string) {
    console.log('Processing voice command:', transcript);

    // 1. Zoom Commands
    if (transcript.includes('zoom in')) {
      this.zoomIn();
      this.showVoiceCommandStatus('✅ Zoomed in');
    } else if (transcript.includes('zoom out')) {
      this.zoomOut();
      this.showVoiceCommandStatus('✅ Zoomed out');
    }

    // 2. E-commerce Commands
    else if (transcript.includes('add to cart')) {
      this.addToCart();
      this.showVoiceCommandStatus('✅ Added to cart');
    } else if (transcript.includes('buy now')) {
      this.buyNow();
      this.showVoiceCommandStatus('✅ Buy now clicked');
    } else if (transcript.includes('open product details')) {
      this.openProductDetails();
      this.showVoiceCommandStatus('✅ Opening product details');
    } else if (transcript.includes('show reviews')) {
      this.showReviews();
      this.showVoiceCommandStatus('✅ Showing reviews');
    } else if (transcript.includes('sort by price low to high') || transcript.includes('sort by price')) {
      this.sortByPrice();
      this.showVoiceCommandStatus('✅ Sorted by price');
    }

    // 3. Scroll Commands
    else if (transcript.includes('scroll up')) {
      this.scrollUp();
      this.showVoiceCommandStatus('✅ Scrolled up');
    } else if (transcript.includes('scroll down')) {
      this.scrollDown();
      this.showVoiceCommandStatus('✅ Scrolled down');
    }

    // 4. Typography Commands
    else if (transcript.includes('increase font size') || transcript.includes('bigger font')) {
      this.increaseFontSize();
      this.showVoiceCommandStatus('✅ Font size increased');
    } else if (transcript.includes('decrease font size') || transcript.includes('smaller font')) {
      this.decreaseFontSize();
      this.showVoiceCommandStatus('✅ Font size decreased');
    } else if (transcript.includes('increase line spacing') || transcript.includes('more line spacing')) {
      this.increaseLineSpacing();
      this.showVoiceCommandStatus('✅ Line spacing increased');
    } else if (transcript.includes('decrease line spacing') || transcript.includes('less line spacing')) {
      this.decreaseLineSpacing();
      this.showVoiceCommandStatus('✅ Line spacing decreased');
    }

    // 5. Page Action Commands
    else if (transcript.startsWith('click ')) {
      const buttonText = transcript.replace('click ', '');
      this.clickButton(buttonText);
      this.showVoiceCommandStatus(`✅ Clicked "${buttonText}"`);
    } else if (transcript.startsWith('open link ')) {
      const linkText = transcript.replace('open link ', '');
      this.openLink(linkText);
      this.showVoiceCommandStatus(`✅ Opening link "${linkText}"`);
    }

    // 6. TTS Commands
    else if (transcript.includes('read page') || transcript.includes('read this page')) {
      this.startTTS();
      this.showVoiceCommandStatus('✅ Reading page');
    } else if (transcript.includes('read selection')) {
      this.readSelection();
      this.showVoiceCommandStatus('✅ Reading selection');
    } else if (transcript.includes('stop reading')) {
      this.stopTTS();
      this.showVoiceCommandStatus('✅ Stopped reading');
    }

    // 7. Global Mode Commands
    else if (transcript.includes('toggle global mode') || transcript.includes('accessibility mode')) {
      this.toggleGlobalMode();
      this.showVoiceCommandStatus('✅ Toggled global mode');
    } else if (transcript.includes('fix contrast')) {
      this.toggleContrast();
      this.showVoiceCommandStatus('✅ Fixed contrast');
    }

    // 8. Help Commands
    else if (transcript.includes('help') || transcript.includes('what can you do')) {
      this.showVoiceCommandsHelp();
    }

    else {
      this.showVoiceCommandStatus('❓ Command not recognized. Say "help" for available commands.');
    }
  }

  // Zoom Commands
  private zoomIn() {
    const currentZoom = parseFloat(document.body.style.zoom || '1');
    const newZoom = Math.min(currentZoom + 0.2, 3);
    document.body.style.zoom = newZoom.toString();
  }

  private zoomOut() {
    const currentZoom = parseFloat(document.body.style.zoom || '1');
    const newZoom = Math.max(currentZoom - 0.2, 0.5);
    document.body.style.zoom = newZoom.toString();
  }

  // E-commerce Commands
  private addToCart() {
    // Try multiple selectors for different e-commerce sites
    const selectors = [
      '[data-testid="add-to-cart-button"]',
      '#add-to-cart-button',
      '.add-to-cart',
      '[aria-label*="add to cart" i]',
      'input[value*="Add to Cart" i]',
      '#add-to-cart',
      '.btn-add-to-cart',
      '[data-action="add-to-cart"]',
      '.a-button-primary',
      '.add-to-cart-button'
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector) as HTMLElement;
      if (button && button.offsetParent !== null) {
        button.click();
        return;
      }
    }

    // Fallback: look for buttons containing "add to cart" text
    const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
    for (const button of buttons) {
      const text = button.textContent?.toLowerCase() || '';
      if (text.includes('add to cart') || text.includes('add to basket')) {
        (button as HTMLElement).click();
        return;
      }
    }
  }

  private buyNow() {
    const selectors = [
      '[data-testid="buy-now-button"]',
      '#buy-now-button',
      '.buy-now',
      '[aria-label*="buy now" i]',
      '#buy-now',
      '.btn-buy-now',
      '.a-button-primary',
      '.buy-now-button'
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector) as HTMLElement;
      if (button && button.offsetParent !== null) {
        button.click();
        return;
      }
    }

    // Fallback: look for buttons containing "buy now" text
    const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
    for (const button of buttons) {
      const text = button.textContent?.toLowerCase() || '';
      if (text.includes('buy now') || text.includes('purchase now')) {
        (button as HTMLElement).click();
        return;
      }
    }
  }

  private openProductDetails() {
    const selectors = [
      '[data-testid="product-details-link"]',
      '.product-details-link',
      'a[href*="product"]',
      '.product-title a',
      '.product-name a',
      'h1 a, h2 a, h3 a'
    ];

    for (const selector of selectors) {
      const link = document.querySelector(selector) as HTMLElement;
      if (link && link.offsetParent !== null) {
        link.click();
        return;
      }
    }
  }

  private showReviews() {
    const selectors = [
      '[data-testid="reviews-section"]',
      '#reviews',
      '.reviews',
      'a[href*="review"]',
      '.reviews-tab',
      '#customer-reviews',
      '.review-section',
      '[data-testid="reviews-tab"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && element.offsetParent !== null) {
        element.click();
        return;
      }
    }

    // Fallback: look for buttons containing "reviews" text
    const buttons = document.querySelectorAll('button, a, [role="tab"]');
    for (const button of buttons) {
      const text = button.textContent?.toLowerCase() || '';
      if (text.includes('reviews') || text.includes('customer reviews')) {
        (button as HTMLElement).click();
        return;
      }
    }

    // Scroll to reviews section
    const reviewElements = document.querySelectorAll('[id*="review"], [class*="review"]');
    if (reviewElements.length > 0) {
      reviewElements[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private sortByPrice() {
    const selectors = [
      'select[name*="sort"]',
      '.sort-dropdown',
      '[data-testid="sort-dropdown"]',
      'select[name*="order"]',
      '.sort-select',
      '#sort-dropdown'
    ];

    for (const selector of selectors) {
      const select = document.querySelector(selector) as HTMLSelectElement;
      if (select) {
        // Look for price-related options
        for (const option of select.options) {
          const text = option.text.toLowerCase();
          if (text.includes('price') && (text.includes('low') || text.includes('ascending'))) {
            option.selected = true;
            select.dispatchEvent(new Event('change'));
            return;
          }
        }
      }
    }

    // Fallback: look for any select element and find price options
    const allSelects = document.querySelectorAll('select');
    for (const select of allSelects) {
      const selectElement = select as HTMLSelectElement;
      for (const option of selectElement.options) {
        const text = option.text.toLowerCase();
        if (text.includes('price') && (text.includes('low') || text.includes('ascending'))) {
          option.selected = true;
          selectElement.dispatchEvent(new Event('change'));
          return;
        }
      }
    }
  }

  // Scroll Commands
  private scrollUp() {
    window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
  }

  private scrollDown() {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  }

  // Typography Commands
  private increaseFontSize() {
    const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
    const newSize = Math.min(currentSize + 2, 24);
    document.body.style.fontSize = newSize + 'px';
  }

  private decreaseFontSize() {
    const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
    const newSize = Math.max(currentSize - 2, 10);
    document.body.style.fontSize = newSize + 'px';
  }

  private increaseLineSpacing() {
    const currentSpacing = parseFloat(getComputedStyle(document.body).lineHeight);
    const newSpacing = Math.min(currentSpacing + 0.2, 3);
    document.body.style.lineHeight = newSpacing.toString();
  }

  private decreaseLineSpacing() {
    const currentSpacing = parseFloat(getComputedStyle(document.body).lineHeight);
    const newSpacing = Math.max(currentSpacing - 0.2, 1);
    document.body.style.lineHeight = newSpacing.toString();
  }

  // Page Action Commands
  private clickButton(buttonText: string) {
    const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"], a[role="button"]');
    for (const button of buttons) {
      const text = button.textContent?.toLowerCase() || '';
      if (text.includes(buttonText.toLowerCase())) {
        (button as HTMLElement).click();
        return;
      }
    }
  }

  private openLink(linkText: string) {
    const links = document.querySelectorAll('a');
    for (const link of links) {
      const text = link.textContent?.toLowerCase() || '';
      if (text.includes(linkText.toLowerCase())) {
        link.click();
        return;
      }
    }
  }

  // TTS Commands
  private readSelection() {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const utterance = new SpeechSynthesisUtterance(selection.toString());
      speechSynthesis.speak(utterance);
    } else {
      this.startTTS();
    }
  }

  // Help Command
  private showVoiceCommandsHelp() {
    const helpModal = document.createElement('div');
    helpModal.id = 'autoaccess-voice-help';
    helpModal.innerHTML = `
      <div class="voice-help-overlay">
        <div class="voice-help-content">
          <div class="voice-help-header">
            <h3>🎤 Voice Commands Help</h3>
            <button class="close-btn" id="close-voice-help">&times;</button>
          </div>
          <div class="voice-help-body">
            <div class="command-category">
              <h4>🔍 Zoom & Navigation</h4>
              <p><strong>"zoom in"</strong> - Zoom in the page</p>
              <p><strong>"zoom out"</strong> - Zoom out the page</p>
              <p><strong>"scroll up"</strong> - Scroll up</p>
              <p><strong>"scroll down"</strong> - Scroll down</p>
            </div>
            
            <div class="command-category">
              <h4>🛒 Shopping (Amazon/Flipkart)</h4>
              <p><strong>"add to cart"</strong> - Add item to cart</p>
              <p><strong>"buy now"</strong> - Buy now</p>
              <p><strong>"open product details"</strong> - Open product page</p>
              <p><strong>"show reviews"</strong> - Show product reviews</p>
              <p><strong>"sort by price"</strong> - Sort by price low to high</p>
            </div>
            
            <div class="command-category">
              <h4>📝 Typography</h4>
              <p><strong>"increase font size"</strong> - Make text bigger</p>
              <p><strong>"decrease font size"</strong> - Make text smaller</p>
              <p><strong>"increase line spacing"</strong> - More line spacing</p>
              <p><strong>"decrease line spacing"</strong> - Less line spacing</p>
            </div>
            
            <div class="command-category">
              <h4>🖱️ Page Actions</h4>
              <p><strong>"click [button text]"</strong> - Click any button</p>
              <p><strong>"open link [link text]"</strong> - Open any link</p>
            </div>
            
            <div class="command-category">
              <h4>🔊 Reading</h4>
              <p><strong>"read page"</strong> - Read entire page</p>
              <p><strong>"read selection"</strong> - Read selected text</p>
              <p><strong>"stop reading"</strong> - Stop TTS</p>
            </div>
            
            <div class="command-category">
              <h4>♿ Accessibility</h4>
              <p><strong>"toggle global mode"</strong> - Toggle accessibility mode</p>
              <p><strong>"fix contrast"</strong> - Improve contrast</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .voice-help-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10004;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .voice-help-content {
        background: white;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      
      .voice-help-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px 16px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .voice-help-header h3 {
        margin: 0;
        color: #1f2937;
        font-size: 20px;
        font-weight: 600;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
      }
      
      .voice-help-body {
        padding: 20px 24px;
      }
      
      .command-category {
        margin-bottom: 20px;
      }
      
      .command-category h4 {
        margin: 0 0 12px 0;
        color: #374151;
        font-size: 16px;
        font-weight: 600;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 8px;
      }
      
      .command-category p {
        margin: 8px 0;
        color: #4b5563;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .command-category strong {
        color: #1f2937;
        font-weight: 600;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(helpModal);

    // Add event listeners
    helpModal.querySelector('#close-voice-help')?.addEventListener('click', () => {
      helpModal.remove();
      style.remove();
    });

    helpModal.querySelector('.voice-help-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        helpModal.remove();
        style.remove();
      }
    });
  }

  private showKeyboardShortcuts() {
    // Remove existing shortcuts modal if any
    const existingModal = document.getElementById('autoaccess-shortcuts-modal');
    if (existingModal) {
      existingModal.remove();
      return;
    }

    // Create shortcuts modal
    const modal = document.createElement('div');
    modal.id = 'autoaccess-shortcuts-modal';
    modal.innerHTML = `
      <div class="shortcuts-overlay">
        <div class="shortcuts-content">
          <div class="shortcuts-header">
            <h3>🎯 AutoAccess Keyboard Shortcuts</h3>
            <button class="close-btn" id="close-shortcuts">&times;</button>
          </div>
          <div class="shortcuts-body">
            <div class="shortcut-category">
              <h4>🔧 Extension Controls</h4>
              <div class="shortcut-item">
                <kbd>Alt + A</kbd>
                <span>Toggle Global Accessibility Mode</span>
              </div>
              <div class="shortcut-item">
                <kbd>Alt + R</kbd>
                <span>Toggle Text-to-Speech</span>
              </div>
              <div class="shortcut-item">
                <kbd>Alt + S</kbd>
                <span>Stop Text-to-Speech</span>
              </div>
            </div>
            
            <div class="shortcut-category">
              <h4>⌨️ Global Mode Navigation</h4>
              <div class="shortcut-item">
                <kbd>Tab</kbd>
                <span>Navigate to next focusable element</span>
              </div>
              <div class="shortcut-item">
                <kbd>Shift + Tab</kbd>
                <span>Navigate to previous focusable element</span>
              </div>
              <div class="shortcut-item">
                <kbd>Enter</kbd>
                <span>Activate current element</span>
              </div>
              <div class="shortcut-item">
                <kbd>Space</kbd>
                <span>Activate current element</span>
              </div>
              <div class="shortcut-item">
                <kbd>Esc</kbd>
                <span>Exit Global Mode</span>
              </div>
              <div class="shortcut-item">
                <kbd>Home</kbd>
                <span>Jump to first element</span>
              </div>
              <div class="shortcut-item">
                <kbd>End</kbd>
                <span>Jump to last element</span>
              </div>
            </div>
            
            <div class="shortcut-category">
              <h4>🎯 Arrow Key Navigation</h4>
              <div class="shortcut-item">
                <kbd>↑</kbd>
                <span>Navigate up</span>
              </div>
              <div class="shortcut-item">
                <kbd>↓</kbd>
                <span>Navigate down</span>
              </div>
              <div class="shortcut-item">
                <kbd>←</kbd>
                <span>Navigate left</span>
              </div>
              <div class="shortcut-item">
                <kbd>→</kbd>
                <span>Navigate right</span>
              </div>
            </div>
            
            <div class="shortcut-category">
              <h4>🔊 TTS Visual Features</h4>
              <div class="shortcut-item">
                <kbd>Click highlighted text</kbd>
                <span>Jump TTS pointer to that content</span>
              </div>
              <div class="shortcut-item">
                <kbd>Blue pointer</kbd>
                <span>Shows current TTS reading position</span>
              </div>
            </div>
          </div>
          <div class="shortcuts-footer">
            <p>💡 <strong>Tip:</strong> Click the ⌨️ button again to close this panel</p>
          </div>
        </div>
      </div>
    `;

    // Add styles for the modal
    const style = document.createElement('style');
    style.textContent = `
      #autoaccess-shortcuts-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10002;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .shortcuts-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
      }
      
      .shortcuts-content {
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      .shortcuts-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px 16px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .shortcuts-header h3 {
        margin: 0;
        color: #1f2937;
        font-size: 20px;
        font-weight: 600;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      }
      
      .close-btn:hover {
        background: #f3f4f6;
        color: #374151;
      }
      
      .shortcuts-body {
        padding: 20px 24px;
      }
      
      .shortcut-category {
        margin-bottom: 24px;
      }
      
      .shortcut-category:last-child {
        margin-bottom: 0;
      }
      
      .shortcut-category h4 {
        margin: 0 0 12px 0;
        color: #374151;
        font-size: 16px;
        font-weight: 600;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 8px;
      }
      
      .shortcut-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        padding: 8px 0;
      }
      
      .shortcut-item:last-child {
        margin-bottom: 0;
      }
      
      .shortcut-item kbd {
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        color: #374151;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        font-size: 12px;
        font-weight: 600;
        padding: 6px 10px;
        min-width: 60px;
        text-align: center;
        white-space: nowrap;
        flex-shrink: 0;
      }
      
      .shortcut-item span {
        color: #4b5563;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .shortcuts-footer {
        padding: 16px 24px 20px;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
        border-radius: 0 0 12px 12px;
      }
      
      .shortcuts-footer p {
        margin: 0;
        color: #6b7280;
        font-size: 13px;
        text-align: center;
      }
      
      /* Responsive design */
      @media (max-width: 640px) {
        .shortcuts-content {
          margin: 10px;
          max-height: 90vh;
        }
        
        .shortcuts-header {
          padding: 16px 20px 12px;
        }
        
        .shortcuts-header h3 {
          font-size: 18px;
        }
        
        .shortcuts-body {
          padding: 16px 20px;
        }
        
        .shortcut-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
        }
        
        .shortcut-item kbd {
          align-self: flex-start;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('#close-shortcuts')?.addEventListener('click', () => {
      modal.remove();
      style.remove();
    });

    // Close on overlay click
    modal.querySelector('.shortcuts-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        modal.remove();
        style.remove();
      }
    });

    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        modal.remove();
        style.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  private toggleImageLabeling() {
    this.isImageLabelingActive = !this.isImageLabelingActive;
    console.log('Image labeling toggled:', this.isImageLabelingActive);
    
    if (this.isImageLabelingActive) {
      this.startImageLabeling();
    } else {
      this.stopImageLabeling();
    }
    
    this.updateImageLabelingButtonState();
  }

  private async startImageLabeling() {
    try {
      console.log('Starting image labeling service...');
      
      // Try to import the image labeling service with retry logic
      let imageLabelingService;
      let importAttempts = 0;
      const maxAttempts = 3;
      
      while (importAttempts < maxAttempts) {
        try {
          const module = await import('../lib/imageLabelingService');
          imageLabelingService = module.imageLabelingService;
          console.log('Image labeling service imported successfully');
          break;
        } catch (importError) {
          importAttempts++;
          console.warn(`Import attempt ${importAttempts} failed:`, importError);
          
          if (importAttempts >= maxAttempts) {
            throw new Error(`Failed to import imageLabelingService after ${maxAttempts} attempts: ${importError.message}`);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * importAttempts));
        }
      }
      
      if (!imageLabelingService) {
        throw new Error('imageLabelingService is undefined after import');
      }
      
      // Get API keys from storage (check both sync and local)
      const syncStorage = await chrome.storage.sync.get(['apiKeys']);
      const localStorage = await chrome.storage.local.get(['apiKeys']);
      const apiKeys = syncStorage.apiKeys || localStorage.apiKeys || {};
      
      console.log('Content Script - API Keys found:', {
        openai: apiKeys.openai ? `${apiKeys.openai.substring(0, 10)}...` : 'none',
        huggingface: apiKeys.huggingface ? `${apiKeys.huggingface.substring(0, 10)}...` : 'none',
        hasOpenAI: !!(apiKeys.openai && apiKeys.openai.trim().length > 0),
        hasHuggingFace: !!(apiKeys.huggingface && apiKeys.huggingface.trim().length > 0),
        openaiKeyLength: apiKeys.openai?.length || 0,
        huggingfaceKeyLength: apiKeys.huggingface?.length || 0
      });
      console.log('Content Script - Cloud mode enabled:', !!(apiKeys.openai || apiKeys.huggingface));
      
      // Initialize with options
      await imageLabelingService.initialize({
        autoScan: true,
        showDescribeButtons: true,
        cloudMode: !!(apiKeys.openai || apiKeys.huggingface),
        apiKeys,
        respectReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      });
      
      // Start the service
      await imageLabelingService.start();
      
      // Test API keys if available
      if (apiKeys.openai) {
        console.log('Testing OpenAI API key...');
        const { aiCaptioningService } = await import('../lib/aiCaptioningService');
        const isValid = await aiCaptioningService.testAPIKey('openai');
        console.log('OpenAI API key test result:', isValid);
      }
      
      // Listen for storage changes to refresh API keys
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' || namespace === 'local') {
          if (changes.apiKeys) {
            console.log('API keys updated, refreshing image labeling service...');
            imageLabelingService.refreshAPIKeys();
          }
        }
      });
      
      console.log('Image labeling service started successfully');
    } catch (error) {
      console.error('Failed to start image labeling:', error);
      this.isImageLabelingActive = false;
      this.updateImageLabelingButtonState();
      
      // Show user-friendly error message
      this.showErrorMessage('Image labeling service failed to start. Please reload the page and try again.');
    }
  }

  private async stopImageLabeling() {
    try {
      const { imageLabelingService } = await import('../lib/imageLabelingService');
      await imageLabelingService.stop();
      console.log('Image labeling service stopped');
    } catch (error) {
      console.error('Failed to stop image labeling:', error);
    }
  }

  private updateImageLabelingButtonState() {
    const btn = document.getElementById('autoaccess-image-labeling');
    if (btn) {
      if (this.isImageLabelingActive) {
        btn.style.background = 'rgba(34, 197, 94, 0.2)';
        btn.style.border = '2px solid #22c55e';
        btn.title = 'Stop AI Image Labeling';
      } else {
        btn.style.background = '';
        btn.style.border = '';
        btn.title = 'Start AI Image Labeling';
      }
    }
  }

  private showErrorMessage(message: string) {
    // Create a temporary error message overlay
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      text-align: center;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  private handleMessage(message: any, sender: any, sendResponse: (response?: any) => void) {
    console.log('Content script received message:', message);
    
    try {
      switch (message.type) {
        case 'TOGGLE_GLOBAL_MODE':
          this.toggleGlobalMode();
          sendResponse({ success: true, isActive: this.isGlobalModeActive });
          break;
        case 'TOGGLE_TTS':
          this.toggleTTS();
          sendResponse({ success: true });
          break;
        case 'TOGGLE_CONTRAST':
          this.toggleContrast();
          sendResponse({ success: true });
          break;
        case 'GET_GLOBAL_MODE_STATUS':
          sendResponse({ isActive: this.isGlobalModeActive });
          break;
        case 'TOGGLE_VOICE_COMMANDS':
          this.toggleVoiceCommands();
          sendResponse({ success: true });
          break;
        case 'TOGGLE_IMAGE_LABELING':
          this.toggleImageLabeling();
          sendResponse({ success: true });
          break;
        case 'GET_STATUS':
          sendResponse({
            globalMode: this.isGlobalModeActive,
            ttsActive: this.isTTSActive,
            contrastFix: document.body.style.filter === 'contrast(1.2) brightness(1.1)',
            voiceCommands: this.isVoiceCommandsActive,
            imageLabeling: this.isImageLabelingActive
          });
          break;
        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AutoAccessContent();
  });
} else {
  new AutoAccessContent();
}