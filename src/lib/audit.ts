import { AuditResult } from './types.js';

export class AccessibilityAuditor {
  private axeCore: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load axe-core dynamically
      const axeModule = await import('axe-core');
      this.axeCore = axeModule.default;
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to load axe-core:', error);
      throw error;
    }
  }

  async runAudit(options: {
    include?: string[];
    exclude?: string[];
    tags?: string[];
    rules?: Record<string, any>;
  } = {}): Promise<AuditResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.axeCore) {
      throw new Error('axe-core not initialized');
    }

    const auditOptions = {
      include: options.include || [document],
      exclude: options.exclude || [],
      tags: options.tags || ['wcag2a', 'wcag2aa', 'wcag21aa'],
      rules: options.rules || {}
    };

    try {
      const results = await this.axeCore.run(auditOptions);
      
      return {
        violations: results.violations.map((violation: any) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.map((node: any) => ({
            html: node.html,
            target: node.target,
            failureSummary: node.failureSummary
          }))
        })),
        passes: results.passes.map((pass: any) => ({
          id: pass.id,
          description: pass.description,
          nodes: pass.nodes.map((node: any) => ({
            html: node.html,
            target: node.target
          }))
        })),
        incomplete: results.incomplete.map((incomplete: any) => ({
          id: incomplete.id,
          description: incomplete.description,
          nodes: incomplete.nodes.map((node: any) => ({
            html: node.html,
            target: node.target
          }))
        })),
        timestamp: new Date(),
        url: window.location.href
      };
    } catch (error) {
      console.error('Audit failed:', error);
      throw error;
    }
  }

  async runQuickAudit(): Promise<AuditResult> {
    return this.runAudit({
      tags: ['wcag2a'],
      rules: {
        'color-contrast': { enabled: true },
        'image-alt': { enabled: true },
        'button-name': { enabled: true },
        'link-name': { enabled: true },
        'form-field-multiple-labels': { enabled: true }
      }
    });
  }

  async runComprehensiveAudit(): Promise<AuditResult> {
    return this.runAudit({
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
      rules: {}
    });
  }

  async auditSpecificElements(selectors: string[]): Promise<AuditResult> {
    const elements = selectors.map(selector => document.querySelector(selector)).filter(Boolean);
    
    if (elements.length === 0) {
      return {
        violations: [],
        passes: [],
        incomplete: [],
        timestamp: new Date(),
        url: window.location.href
      };
    }

    return this.runAudit({
      include: elements
    });
  }

  generateReport(auditResult: AuditResult): {
    summary: {
      totalViolations: number;
      criticalViolations: number;
      seriousViolations: number;
      moderateViolations: number;
      minorViolations: number;
      totalPasses: number;
      totalIncomplete: number;
    };
    violations: Array<{
      id: string;
      impact: string;
      description: string;
      help: string;
      helpUrl: string;
      count: number;
      elements: string[];
    }>;
    recommendations: string[];
  } {
    const summary = {
      totalViolations: auditResult.violations.length,
      criticalViolations: auditResult.violations.filter(v => v.impact === 'critical').length,
      seriousViolations: auditResult.violations.filter(v => v.impact === 'serious').length,
      moderateViolations: auditResult.violations.filter(v => v.impact === 'moderate').length,
      minorViolations: auditResult.violations.filter(v => v.impact === 'minor').length,
      totalPasses: auditResult.passes.length,
      totalIncomplete: auditResult.incomplete.length
    };

    const violations = auditResult.violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      count: violation.nodes.length,
      elements: violation.nodes.map(node => node.target.join(' '))
    }));

    const recommendations = this.generateRecommendations(auditResult);

    return {
      summary,
      violations,
      recommendations
    };
  }

  private generateRecommendations(auditResult: AuditResult): string[] {
    const recommendations: string[] = [];

    // Analyze violations and generate specific recommendations
    const violationTypes = new Map<string, number>();
    auditResult.violations.forEach(violation => {
      violationTypes.set(violation.id, (violationTypes.get(violation.id) || 0) + 1);
    });

    // Generate recommendations based on most common violations
    if (violationTypes.has('color-contrast')) {
      recommendations.push('Improve color contrast ratios to meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)');
    }

    if (violationTypes.has('image-alt')) {
      recommendations.push('Add descriptive alt text to all images, or mark decorative images with empty alt attributes');
    }

    if (violationTypes.has('button-name')) {
      recommendations.push('Ensure all buttons have accessible names through text content, aria-label, or aria-labelledby');
    }

    if (violationTypes.has('link-name')) {
      recommendations.push('Provide descriptive link text that clearly indicates the link destination or purpose');
    }

    if (violationTypes.has('form-field-multiple-labels')) {
      recommendations.push('Ensure form fields have only one label to avoid confusion for screen readers');
    }

    if (violationTypes.has('heading-order')) {
      recommendations.push('Use proper heading hierarchy (h1, h2, h3, etc.) without skipping levels');
    }

    if (violationTypes.has('landmark-one-main')) {
      recommendations.push('Ensure the page has exactly one main landmark');
    }

    if (violationTypes.has('page-has-heading-one')) {
      recommendations.push('Add an h1 heading to provide a clear page title');
    }

    // General recommendations
    if (auditResult.violations.length > 10) {
      recommendations.push('Consider conducting a comprehensive accessibility review with a qualified accessibility expert');
    }

    if (auditResult.incomplete.length > 5) {
      recommendations.push('Some accessibility checks could not be completed automatically. Manual testing is recommended');
    }

    return recommendations;
  }

  async generateGitHubPR(accessibilityIssues: AuditResult): Promise<string> {
    const report = this.generateReport(accessibilityIssues);
    
    const prTitle = `Fix accessibility issues: ${report.summary.totalViolations} violations found`;
    
    const prBody = `
## Accessibility Audit Results

### Summary
- **Total Violations**: ${report.summary.totalViolations}
- **Critical**: ${report.summary.criticalViolations}
- **Serious**: ${report.summary.seriousViolations}
- **Moderate**: ${report.summary.moderateViolations}
- **Minor**: ${report.summary.minorViolations}

### Top Issues to Fix

${report.violations.slice(0, 10).map(violation => `
#### ${violation.description}
- **Impact**: ${violation.impact}
- **Count**: ${violation.count} elements
- **Help**: ${violation.help}
- **Learn more**: ${violation.helpUrl}

**Affected elements:**
${violation.elements.slice(0, 5).map(element => `- \`${element}\``).join('\n')}
${violation.elements.length > 5 ? `- ... and ${violation.elements.length - 5} more` : ''}
`).join('\n')}

### Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

### Next Steps
1. Review each violation and implement the suggested fixes
2. Test with screen readers and keyboard navigation
3. Re-run the accessibility audit to verify improvements
4. Consider manual testing for complex interactions

---
*This PR was generated automatically by AutoAccess accessibility auditor*
`;

    return JSON.stringify({
      title: prTitle,
      body: prBody,
      head: 'accessibility-fixes',
      base: 'main'
    });
  }

  async exportReport(auditResult: AuditResult, format: 'json' | 'pdf' = 'json'): Promise<Blob> {
    const report = this.generateReport(auditResult);
    
    if (format === 'json') {
      const data = {
        ...auditResult,
        report,
        generatedAt: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } else if (format === 'pdf') {
      // For PDF generation, we would need a PDF library like jsPDF
      // For now, return a simple text representation
      const textReport = `
Accessibility Audit Report
========================

URL: ${auditResult.url}
Date: ${auditResult.timestamp.toISOString()}

Summary:
- Total Violations: ${report.summary.totalViolations}
- Critical: ${report.summary.criticalViolations}
- Serious: ${report.summary.seriousViolations}
- Moderate: ${report.summary.moderateViolations}
- Minor: ${report.summary.minorViolations}

Violations:
${report.violations.map(v => `
${v.description} (${v.impact})
- Count: ${v.count}
- Help: ${v.help}
- Elements: ${v.elements.join(', ')}
`).join('\n')}

Recommendations:
${report.recommendations.map(r => `- ${r}`).join('\n')}
`;
      
      return new Blob([textReport], { type: 'text/plain' });
    }
    
    throw new Error(`Unsupported format: ${format}`);
  }

  async applySafeFixes(auditResult: AuditResult): Promise<{
    applied: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      applied: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Only apply safe, automated fixes
    const safeFixes = [
      'image-alt',
      'button-name',
      'link-name',
      'form-field-multiple-labels'
    ];

    for (const violation of auditResult.violations) {
      if (safeFixes.includes(violation.id)) {
        try {
          await this.applyFix(violation);
          results.applied++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to fix ${violation.id}: ${error}`);
        }
      }
    }

    return results;
  }

  private async applyFix(violation: AuditResult['violations'][0]): Promise<void> {
    switch (violation.id) {
      case 'image-alt':
        await this.fixImageAlt(violation);
        break;
      case 'button-name':
        await this.fixButtonName(violation);
        break;
      case 'link-name':
        await this.fixLinkName(violation);
        break;
      case 'form-field-multiple-labels':
        await this.fixFormFieldLabels(violation);
        break;
      default:
        throw new Error(`No automated fix available for ${violation.id}`);
    }
  }

  private async fixImageAlt(violation: AuditResult['violations'][0]): Promise<void> {
    for (const node of violation.nodes) {
      const element = document.querySelector(node.target.join(' ')) as HTMLImageElement;
      if (element && !element.alt) {
        element.alt = 'Image'; // Basic fallback
      }
    }
  }

  private async fixButtonName(violation: AuditResult['violations'][0]): Promise<void> {
    for (const node of violation.nodes) {
      const element = document.querySelector(node.target.join(' ')) as HTMLButtonElement;
      if (element && !element.textContent?.trim() && !element.getAttribute('aria-label')) {
        element.setAttribute('aria-label', 'Button');
      }
    }
  }

  private async fixLinkName(violation: AuditResult['violations'][0]): Promise<void> {
    for (const node of violation.nodes) {
      const element = document.querySelector(node.target.join(' ')) as HTMLAnchorElement;
      if (element && !element.textContent?.trim() && !element.getAttribute('aria-label')) {
        element.setAttribute('aria-label', 'Link');
      }
    }
  }

  private async fixFormFieldLabels(violation: AuditResult['violations'][0]): Promise<void> {
    for (const node of violation.nodes) {
      const element = document.querySelector(node.target.join(' ')) as HTMLElement;
      if (element) {
        // Remove duplicate labels - this is a simplified approach
        const labels = element.querySelectorAll('label');
        if (labels.length > 1) {
          for (let i = 1; i < labels.length; i++) {
            labels[i].remove();
          }
        }
      }
    }
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}
