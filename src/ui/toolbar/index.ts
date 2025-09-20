import { AccessibilityProfile } from '../../lib/types';

class FloatingToolbar {
  private shadowRoot!: ShadowRoot;
  private container!: HTMLElement;
  private currentProfile: AccessibilityProfile | null = null;
  private isVisible = false;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };

  constructor() {
    this.createToolbar();
    this.setupEventListeners();
    this.loadProfile();
  }

  private createToolbar(): void {
    // Create host element
    this.container = document.createElement('div');
    this.container.id = 'autoaccess-floating-toolbar';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      pointer-events: none;
    `;

    // Create shadow DOM
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        --primary-color: #3b82f6;
        --primary-hover: #2563eb;
        --background: rgba(255, 255, 255, 0.95);
        --border: rgba(0, 0, 0, 0.1);
        --text: #1f2937;
        --text-muted: #6b7280;
        --shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        --border-radius: 8px;
        --spacing: 8px;
      }

      .toolbar {
        background: var(--background);
        border: 1px solid var(--border);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        backdrop-filter: blur(10px);
        padding: var(--spacing);
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 48px;
        pointer-events: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .toolbar:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }

      .toolbar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
        padding-bottom: 4px;
        border-bottom: 1px solid var(--border);
      }

      .toolbar-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--text);
        margin: 0;
      }

      .toolbar-toggle {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        border-radius: 4px;
        color: var(--text-muted);
        transition: color 0.2s ease;
      }

      .toolbar-toggle:hover {
        color: var(--text);
        background: rgba(0, 0, 0, 0.05);
      }

      .toolbar-buttons {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .toolbar-button {
        background: none;
        border: none;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        min-height: 32px;
        transition: all 0.2s ease;
        position: relative;
        color: var(--text);
      }

      .toolbar-button:hover {
        background: rgba(59, 130, 246, 0.1);
        transform: scale(1.05);
      }

      .toolbar-button.active {
        background: rgba(59, 130, 246, 0.2);
        border: 1px solid var(--primary-color);
      }

      .toolbar-button.active::after {
        content: '';
        position: absolute;
        top: 2px;
        right: 2px;
        width: 6px;
        height: 6px;
        background: var(--primary-color);
        border-radius: 50%;
      }

      .toolbar-button .icon {
        font-size: 16px;
        line-height: 1;
      }

      .toolbar-button .label {
        font-size: 10px;
        margin-top: 2px;
        text-align: center;
        line-height: 1;
      }

      .toolbar-button[data-tooltip] {
        position: relative;
      }

      .toolbar-button[data-tooltip]:hover::before {
        content: attr(data-tooltip);
        position: absolute;
        left: 50%;
        bottom: 100%;
        transform: translateX(-50%);
        background: var(--text);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        margin-bottom: 4px;
      }

      .toolbar-button[data-tooltip]:hover::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 100%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: var(--text);
        margin-bottom: -4px;
      }

      .toolbar-collapsed .toolbar-buttons {
        display: none;
      }

      .toolbar-collapsed .toolbar-header {
        margin-bottom: 0;
        border-bottom: none;
      }

      .status-indicator {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 2px solid white;
      }

      .status-indicator.active {
        background: #10b981;
      }

      .status-indicator.inactive {
        background: #6b7280;
      }

      .status-indicator.warning {
        background: #f59e0b;
      }

      .status-indicator.error {
        background: #ef4444;
      }

      @media (prefers-reduced-motion: reduce) {
        .toolbar,
        .toolbar-button,
        .toolbar-toggle {
          transition: none;
        }
      }

      @media (prefers-color-scheme: dark) {
        :host {
          --background: rgba(31, 41, 55, 0.95);
          --border: rgba(255, 255, 255, 0.1);
          --text: #f9fafb;
          --text-muted: #9ca3af;
        }
      }
    `;

    // Create toolbar HTML
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    toolbar.innerHTML = `
      <div class="toolbar-header">
        <h3 class="toolbar-title">AutoAccess</h3>
        <button class="toolbar-toggle" data-action="toggle-visibility">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="toolbar-buttons">
        <button class="toolbar-button" data-action="global-mode" data-tooltip="Global Accessibility Mode">
          <div class="icon">🌐</div>
          <div class="label">Global</div>
          <div class="status-indicator inactive"></div>
        </button>
        <button class="toolbar-button" data-action="ocr" data-tooltip="AI-Powered OCR">
          <div class="icon">📷</div>
          <div class="label">OCR</div>
          <div class="status-indicator inactive"></div>
        </button>
        <button class="toolbar-button" data-action="tts" data-tooltip="Text-to-Speech">
          <div class="icon">🔊</div>
          <div class="label">TTS</div>
          <div class="status-indicator inactive"></div>
        </button>
        <button class="toolbar-button" data-action="stt" data-tooltip="Speech-to-Text">
          <div class="icon">🎤</div>
          <div class="label">STT</div>
          <div class="status-indicator inactive"></div>
        </button>
        <button class="toolbar-button" data-action="contrast" data-tooltip="Contrast Fixer">
          <div class="icon">🎨</div>
          <div class="label">Contrast</div>
          <div class="status-indicator inactive"></div>
        </button>
        <button class="toolbar-button" data-action="keyboard" data-tooltip="Keyboard Navigation">
          <div class="icon">⌨️</div>
          <div class="label">Keyboard</div>
          <div class="status-indicator inactive"></div>
        </button>
        <button class="toolbar-button" data-action="captions" data-tooltip="Live Captions">
          <div class="icon">📝</div>
          <div class="label">Captions</div>
          <div class="status-indicator inactive"></div>
        </button>
        <button class="toolbar-button" data-action="sign-language" data-tooltip="Sign Language Overlay">
          <div class="icon">👋</div>
          <div class="label">ASL</div>
          <div class="status-indicator inactive"></div>
        </button>
        <button class="toolbar-button" data-action="audit" data-tooltip="Accessibility Audit">
          <div class="icon">🔍</div>
          <div class="label">Audit</div>
        </button>
        <button class="toolbar-button" data-action="settings" data-tooltip="Settings">
          <div class="icon">⚙️</div>
          <div class="label">Settings</div>
        </button>
      </div>
    `;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(toolbar);
    document.body.appendChild(this.container);
  }

  private setupEventListeners(): void {
    const toolbar = this.shadowRoot.querySelector('.toolbar');
    if (!toolbar) return;

    // Handle button clicks
    toolbar.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('.toolbar-button') as HTMLElement;
      const toggle = target.closest('.toolbar-toggle') as HTMLElement;

      if (button) {
        const action = button.getAttribute('data-action');
        if (action) {
          this.handleAction(action);
        }
      } else if (toggle) {
        this.toggleVisibility();
      }
    });

    // Handle drag functionality
    const header = toolbar.querySelector('.toolbar-header');
    if (header) {
      header.addEventListener('mousedown', this.startDrag.bind(this) as EventListener);
      (header as HTMLElement).style.cursor = 'move';
    }

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        this.toggleVisibility();
      }
    });

    // Listen for profile changes
    document.addEventListener('autoaccess-profile-changed', (event: any) => {
      this.currentProfile = event.detail.profile;
      this.updateButtonStates();
    });

    // Listen for feature state changes
    document.addEventListener('autoaccess-feature-changed', (event: any) => {
      this.updateButtonState(event.detail.feature, event.detail.active);
    });
  }

  private startDrag(event: MouseEvent): void {
    this.isDragging = true;
    const rect = this.container.getBoundingClientRect();
    this.dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    document.addEventListener('mousemove', this.drag.bind(this));
    document.addEventListener('mouseup', this.stopDrag.bind(this));
  }

  private drag(event: MouseEvent): void {
    if (!this.isDragging) return;

    const x = event.clientX - this.dragOffset.x;
    const y = event.clientY - this.dragOffset.y;

    // Constrain to viewport
    const maxX = window.innerWidth - this.container.offsetWidth;
    const maxY = window.innerHeight - this.container.offsetHeight;

    this.container.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
    this.container.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    this.container.style.right = 'auto';
  }

  private stopDrag(): void {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.drag.bind(this));
    document.removeEventListener('mouseup', this.stopDrag.bind(this));
  }

  private async loadProfile(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROFILE' });
      if (response.profile) {
        this.currentProfile = response.profile;
        this.updateButtonStates();
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }

  private updateButtonStates(): void {
    if (!this.currentProfile) return;

    const states = {
      'global-mode': this.currentProfile.settings.globalMode,
      'ocr': this.currentProfile.settings.ocrEnabled,
      'tts': this.currentProfile.settings.ttsEnabled,
      'stt': this.currentProfile.settings.sttEnabled,
      'contrast': this.currentProfile.settings.contrastFix,
      'keyboard': this.currentProfile.settings.keyboardMode,
      'captions': this.currentProfile.settings.captions,
      'sign-language': this.currentProfile.settings.signLanguage
    };

    Object.entries(states).forEach(([action, active]) => {
      this.updateButtonState(action, active);
    });
  }

  private updateButtonState(action: string, active: boolean): void {
    const button = this.shadowRoot.querySelector(`[data-action="${action}"]`) as HTMLElement;
    if (!button) return;

    const indicator = button.querySelector('.status-indicator') as HTMLElement;
    
    button.classList.toggle('active', active);
    
    if (indicator) {
      indicator.className = `status-indicator ${active ? 'active' : 'inactive'}`;
    }
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'global-mode':
        this.toggleGlobalMode();
        break;
      case 'ocr':
        this.toggleOCR();
        break;
      case 'tts':
        this.toggleTTS();
        break;
      case 'stt':
        this.toggleSTT();
        break;
      case 'contrast':
        this.toggleContrast();
        break;
      case 'keyboard':
        this.toggleKeyboard();
        break;
      case 'captions':
        this.toggleCaptions();
        break;
      case 'sign-language':
        this.toggleSignLanguage();
        break;
      case 'audit':
        this.runAudit();
        break;
      case 'settings':
        this.openSettings();
        break;
    }
  }

  private async toggleGlobalMode(): Promise<void> {
    await chrome.runtime.sendMessage({ type: 'TOGGLE_GLOBAL_MODE' });
  }

  private async toggleOCR(): Promise<void> {
    // Toggle OCR feature
    const event = new CustomEvent('autoaccess-toggle-ocr');
    document.dispatchEvent(event);
  }

  private async toggleTTS(): Promise<void> {
    // Toggle TTS feature
    const event = new CustomEvent('autoaccess-toggle-tts');
    document.dispatchEvent(event);
  }

  private async toggleSTT(): Promise<void> {
    // Toggle STT feature
    const event = new CustomEvent('autoaccess-toggle-stt');
    document.dispatchEvent(event);
  }

  private async toggleContrast(): Promise<void> {
    // Toggle contrast fixer
    const event = new CustomEvent('autoaccess-toggle-contrast');
    document.dispatchEvent(event);
  }

  private async toggleKeyboard(): Promise<void> {
    // Toggle keyboard navigation
    const event = new CustomEvent('autoaccess-toggle-keyboard');
    document.dispatchEvent(event);
  }

  private async toggleCaptions(): Promise<void> {
    // Toggle live captions
    const event = new CustomEvent('autoaccess-toggle-captions');
    document.dispatchEvent(event);
  }

  private async toggleSignLanguage(): Promise<void> {
    // Toggle sign language overlay
    const event = new CustomEvent('autoaccess-toggle-sign-language');
    document.dispatchEvent(event);
  }

  private async runAudit(): Promise<void> {
    await chrome.runtime.sendMessage({ type: 'AUDIT_RUN' });
  }

  private openSettings(): void {
    chrome.runtime.openOptionsPage();
  }

  private toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    const toolbar = this.shadowRoot.querySelector('.toolbar') as HTMLElement;
    
    if (this.isVisible) {
      toolbar.classList.remove('toolbar-collapsed');
    } else {
      toolbar.classList.add('toolbar-collapsed');
    }
  }

  public show(): void {
    this.container.style.display = 'block';
  }

  public hide(): void {
    this.container.style.display = 'none';
  }

  public destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// Initialize toolbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new FloatingToolbar());
} else {
  new FloatingToolbar();
}
