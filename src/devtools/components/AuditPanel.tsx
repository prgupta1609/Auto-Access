import React, { useState } from 'react';
import { AuditResult } from '../../lib/types';

interface AuditPanelProps {
  auditResult: AuditResult | null;
  onElementSelect: (element: HTMLElement | null) => void;
}

const AuditPanel: React.FC<AuditPanelProps> = ({
  auditResult,
  onElementSelect
}) => {
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'serious' | 'moderate' | 'minor'>('all');

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'violation-critical';
      case 'serious': return 'violation-serious';
      case 'moderate': return 'violation-moderate';
      case 'minor': return 'violation-minor';
      default: return 'violation-minor';
    }
  };

  const getImpactStatus = (impact: string) => {
    switch (impact) {
      case 'critical': return 'status-critical';
      case 'serious': return 'status-serious';
      case 'moderate': return 'status-moderate';
      case 'minor': return 'status-minor';
      default: return 'status-minor';
    }
  };

  const filteredViolations = auditResult?.violations.filter(violation => 
    filter === 'all' || violation.impact === filter
  ) || [];

  const handleElementClick = async (target: string[]) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'HIGHLIGHT_ELEMENT',
          payload: { target }
        });
      }
    } catch (error) {
      console.error('Failed to highlight element:', error);
    }
  };

  const exportReport = () => {
    if (!auditResult) return;

    const report = {
      ...auditResult,
      summary: {
        totalViolations: auditResult.violations.length,
        criticalViolations: auditResult.violations.filter(v => v.impact === 'critical').length,
        seriousViolations: auditResult.violations.filter(v => v.impact === 'serious').length,
        moderateViolations: auditResult.violations.filter(v => v.impact === 'moderate').length,
        minorViolations: auditResult.violations.filter(v => v.impact === 'minor').length,
        totalPasses: auditResult.passes.length,
        totalIncomplete: auditResult.incomplete.length
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!auditResult) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audit results</h3>
          <p className="text-gray-600">
            Click "Run Audit" to analyze the current page for accessibility issues
          </p>
        </div>
      </div>
    );
  }

  const summary = {
    totalViolations: auditResult.violations.length,
    criticalViolations: auditResult.violations.filter(v => v.impact === 'critical').length,
    seriousViolations: auditResult.violations.filter(v => v.impact === 'serious').length,
    moderateViolations: auditResult.violations.filter(v => v.impact === 'moderate').length,
    minorViolations: auditResult.violations.filter(v => v.impact === 'minor').length,
    totalPasses: auditResult.passes.length,
    totalIncomplete: auditResult.incomplete.length
  };

  return (
    <div className="h-full flex flex-col">
      {/* Summary */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Audit Results</h2>
          <button
            className="btn btn-secondary btn-sm"
            onClick={exportReport}
          >
            Export Report
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.criticalViolations}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{summary.seriousViolations}</div>
            <div className="text-sm text-gray-600">Serious</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.moderateViolations}</div>
            <div className="text-sm text-gray-600">Moderate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.minorViolations}</div>
            <div className="text-sm text-gray-600">Minor</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex space-x-2">
          {(['all', 'critical', 'serious', 'moderate', 'minor'] as const).map((filterType) => (
            <button
              key={filterType}
              className={`btn btn-sm ${
                filter === filterType ? 'btn-primary' : 'btn-secondary'
              }`}
              onClick={() => setFilter(filterType)}
            >
              {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              {filterType !== 'all' && (
                <span className="ml-1">
                  ({auditResult.violations.filter(v => v.impact === filterType).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Violations List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredViolations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-600">No {filter === 'all' ? '' : filter} violations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredViolations.map((violation, index) => (
              <div
                key={index}
                className={`violation-card ${getImpactColor(violation.impact)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{violation.description}</h3>
                      <span className={`status-indicator ${getImpactStatus(violation.impact)}`}>
                        {violation.impact}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{violation.help}</p>
                    <a
                      href={violation.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Learn more →
                    </a>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedViolation(
                      selectedViolation === violation ? null : violation
                    )}
                  >
                    {selectedViolation === violation ? 'Hide' : 'Details'}
                  </button>
                </div>

                {selectedViolation === violation && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Affected Elements ({violation.nodes.length})</h4>
                      <div className="space-y-2">
                        {violation.nodes.map((node, nodeIndex) => (
                          <div key={nodeIndex} className="bg-white rounded border p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 mb-1">
                                  Element {nodeIndex + 1}
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                  Target: {node.target.join(' ')}
                                </div>
                              </div>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleElementClick(node.target)}
                              >
                                Highlight
                              </button>
                            </div>
                            
                            <div className="code-block mb-2">
                              {node.html}
                            </div>
                            
                            {node.failureSummary && (
                              <div className="text-sm text-gray-700">
                                <strong>Issue:</strong> {node.failureSummary}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditPanel;
