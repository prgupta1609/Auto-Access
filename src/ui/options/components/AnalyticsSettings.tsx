import React from 'react';

interface AnalyticsSettingsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const AnalyticsSettings: React.FC<AnalyticsSettingsProps> = ({
  enabled,
  onEnabledChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Usage Data</h2>
        <p className="text-gray-600 mt-1">
          Help improve AutoAccess by sharing anonymous usage data
        </p>
      </div>

      {/* Analytics Toggle */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Anonymous Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">
              Share anonymous usage data to help improve AutoAccess features and performance
            </p>
          </div>
          <div
            className={`toggle ${enabled ? 'toggle-enabled' : 'toggle-disabled'}`}
            onClick={() => onEnabledChange(!enabled)}
          >
            <span
              className={`toggle-thumb ${
                enabled ? 'toggle-thumb-enabled' : 'toggle-thumb-disabled'
              }`}
            />
          </div>
        </div>
      </div>

      {/* What We Collect */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What We Collect</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Feature Usage</h4>
              <p className="text-sm text-gray-600">
                Which accessibility features are used most frequently
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Performance Metrics</h4>
              <p className="text-sm text-gray-600">
                How long features take to load and process
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Error Reports</h4>
              <p className="text-sm text-gray-600">
                Anonymous error information to help fix bugs
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Accessibility Audit Results</h4>
              <p className="text-sm text-gray-600">
                Aggregated data about common accessibility issues found
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What We Don't Collect */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What We Don't Collect</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Personal Information</h4>
              <p className="text-sm text-gray-600">
                No names, emails, or other personally identifiable information
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Page Content</h4>
              <p className="text-sm text-gray-600">
                No text content, images, or other page data is collected
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">URLs</h4>
              <p className="text-sm text-gray-600">
                No specific URLs or website addresses are collected
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">API Keys</h4>
              <p className="text-sm text-gray-600">
                Your API keys are never transmitted or stored on our servers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Usage */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How We Use Your Data</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-900">Improve Features</h4>
              <p className="text-sm text-gray-600">
                Identify which features are most useful and prioritize development
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-900">Optimize Performance</h4>
              <p className="text-sm text-gray-600">
                Find and fix performance bottlenecks and slow-loading features
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-900">Fix Bugs</h4>
              <p className="text-sm text-gray-600">
                Identify and resolve issues that affect user experience
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-900">Accessibility Insights</h4>
              <p className="text-sm text-gray-600">
                Understand common accessibility challenges to improve our tools
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Control */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Control</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-900">Opt-Out Anytime</h4>
              <p className="text-sm text-gray-600">
                You can disable analytics at any time using the toggle above
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-900">Data Refresh</h4>
              <p className="text-sm text-gray-600">
                Analytics data is automatically refreshed and old data is deleted
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-900">Local Processing</h4>
              <p className="text-sm text-gray-600">
                All accessibility features work locally without requiring analytics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className={`card ${enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <div>
            <h4 className="font-medium text-gray-900">
              Analytics {enabled ? 'Enabled' : 'Disabled'}
            </h4>
            <p className="text-sm text-gray-600">
              {enabled 
                ? 'Anonymous usage data is being collected to help improve AutoAccess'
                : 'No usage data is being collected. All features work locally.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSettings;
