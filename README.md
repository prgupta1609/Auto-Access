# 🚀 AutoAccess - AI-Powered Accessibility Extension

**Making the web accessible for everyone with cutting-edge AI technology**

[![CI](https://github.com/prgupta1609/Auto-Access/actions/workflows/ci.yml/badge.svg)](https://github.com/prgupta1609/Auto-Access/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-green.svg)]()

AutoAccess is a comprehensive Chrome extension that transforms any website into an accessible experience through AI-powered features, intelligent automation, and WCAG 2.1 AA compliance tools. Built with modern web technologies, it provides one-click accessibility improvements, advanced AI capabilities, and developer-friendly debugging tools.

## ✨ Key Features

### 🤖 **AI-Powered Accessibility**
- **Smart OCR & Image Recognition** - Automatically describes images and visual content
- **Intelligent Text-to-Speech** - Natural voice synthesis for web content
- **Speech-to-Text Input** - Voice commands and dictation support
- **AI Caption Generation** - Automatic captions for multimedia content

### 🎯 **One-Click Improvements**
- **Contrast Enhancement** - Automatically adjusts colors for better readability
- **Font Size Optimization** - Dynamic text scaling based on user preferences
- **Keyboard Navigation** - Enhanced keyboard shortcuts and tab navigation
- **Screen Reader Integration** - Seamless compatibility with assistive technologies

### 🛠️ **Developer Tools**
- **Accessibility Audit Panel** - Comprehensive WCAG compliance checking
- **Element Inspector** - Real-time accessibility analysis
- **DevTools Integration** - Built-in debugging and testing tools
- **Performance Monitoring** - Accessibility impact on page performance

### 🔒 **Privacy & Security**
- **Local Processing** - All AI features run locally when possible
- **No Data Collection** - Privacy-first approach with minimal telemetry
- **Secure Communication** - Encrypted API calls for cloud services
- **User Control** - Complete control over data sharing preferences

## 🚀 Quick Start

### Installation

1. **Download the Extension**
   ```bash
   git clone https://github.com/prgupta1609/Auto-Access.git
   cd Auto-Access
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Build the Extension**
   ```bash
   pnpm build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Usage

1. **Click the AutoAccess icon** in your browser toolbar
2. **Select your accessibility profile** (Beginner, Advanced, Developer)
3. **Enable desired features** from the popup menu
4. **Browse any website** - AutoAccess will automatically improve accessibility

## 🏗️ Development

### Prerequisites
- Node.js 20+
- pnpm 10+
- Chrome browser for testing

### Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Type checking
pnpm type-check
```

### Project Structure

```
src/
├── background/          # Extension background scripts
├── content/            # Content scripts for web pages
├── devtools/           # Chrome DevTools integration
├── lib/                # Core libraries and services
│   ├── aiCaptioningService.ts
│   ├── imageLabelingService.ts
│   ├── ttsService.ts
│   └── ocrService.ts
├── ui/                 # User interface components
│   ├── popup/          # Extension popup
│   ├── options/        # Settings page
│   └── welcome/        # Onboarding experience
└── manifest.json       # Extension manifest
```

## 🔧 Configuration

### API Keys Setup

AutoAccess supports various AI services for enhanced functionality:

1. **OpenAI API** - For advanced AI captioning
2. **Google Cloud Vision** - For image recognition
3. **Azure Cognitive Services** - For speech processing

Configure your API keys in the extension options page.

### Accessibility Profiles

- **Beginner** - Basic accessibility improvements
- **Advanced** - Full feature set with customization
- **Developer** - Includes debugging and audit tools

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for public APIs

## 📚 Documentation

- [User Guide](USER_GUIDE.md) - Complete user manual
- [Developer Docs](DEVELOPER_DOCS.md) - Technical documentation
- [API Reference](docs/api.md) - API documentation
- [Changelog](CHANGELOG.md) - Version history

## 🐛 Troubleshooting

### Common Issues

**Extension not loading:**
- Check Chrome Developer Tools for errors
- Verify manifest.json is valid
- Ensure all required files are present

**AI features not working:**
- Verify API keys are configured
- Check internet connection for cloud services
- Review browser console for error messages

**Performance issues:**
- Disable unnecessary features
- Check available system resources
- Review extension permissions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/)
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR capabilities
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/prgupta1609/Auto-Access/issues)
- **Discussions**: [GitHub Discussions](https://github.com/prgupta1609/Auto-Access/discussions)
- **Email**: priyagupta08506@gmail.com & himanshuofficialuserid@gmail.com

---


**Made with ❤️ for a more accessible web**
