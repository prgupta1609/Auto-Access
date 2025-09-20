# Contributing to AutoAccess

Thank you for your interest in contributing to AutoAccess! This document provides guidelines and information for contributors.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Contributing Guidelines](#contributing-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Issue Reporting](#issue-reporting)
7. [Feature Requests](#feature-requests)
8. [Documentation](#documentation)
9. [Testing](#testing)
10. [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@autoaccess.dev.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher
- Chrome browser for testing
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/autoaccess.git
   cd autoaccess
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/autoaccess/autoaccess.git
   ```

## Development Setup

### Installation

```bash
# Install dependencies
pnpm install

# Install Playwright browsers for E2E testing
pnpm exec playwright install
```

### Development Commands

```bash
# Start development server
pnpm dev

# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm type-check

# Build for production
pnpm build

# Package extension
pnpm package
```

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Run tests** to ensure everything works:
   ```bash
   pnpm test
   pnpm test:e2e
   ```

4. **Commit your changes** using conventional commits:
   ```bash
   git commit -m "feat: add new accessibility feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## Contributing Guidelines

### Coding Standards

- **TypeScript**: Use strict mode and proper typing
- **ESLint**: Follow the configured rules
- **Prettier**: Use consistent formatting
- **Conventional Commits**: Use standardized commit messages
- **Test Coverage**: Maintain 90%+ coverage for new code

### Code Style

```typescript
// Good: Clear, typed, and documented
interface AccessibilityFeature {
  name: string;
  enabled: boolean;
  options?: FeatureOptions;
}

class FeatureManager {
  private features: Map<string, AccessibilityFeature> = new Map();

  /**
   * Enables a specific accessibility feature
   * @param featureName - The name of the feature to enable
   * @param options - Optional configuration for the feature
   */
  async enableFeature(featureName: string, options?: FeatureOptions): Promise<void> {
    // Implementation
  }
}
```

### File Organization

- Use descriptive file and folder names
- Group related functionality together
- Keep files focused and not too large
- Use index files for clean imports

### Documentation

- Document all public APIs
- Include JSDoc comments for functions and classes
- Update README and documentation for new features
- Add examples for complex functionality

## Pull Request Process

### Before Submitting

1. **Ensure tests pass**: Run `pnpm test` and `pnpm test:e2e`
2. **Check linting**: Run `pnpm lint` and fix any issues
3. **Update documentation**: Add or update relevant documentation
4. **Test manually**: Test your changes in Chrome
5. **Check accessibility**: Ensure your changes are accessible

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Accessibility improvement

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Accessibility testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one maintainer approval required
3. **Accessibility Review**: WCAG compliance verification
4. **Security Review**: Security implications assessment
5. **Performance Review**: Performance impact evaluation

## Issue Reporting

### Bug Reports

Use the bug report template and include:

- **Clear title**: Brief description of the issue
- **Steps to reproduce**: Detailed steps to reproduce the bug
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: Browser version, OS, extension version
- **Screenshots**: If applicable
- **Console logs**: Any error messages

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 10, macOS 12, Ubuntu 20.04]
 - Browser: [e.g. Chrome 120, Edge 120]
 - Extension Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

## Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Feature Request Guidelines

- **Check existing issues**: Make sure the feature hasn't been requested
- **Provide use cases**: Explain why this feature would be useful
- **Consider accessibility**: Ensure the feature is accessible
- **Think about implementation**: Consider the technical feasibility

## Documentation

### Types of Documentation

1. **Code Documentation**: JSDoc comments and inline documentation
2. **API Documentation**: Function and class documentation
3. **User Documentation**: User guides and tutorials
4. **Developer Documentation**: Technical documentation for contributors

### Documentation Standards

- Use clear, concise language
- Include examples where helpful
- Keep documentation up to date
- Use proper markdown formatting
- Include screenshots for UI changes

## Testing

### Unit Testing

- Write tests for all new functionality
- Maintain 90%+ test coverage
- Use descriptive test names
- Test edge cases and error conditions

```typescript
// Example unit test
describe('AccessibilityFeature', () => {
  it('should enable feature with correct options', async () => {
    const feature = new AccessibilityFeature();
    await feature.enable({ option1: true });
    
    expect(feature.isEnabled()).toBe(true);
    expect(feature.getOptions()).toEqual({ option1: true });
  });
});
```

### E2E Testing

- Test critical user flows
- Test across different websites
- Test accessibility features
- Test error scenarios

```typescript
// Example E2E test
test('should run accessibility audit', async ({ page }) => {
  await page.goto('https://example.com');
  
  const result = await page.evaluate(() => {
    return window.autoaccess?.runAudit();
  });
  
  expect(result.violations).toBeDefined();
});
```

### Accessibility Testing

- Test with screen readers
- Test keyboard navigation
- Test high contrast mode
- Test with different zoom levels

## Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. **Update version numbers** in package.json and manifest.json
2. **Update CHANGELOG.md** with new features and fixes
3. **Run full test suite** to ensure everything works
4. **Create release branch** from main
5. **Tag the release** with version number
6. **Deploy to Chrome Web Store** using automated workflow
7. **Announce release** to community

### Release Types

- **Major Release**: Significant new features or breaking changes
- **Minor Release**: New features and improvements
- **Patch Release**: Bug fixes and small improvements
- **Hotfix Release**: Critical bug fixes

## Community

### Getting Help

- **GitHub Discussions**: For questions and general discussion
- **Discord**: For real-time chat and support
- **Email**: For private or sensitive issues
- **Documentation**: Check existing docs first

### Recognition

Contributors are recognized in:
- CONTRIBUTORS.md file
- Release notes
- GitHub contributor graph
- Community highlights

### Mentorship

We offer mentorship for:
- New contributors
- Complex features
- Accessibility expertise
- Technical guidance

## License

By contributing to AutoAccess, you agree that your contributions will be licensed under the MIT License.

## Contact

- **Email**: contributors@autoaccess.dev
- **Discord**: [AutoAccess Community](https://discord.gg/autoaccess)
- **GitHub**: [AutoAccess Repository](https://github.com/autoaccess/autoaccess)

Thank you for contributing to AutoAccess! Together, we're making the web more accessible for everyone.
