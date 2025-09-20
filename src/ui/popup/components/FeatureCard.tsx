import React from 'react';

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  onToggle: (featureId: string) => void;
  hasCloudFeature: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  id,
  title,
  description,
  icon,
  isActive,
  onToggle,
  hasCloudFeature
}) => {
  return (
    <div
      className={`feature-card ${isActive ? 'active' : ''}`}
      onClick={() => onToggle(id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{icon}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{title}</h3>
              {hasCloudFeature && (
                <span className="status-indicator status-active text-xs">
                  Cloud
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div
            className={`toggle ${isActive ? 'toggle-enabled' : 'toggle-disabled'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(id);
            }}
          >
            <span
              className={`toggle-thumb ${
                isActive ? 'toggle-thumb-enabled' : 'toggle-thumb-disabled'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
