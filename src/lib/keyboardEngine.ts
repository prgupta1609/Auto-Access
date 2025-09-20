import { KeyboardNavigationOptions } from './types.js';

export class KeyboardEngine {
  private isActive = false;
  private currentElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];
  private currentIndex = 0;
  private options: KeyboardNavigationOptions = {
    skipLinks: true,
    logicalTabOrder: true,
    ariaFixes: true,
    spaSupport: true
  };
  private originalTabIndex: Map<HTMLElement, number> = new Map();
  private skipLinks: HTMLElement[] = [];

  constructor(options: Partial<KeyboardNavigationOptions> = {}) {
    this.options = { ...this.options, ...options };
    this.initialize();
  }

  private initialize(): void {
    this.setupEventListeners();
    this.createSkipLinks();
    this.fixTabOrder();
    this.fixAriaAttributes();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
    
    // Handle SPA route changes
    if (this.options.spaSupport) {
      this.observeRouteChanges();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isActive) return;

    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        this.navigate(event.shiftKey ? 'previous' : 'next');
        break;
      case 'Enter':
      case ' ':
        if (this.currentElement) {
          this.activateElement(this.currentElement);
        }
        break;
      case 'Escape':
        this.deactivate();
        break;
      case 'Home':
        event.preventDefault();
        this.navigateToFirst();
        break;
      case 'End':
        event.preventDefault();
        this.navigateToLast();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigate('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigate('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.navigate('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.navigate('right');
        break;
    }
  }

  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (target && this.focusableElements.includes(target)) {
      this.currentElement = target;
      this.currentIndex = this.focusableElements.indexOf(target);
      this.highlightElement(target);
    }
  }

  private handleFocusOut(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (target) {
      this.unhighlightElement(target);
    }
  }

  async activate(): Promise<void> {
    if (this.isActive) return;
    
    this.isActive = true;
    this.updateFocusableElements();
    
    if (this.focusableElements.length > 0) {
      this.currentIndex = 0;
      this.currentElement = this.focusableElements[0];
      this.currentElement.focus();
      this.highlightElement(this.currentElement);
    }
    
    // Show keyboard navigation indicator
    this.showNavigationIndicator();
  }

  async deactivate(): Promise<void> {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.currentElement) {
      this.unhighlightElement(this.currentElement);
      this.currentElement.blur();
    }
    
    this.currentElement = null;
    this.currentIndex = 0;
    
    // Hide keyboard navigation indicator
    this.hideNavigationIndicator();
  }

  private navigate(direction: 'next' | 'previous' | 'up' | 'down' | 'left' | 'right'): void {
    if (this.focusableElements.length === 0) return;

    let newIndex = this.currentIndex;

    switch (direction) {
      case 'next':
        newIndex = (this.currentIndex + 1) % this.focusableElements.length;
        break;
      case 'previous':
        newIndex = this.currentIndex === 0 
          ? this.focusableElements.length - 1 
          : this.currentIndex - 1;
        break;
      case 'up':
        newIndex = this.findElementAbove();
        break;
      case 'down':
        newIndex = this.findElementBelow();
        break;
      case 'left':
        newIndex = this.findElementLeft();
        break;
      case 'right':
        newIndex = this.findElementRight();
        break;
    }

    if (newIndex !== -1 && newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      this.currentElement = this.focusableElements[newIndex];
      this.currentElement.focus();
      this.scrollIntoView(this.currentElement);
    }
  }

  private findElementAbove(): number {
    if (!this.currentElement) return -1;
    
    const currentRect = this.currentElement.getBoundingClientRect();
    let bestIndex = -1;
    let bestDistance = Infinity;
    
    this.focusableElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      
      // Element must be above current element
      if (rect.bottom <= currentRect.top) {
        const distance = Math.abs(rect.left - currentRect.left);
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      }
    });
    
    return bestIndex;
  }

  private findElementBelow(): number {
    if (!this.currentElement) return -1;
    
    const currentRect = this.currentElement.getBoundingClientRect();
    let bestIndex = -1;
    let bestDistance = Infinity;
    
    this.focusableElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      
      // Element must be below current element
      if (rect.top >= currentRect.bottom) {
        const distance = Math.abs(rect.left - currentRect.left);
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      }
    });
    
    return bestIndex;
  }

  private findElementLeft(): number {
    if (!this.currentElement) return -1;
    
    const currentRect = this.currentElement.getBoundingClientRect();
    let bestIndex = -1;
    let bestDistance = Infinity;
    
    this.focusableElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      
      // Element must be to the left of current element
      if (rect.right <= currentRect.left) {
        const distance = Math.abs(rect.top - currentRect.top);
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      }
    });
    
    return bestIndex;
  }

  private findElementRight(): number {
    if (!this.currentElement) return -1;
    
    const currentRect = this.currentElement.getBoundingClientRect();
    let bestIndex = -1;
    let bestDistance = Infinity;
    
    this.focusableElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      
      // Element must be to the right of current element
      if (rect.left >= currentRect.right) {
        const distance = Math.abs(rect.top - currentRect.top);
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      }
    });
    
    return bestIndex;
  }

  private navigateToFirst(): void {
    if (this.focusableElements.length > 0) {
      this.currentIndex = 0;
      this.currentElement = this.focusableElements[0];
      this.currentElement.focus();
      this.scrollIntoView(this.currentElement);
    }
  }

  private navigateToLast(): void {
    if (this.focusableElements.length > 0) {
      this.currentIndex = this.focusableElements.length - 1;
      this.currentElement = this.focusableElements[this.currentIndex];
      this.currentElement.focus();
      this.scrollIntoView(this.currentElement);
    }
  }

  private activateElement(element: HTMLElement): void {
    if (element.tagName === 'A' || element.tagName === 'BUTTON') {
      element.click();
    } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.focus();
    } else if (element.getAttribute('role') === 'button') {
      element.click();
    } else if (element.getAttribute('tabindex') !== null) {
      element.click();
    }
  }

  private updateFocusableElements(): void {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="option"]'
    ];

    this.focusableElements = Array.from(
      document.querySelectorAll(selectors.join(', '))
    ) as HTMLElement[];

    // Filter out hidden elements
    this.focusableElements = this.focusableElements.filter(element => {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             element.offsetParent !== null;
    });

    // Sort by tab order if enabled
    if (this.options.logicalTabOrder) {
      this.focusableElements.sort((a, b) => {
        const aTabIndex = parseInt(a.getAttribute('tabindex') || '0');
        const bTabIndex = parseInt(b.getAttribute('tabindex') || '0');
        
        if (aTabIndex !== bTabIndex) {
          return aTabIndex - bTabIndex;
        }
        
        // Sort by document order
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
    }
  }

  private createSkipLinks(): void {
    if (!this.options.skipLinks) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
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

    // Create main content landmark if it doesn't exist
    let mainContent = document.getElementById('main-content');
    if (!mainContent) {
      mainContent = document.createElement('main');
      mainContent.id = 'main-content';
      mainContent.setAttribute('role', 'main');
      document.body.appendChild(mainContent);
    }

    this.skipLinks.push(skipLink);
  }

  private fixTabOrder(): void {
    if (!this.options.logicalTabOrder) return;

    // Ensure proper tab order for common elements
    const elements = document.querySelectorAll('*');
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Fix tabindex for interactive elements
      if (htmlElement.tagName === 'DIV' && htmlElement.getAttribute('role') === 'button') {
        if (!htmlElement.hasAttribute('tabindex')) {
          htmlElement.setAttribute('tabindex', '0');
        }
      }
      
      // Remove tabindex from non-interactive elements
      if (htmlElement.tagName === 'DIV' && 
          !htmlElement.getAttribute('role') && 
          !htmlElement.onclick) {
        const tabIndex = htmlElement.getAttribute('tabindex');
        if (tabIndex && tabIndex !== '-1') {
          this.originalTabIndex.set(htmlElement, parseInt(tabIndex));
          htmlElement.removeAttribute('tabindex');
        }
      }
    });
  }

  private fixAriaAttributes(): void {
    if (!this.options.ariaFixes) return;

    // Add missing ARIA labels
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach((button) => {
      const htmlButton = button as HTMLButtonElement;
      if (!htmlButton.textContent?.trim()) {
        htmlButton.setAttribute('aria-label', 'Button');
      }
    });

    // Fix form labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach((input) => {
      const htmlInput = input as HTMLInputElement;
      const label = document.querySelector(`label[for="${htmlInput.id}"]`);
      if (!label && !htmlInput.getAttribute('placeholder')) {
        htmlInput.setAttribute('aria-label', htmlInput.type || 'Input');
      }
    });

    // Add landmark roles
    const header = document.querySelector('header');
    if (header && !header.getAttribute('role')) {
      header.setAttribute('role', 'banner');
    }

    const nav = document.querySelector('nav');
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
    }

    const main = document.querySelector('main');
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main');
    }

    const footer = document.querySelector('footer');
    if (footer && !footer.getAttribute('role')) {
      footer.setAttribute('role', 'contentinfo');
    }
  }

  private observeRouteChanges(): void {
    // Observe DOM changes for SPA route changes
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        setTimeout(() => {
          this.updateFocusableElements();
          this.fixTabOrder();
          this.fixAriaAttributes();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private highlightElement(element: HTMLElement): void {
    element.style.outline = '2px solid #3b82f6';
    element.style.outlineOffset = '2px';
  }

  private unhighlightElement(element: HTMLElement): void {
    element.style.outline = '';
    element.style.outlineOffset = '';
  }

  private scrollIntoView(element: HTMLElement): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }

  private showNavigationIndicator(): void {
    const indicator = document.createElement('div');
    indicator.id = 'keyboard-navigation-indicator';
    indicator.textContent = 'Keyboard Navigation Active';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #3b82f6;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(indicator);
  }

  private hideNavigationIndicator(): void {
    const indicator = document.getElementById('keyboard-navigation-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  getActiveStatus(): boolean {
    return this.isActive;
  }

  getCurrentElement(): HTMLElement | null {
    return this.currentElement;
  }

  getFocusableElementsCount(): number {
    return this.focusableElements.length;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  updateOptions(newOptions: Partial<KeyboardNavigationOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    if (newOptions.skipLinks !== undefined) {
      if (newOptions.skipLinks) {
        this.createSkipLinks();
      } else {
        this.skipLinks.forEach(link => link.remove());
        this.skipLinks = [];
      }
    }
    
    if (newOptions.logicalTabOrder !== undefined || newOptions.ariaFixes !== undefined) {
      this.fixTabOrder();
      this.fixAriaAttributes();
    }
  }
}
