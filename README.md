# AutoAccess - AI-Powered Accessibility Extension

[![CI](https://github.com/autoaccess/autoaccess/workflows/CI/badge.svg)](https://github.com/autoaccess/autoaccess/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-green.svg)](https://chrome.google.com/webstore/detail/autoaccess/extension-id)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/autoaccess/autoaccess/releases)

> **Making the web accessible for everyone with AI-powered features**

AutoAccess is a comprehensive Chrome extension that brings advanced accessibility features to any website. Built with modern web technologies and powered by AI, it provides one-click accessibility improvements, intelligent image captioning, text-to-speech, and much more.

## 🌟 Features

### 🚀 Core Accessibility Features

- **🌐 Global Accessibility Mode**: One-click comprehensive accessibility improvements
- **📷 AI-Powered OCR**: Extract and describe text from images using advanced AI
- **🔊 Text-to-Speech**: Read content aloud with synchronized word highlighting
- **🎤 Speech-to-Text**: Voice navigation and commands for hands-free browsing
- **🎨 Smart Contrast Fixer**: WCAG 2.1 AA compliant color contrast improvements
- **⌨️ Enhanced Keyboard Navigation**: Advanced keyboard navigation with skip links
- **📝 Live Captions**: Real-time captions for video and audio content
- **👋 Sign Language Overlay**: ASL avatar animations for key phrases

### 🛠️ Developer & Advanced Features

- **🔍 Comprehensive Auditing**: axe-core integration with detailed reports
- **🛠️ DevTools Integration**: Accessibility debugging panel
- **📊 Analytics Dashboard**: Usage insights and performance metrics
- **🔒 Privacy-First**: Local processing with optional cloud features
- **🌍 Multi-Language**: Support for multiple languages and locales
- **⚡ Performance Optimized**: Efficient resource usage and lazy loading

## 🚀 Quick Start

### Installation

#### From Chrome Web Store (Recommended)
1. Visit the [AutoAccess Chrome Web Store page](https://chrome.google.com/webstore/detail/autoaccess/extension-id)
2. Click "Add to Chrome"
3. Start using accessibility features immediately!

#### Manual Installation
1. Download the latest release from [GitHub Releases](https://github.com/autoaccess/autoaccess/releases)
2. Extract the `autoaccess.zip` file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted folder

### First Use

1. **Click the AutoAccess icon** in your Chrome toolbar
2. **Choose a profile** (Default, Blind User, Low Vision, or Dyslexic)
3. **Enable features** you need using the toggle switches
4. **Start browsing** with enhanced accessibility!

## 🎯 Use Cases

### For Users with Disabilities
- **Visual Impairments**: High contrast mode, text-to-speech, image descriptions
- **Hearing Impairments**: Live captions, visual notifications
- **Motor Impairments**: Voice navigation, keyboard shortcuts
- **Cognitive Disabilities**: Simplified interfaces, reading assistance

### For Developers
- **Accessibility Testing**: Comprehensive audits and reports
- **WCAG Compliance**: Automated fixes and suggestions
- **User Experience**: Real-time accessibility feedback
- **Performance Monitoring**: Accessibility impact analysis

### For Organizations
- **Compliance**: Meet accessibility standards and regulations
- **Inclusion**: Make websites accessible to all users
- **Analytics**: Understand accessibility usage patterns
- **Training**: Educate teams on accessibility best practices

## 🛠️ Development

### Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher
- Chrome browser for testing

### Setup

```bash
# Clone the repository
git clone https://github.com/autoaccess/autoaccess.git
cd autoaccess

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
pnpm test:e2e

# Build for production
pnpm build

# Package extension
pnpm package
```

### Project Structure

```
autoaccess/
├── src/
│   ├── background/          # Service worker
│   ├── content/            # Content scripts
│   ├── lib/                # Core libraries
│   ├── ui/                 # User interface
│   │   ├── popup/          # Extension popup
│   │   ├── options/        # Settings page
│   │   ├── toolbar/        # Floating toolbar
│   │   └── devtools/       # DevTools panel
│   └── manifest.json       # Extension manifest
├── test/                   # Test files
├── docs/                   # Documentation
└── scripts/                # Build scripts
```

### Key Technologies

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Chrome MV3** - Latest extension API
- **axe-core** - Accessibility testing
- **Tesseract.js** - OCR processing
- **OpenAI API** - AI-powered features

## 📚 Documentation

- **[User Guide](USER_GUIDE.md)** - Complete user documentation
- **[Developer Docs](DEVELOPER_DOCS.md)** - Technical documentation
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Privacy Policy](PRIVACY.md)** - Privacy and data handling
- **[Changelog](CHANGELOG.md)** - Version history

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

### E2E Tests
```bash
pnpm test:e2e
```

### Accessibility Tests
```bash
pnpm test:a11y
```

### Coverage
```bash
pnpm test:coverage
```

## 🚀 Deployment

### CI/CD Pipeline

The project uses GitHub Actions for automated testing, building, and deployment:

- **CI**: Runs on every push and PR
- **Build**: Creates production builds
- **Test**: Unit and E2E testing
- **Deploy**: Automatic Chrome Web Store deployment

### Release Process

1. **Version Bump**: Update version in `package.json` and `manifest.json`
2. **Changelog**: Update `CHANGELOG.md` with new features
3. **Tag Release**: Create Git tag with version number
4. **Automated Build**: GitHub Actions builds and packages
5. **Chrome Web Store**: Automatic deployment to store
6. **GitHub Release**: Release notes and downloads

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Areas for Contribution

- **New Features**: Accessibility improvements, AI integrations
- **Bug Fixes**: Issues and edge cases
- **Documentation**: User guides, API docs
- **Testing**: Unit tests, E2E tests
- **Performance**: Optimization and monitoring
- **Accessibility**: WCAG compliance improvements

## 📊 Analytics & Privacy

### Privacy-First Design

- **Local Processing**: All features work locally by default
- **Optional Cloud**: Cloud features require explicit opt-in
- **No Tracking**: No personal data collection
- **GDPR Compliant**: Full privacy compliance
- **Open Source**: Transparent and auditable

### Analytics (Optional)

When enabled, we collect anonymous usage data to improve the extension:

- Feature usage patterns
- Performance metrics
- Error reports
- Accessibility insights

## 🏆 Recognition

- **Hackathon Winner**: Best Accessibility Solution 2024
- **Open Source**: MIT Licensed
- **Community Driven**: Active contributor community
- **Industry Standard**: WCAG 2.1 AA compliant

## 📞 Support

### Getting Help

- **GitHub Issues**: [Report bugs and request features](https://github.com/autoaccess/autoaccess/issues)
- **Discord**: [Join our community](https://discord.gg/autoaccess)
- **Email**: [support@autoaccess.dev](mailto:support@autoaccess.dev)
- **Documentation**: [Comprehensive guides](https://github.com/autoaccess/autoaccess/wiki)

### Community

- **Discord Server**: Real-time chat and support
- **GitHub Discussions**: Feature requests and general discussion
- **Reddit**: [r/autoaccess](https://reddit.com/r/autoaccess)
- **Twitter**: [@autoaccess](https://twitter.com/autoaccess)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **axe-core team** for the accessibility testing engine
- **OpenAI** for AI capabilities
- **Chrome team** for the extension platform
- **Accessibility community** for feedback and testing
- **Open source contributors** for their valuable contributions

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=autoaccess/autoaccess&type=Date)](https://star-history.com/#autoaccess/autoaccess&Date)

---

**Made with ❤️ for accessibility and inclusion**

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue.svg)](https://chrome.google.com/webstore/detail/autoaccess/extension-id)
[![GitHub](https://img.shields.io/badge/GitHub-View%20Source-black.svg)](https://github.com/autoaccess/autoaccess)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-7289da.svg)](https://discord.gg/autoaccess)
