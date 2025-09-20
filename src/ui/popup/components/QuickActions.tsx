import React from 'react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'audit',
      label: 'Run Audit',
      icon: '🔍',
      description: 'Check accessibility issues'
    },
    {
      id: 'read-page',
      label: 'Read Page',
      icon: '📖',
      description: 'Read page title aloud'
    },
    {
      id: 'contrast-fix',
      label: 'Fix Contrast',
      icon: '🎨',
      description: 'Improve color contrast'
    }
  ];

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            className="flex flex-col items-center p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            onClick={() => onAction(action.id)}
            title={action.description}
          >
            <span className="text-lg mb-1">{action.icon}</span>
            <span className="text-xs text-gray-700 text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
