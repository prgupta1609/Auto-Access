export interface AccessibilityProfile {
  id: string;
  name: string;
  description: string;
  settings: {
    globalMode: boolean;
    ocrEnabled: boolean;
    ttsEnabled: boolean;
    sttEnabled: boolean;
    contrastFix: boolean;
    keyboardMode: boolean;
    captions: boolean;
    signLanguage: boolean;
    fontSize: number;
    colorBlindPreset?: 'protanopia' | 'deuteranopia' | 'tritanopia';
  };
  siteOverrides: Record<string, Partial<AccessibilityProfile['settings']>>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AICaptionResult {
  short: string;
  long: string;
  confidence: number;
  tokens?: number;
  model?: string;
}

export interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  provider?: 'browser' | 'openai' | 'elevenlabs';
}

export interface STTOptions {
  language?: string;
  provider?: 'browser' | 'openai' | 'assemblyai';
  continuous?: boolean;
}

export interface ContrastFixOptions {
  targetRatio?: number;
  colorBlindPreset?: 'protanopia' | 'deuteranopia' | 'tritanopia';
  preserveBranding?: boolean;
}

export interface KeyboardNavigationOptions {
  skipLinks: boolean;
  logicalTabOrder: boolean;
  ariaFixes: boolean;
  spaSupport: boolean;
}

export interface AuditResult {
  violations: Array<{
    id: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
    description: string;
    help: string;
    helpUrl: string;
    nodes: Array<{
      html: string;
      target: string[];
      failureSummary: string;
    }>;
  }>;
  passes: Array<{
    id: string;
    description: string;
    nodes: Array<{
      html: string;
      target: string[];
    }>;
  }>;
  incomplete: Array<{
    id: string;
    description: string;
    nodes: Array<{
      html: string;
      target: string[];
    }>;
  }>;
  timestamp: Date;
  url: string;
}

export interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  anonymized: boolean;
}

export interface StorageBudget {
  used: number;
  available: number;
  percentage: number;
}

export interface ExtensionMessage {
  type: string;
  payload?: any;
  tabId?: number;
}

export interface APIKeys {
  openai?: string;
  elevenlabs?: string;
  assemblyai?: string;
  huggingface?: string;
  chromeWebstore?: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
}
