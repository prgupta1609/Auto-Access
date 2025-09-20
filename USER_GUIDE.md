# AutoAccess User Guide

Welcome to AutoAccess, the complete accessibility solution for Chrome! This guide will help you get started and make the most of all the features.

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Core Features](#core-features)
4. [Accessibility Profiles](#accessibility-profiles)
5. [AI-Powered Features](#ai-powered-features)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Settings & Configuration](#settings--configuration)
8. [Troubleshooting](#troubleshooting)
9. [Privacy & Security](#privacy--security)
10. [Support](#support)

## Installation

### From Chrome Web Store (Recommended)

1. Visit the [AutoAccess Chrome Web Store page](https://chrome.google.com/webstore/detail/autoaccess/extension-id)
2. Click "Add to Chrome"
3. Confirm the installation when prompted
4. The AutoAccess icon will appear in your Chrome toolbar

### Manual Installation (Developer Mode)

1. Download the latest release from [GitHub](https://github.com/autoaccess/autoaccess/releases)
2. Extract the `autoaccess.zip` file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extracted folder
6. AutoAccess will be installed and ready to use

## Getting Started

### First Launch

1. Click the AutoAccess icon in your Chrome toolbar
2. The popup will open showing the main interface
3. Choose your accessibility profile or create a custom one
4. Start with the "Default" profile to explore features

### Quick Setup

1. **Choose a Profile**: Select from predefined profiles (Blind User, Low Vision, Dyslexic) or create your own
2. **Enable Features**: Toggle the features you need using the main interface
3. **Configure API Keys** (Optional): Add your API keys for enhanced AI features
4. **Test Features**: Try the quick actions to test functionality

## Core Features

### 🌐 Global Accessibility Mode

One-click comprehensive accessibility improvements for any webpage.

**How to use:**
1. Click the AutoAccess icon
2. Toggle "Global Accessibility Mode"
3. The extension will automatically:
   - Run accessibility audits
   - Apply safe fixes
   - Show before/after visual diff
   - Generate downloadable reports

**What it does:**
- Fixes missing alt text on images
- Improves color contrast
- Adds proper ARIA labels
- Fixes heading hierarchy
- Enhances keyboard navigation

### 📷 AI-Powered OCR

Extract and describe text from images using advanced AI.

**How to use:**
1. Enable OCR in your profile settings
2. Images without alt text will be automatically processed
3. Click the OCR button in the toolbar for manual processing
4. View extracted text and AI-generated descriptions

**Features:**
- Automatic image processing
- AI-generated alt text
- Confidence scoring
- Batch processing
- Multiple language support

### 🔊 Text-to-Speech (TTS)

Read content aloud with synchronized word highlighting.

**How to use:**
1. Enable TTS in your profile
2. Select text on any webpage
3. Right-click and choose "Read with AutoAccess"
4. Or use the TTS button in the toolbar

**Features:**
- Multiple voice options
- Adjustable speed and pitch
- Word-by-word highlighting
- Browser and cloud voices
- Keyboard shortcuts (Alt+R)

### 🎤 Speech-to-Text (STT)

Voice navigation and commands for hands-free browsing.

**How to use:**
1. Enable STT in your profile
2. Click the microphone button
3. Speak commands like:
   - "Read this page"
   - "Next element"
   - "Click button"
   - "Scroll down"

**Voice Commands:**
- **Navigation**: "Next", "Previous", "Go back"
- **Reading**: "Read", "Speak", "Stop"
- **Interaction**: "Click", "Select", "Choose"
- **Scrolling**: "Scroll up/down/left/right"
- **Search**: "Find", "Search for"

### 🎨 Smart Contrast Fixer

Improve color contrast and readability with intelligent adjustments.

**How to use:**
1. Enable Contrast Fix in your profile
2. Choose color-blind presets if needed
3. Adjust font size multiplier
4. The extension will automatically fix contrast issues

**Features:**
- WCAG 2.1 AA compliance
- Color-blind presets (Protanopia, Deuteranopia, Tritanopia)
- Font size adjustment
- Brand color preservation
- Real-time preview

### ⌨️ Enhanced Keyboard Navigation

Advanced keyboard navigation with skip links and logical tab order.

**How to use:**
1. Enable Keyboard Mode in your profile
2. Use Tab to navigate through elements
3. Use arrow keys for directional navigation
4. Press Enter or Space to activate elements

**Features:**
- Skip links for main content
- Logical tab order
- ARIA attribute fixes
- SPA route change support
- Visual focus indicators

### 📝 Live Captions

Real-time captions for video and audio content.

**How to use:**
1. Enable Captions in your profile
2. Play any video or audio on the page
3. Captions will appear automatically
4. Click the captions to search through content

**Features:**
- Automatic caption generation
- Searchable transcripts
- Customizable appearance
- Multiple language support
- Offline processing

### 👋 Sign Language Overlay

ASL avatar animations for key phrases and instructions.

**How to use:**
1. Enable Sign Language in your profile
2. The avatar will appear in the bottom right
3. Animations play for important content
4. Click the avatar for manual control

**Features:**
- Lottie-based animations
- Common ASL phrases
- Customizable avatar
- Context-aware triggers
- Educational content

## Accessibility Profiles

### Predefined Profiles

#### Default Profile
- Balanced accessibility features
- Good for general use
- Moderate resource usage

#### Blind User Profile
- Optimized for screen readers
- Enhanced TTS and STT
- Comprehensive keyboard navigation
- Audio descriptions

#### Low Vision Profile
- Enhanced visual accessibility
- High contrast mode
- Large text support
- Color-blind presets

#### Dyslexic Profile
- Reading support features
- Enhanced TTS
- Font adjustments
- Reduced visual clutter

### Creating Custom Profiles

1. Click the AutoAccess icon
2. Click "Settings" or the gear icon
3. Go to the "Profiles" tab
4. Click "Create Profile"
5. Configure your settings:
   - Name and description
   - Feature toggles
   - Font size multiplier
   - Color-blind presets
   - Site-specific overrides

### Site-Specific Overrides

Create different settings for specific websites:

1. Open the website you want to customize
2. Go to AutoAccess settings
3. Edit your profile
4. Add site override for the current domain
5. Configure different settings for this site

## AI-Powered Features

### Setting Up API Keys

For enhanced AI features, you can add API keys:

1. Go to AutoAccess settings
2. Click the "API Keys" tab
3. Add your keys:
   - **OpenAI**: For GPT-4 image captioning and TTS
   - **ElevenLabs**: For premium TTS voices
   - **AssemblyAI**: For advanced STT
   - **HuggingFace**: For open-source AI models

### AI Image Captioning

**Without API Keys:**
- Basic OCR text extraction
- Simple image detection
- Local processing only

**With OpenAI API:**
- Detailed image descriptions
- Context-aware captions
- High accuracy
- Multiple description lengths

**With HuggingFace API:**
- Open-source models
- Privacy-focused
- Good accuracy
- Free tier available

### Advanced TTS

**Browser TTS (Default):**
- Built-in voices
- No API key required
- Good quality
- Limited voice options

**OpenAI TTS:**
- High-quality voices
- Multiple languages
- Consistent quality
- API usage costs

**ElevenLabs TTS:**
- Premium voices
- Emotional expression
- Custom voice cloning
- High cost

### Advanced STT

**Browser STT (Default):**
- Built-in recognition
- No API key required
- Basic accuracy
- Limited languages

**OpenAI Whisper:**
- High accuracy
- Multiple languages
- Good noise handling
- API usage costs

**AssemblyAI:**
- Real-time transcription
- Speaker identification
- Custom vocabulary
- Professional features

## Keyboard Shortcuts

### Global Shortcuts

- **Alt+A**: Toggle Global Accessibility Mode
- **Alt+R**: Toggle Text-to-Speech (read/pause)
- **Alt+S**: Toggle Speech-to-Text (start/stop)

### Extension Shortcuts

- **Ctrl+Shift+A**: Open AutoAccess popup
- **Ctrl+Shift+O**: Open AutoAccess settings
- **Ctrl+Shift+D**: Open DevTools panel

### Navigation Shortcuts (when Keyboard Mode is enabled)

- **Tab**: Next focusable element
- **Shift+Tab**: Previous focusable element
- **Enter/Space**: Activate element
- **Arrow Keys**: Directional navigation
- **Home**: First element
- **End**: Last element
- **Escape**: Exit keyboard mode

### Voice Commands

- **"Read"**: Read selected text or page
- **"Stop"**: Stop current TTS
- **"Next"**: Navigate to next element
- **"Previous"**: Navigate to previous element
- **"Click [element]"**: Click specified element
- **"Scroll [direction]"**: Scroll in specified direction
- **"Find [text]"**: Search for text on page

## Settings & Configuration

### General Settings

**Analytics:**
- Enable/disable anonymous usage data
- View data collection details
- Control data retention

**Privacy:**
- Local processing preferences
- Cloud feature toggles
- Data export options

**Performance:**
- Memory usage monitoring
- Storage budget alerts
- Background processing limits

### Advanced Settings

**API Configuration:**
- Rate limiting settings
- Batch processing options
- Fallback preferences

**Accessibility:**
- Screen reader compatibility
- High contrast mode
- Reduced motion preferences

**Developer Options:**
- Debug logging
- Performance monitoring
- Experimental features

## Troubleshooting

### Common Issues

#### Extension Not Working
1. Check if extension is enabled in `chrome://extensions/`
2. Refresh the webpage
3. Restart Chrome
4. Check for Chrome updates

#### Features Not Activating
1. Verify your profile settings
2. Check API keys if using cloud features
3. Ensure permissions are granted
4. Try disabling and re-enabling features

#### Performance Issues
1. Check storage usage in settings
2. Clear extension cache
3. Disable unused features
4. Restart Chrome

#### Audio Issues
1. Check browser audio permissions
2. Verify system audio settings
3. Try different voice options
4. Test with different websites

### Getting Help

1. **Check the FAQ** in the settings
2. **View logs** in the DevTools panel
3. **Report issues** on GitHub
4. **Join Discord** for community support
5. **Email support** for direct help

### Debug Mode

Enable debug mode for detailed logging:

1. Go to AutoAccess settings
2. Click "About" tab
3. Enable "Debug Mode"
4. Check browser console for logs
5. Use DevTools panel for detailed information

## Privacy & Security

### Data Collection

**What we collect:**
- Anonymous usage statistics (if enabled)
- Error reports for debugging
- Performance metrics
- Feature usage patterns

**What we don't collect:**
- Personal information
- Page content
- Specific URLs
- API keys or passwords

### Local Processing

- All accessibility features work locally
- No data sent to external servers by default
- API keys stored encrypted in browser
- Optional cloud features clearly marked

### API Key Security

- Keys stored locally and encrypted
- Never transmitted to our servers
- Only used for configured services
- Can be removed at any time

### GDPR Compliance

- Clear consent for data collection
- Right to access your data
- Right to delete your data
- Data portability options
- Opt-out at any time

## Support

### Documentation

- [Developer Documentation](DEVELOPER_DOCS.md)
- [GitHub Repository](https://github.com/autoaccess/autoaccess)
- [API Reference](https://github.com/autoaccess/autoaccess/wiki/API-Reference)
- [Contributing Guide](CONTRIBUTING.md)

### Community

- [Discord Server](https://discord.gg/autoaccess)
- [GitHub Discussions](https://github.com/autoaccess/autoaccess/discussions)
- [Reddit Community](https://reddit.com/r/autoaccess)
- [Twitter](https://twitter.com/autoaccess)

### Professional Support

- **Email**: support@autoaccess.dev
- **Enterprise**: enterprise@autoaccess.dev
- **Privacy**: privacy@autoaccess.dev
- **Security**: security@autoaccess.dev

### Reporting Issues

1. **Bug Reports**: [GitHub Issues](https://github.com/autoaccess/autoaccess/issues)
2. **Feature Requests**: [GitHub Discussions](https://github.com/autoaccess/autoaccess/discussions)
3. **Security Issues**: security@autoaccess.dev
4. **Accessibility Issues**: accessibility@autoaccess.dev

---

## Quick Reference

### Essential Commands
- **Alt+A**: Toggle Global Mode
- **Alt+R**: Toggle TTS
- **Alt+S**: Toggle STT
- **Ctrl+Shift+A**: Open popup

### Voice Commands
- "Read this page"
- "Next element"
- "Click button"
- "Scroll down"
- "Find search"

### Profile Shortcuts
- **Default**: Balanced features
- **Blind**: Screen reader optimized
- **Low Vision**: Visual enhancements
- **Dyslexic**: Reading support

### API Keys (Optional)
- **OpenAI**: Enhanced AI features
- **ElevenLabs**: Premium TTS
- **AssemblyAI**: Advanced STT
- **HuggingFace**: Open-source AI

---

Thank you for using AutoAccess! We're committed to making the web more accessible for everyone. If you have any questions or suggestions, please don't hesitate to reach out to our community or support team.
