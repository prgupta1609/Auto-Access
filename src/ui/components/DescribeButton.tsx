import React, { useState, useEffect } from 'react';

interface DescribeButtonProps {
  imageInfo: {
    id: string;
    position: {
      top: number;
      left: number;
      right: number;
      bottom: number;
    };
    isVisible: boolean;
  };
  onClick: () => void;
  isProcessing?: boolean;
  hasResult?: boolean;
}

const DescribeButton: React.FC<DescribeButtonProps> = ({
  imageInfo,
  onClick,
  isProcessing = false,
  hasResult = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState(imageInfo.position);

  useEffect(() => {
    // Update position when image moves (e.g., due to scrolling or layout changes)
    const updatePosition = () => {
      const element = document.getElementById(imageInfo.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        setPosition({
          top: rect.top + scrollY,
          left: rect.left + scrollX,
          right: rect.right + scrollX,
          bottom: rect.bottom + scrollY
        });
      }
    };

    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    // Initial position update
    updatePosition();
    
    // Show button after a short delay for smooth animation
    const timer = setTimeout(() => setIsVisible(true), 100);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timer);
    };
  }, [imageInfo.id]);

  if (!imageInfo.isVisible) {
    return null;
  }

  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 10000,
    transform: isVisible ? 'scale(1)' : 'scale(0)',
    opacity: isVisible ? 1 : 0,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'auto'
  };

  const getButtonContent = () => {
    if (isProcessing) {
      return (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>Analyzing...</span>
        </div>
      );
    }
    
    if (hasResult) {
      return (
        <div className="flex items-center space-x-2">
          <span>✓</span>
          <span>Described</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-2">
        <span>🔍</span>
        <span>Describe</span>
      </div>
    );
  };

  const getButtonClasses = () => {
    const baseClasses = "px-3 py-2 rounded-lg text-sm font-medium shadow-lg border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    if (isProcessing) {
      return `${baseClasses} bg-blue-500 text-white border-blue-600 focus:ring-blue-500`;
    }
    
    if (hasResult) {
      return `${baseClasses} bg-green-500 text-white border-green-600 focus:ring-green-500`;
    }
    
    return `${baseClasses} bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 focus:ring-purple-500 hover:from-purple-600 hover:to-pink-600`;
  };

  return (
    <div style={buttonStyle}>
      <button
        className={getButtonClasses()}
        onClick={onClick}
        disabled={isProcessing}
        aria-label="Describe this image with AI"
        title="Click to generate AI-powered description and OCR text for this image"
      >
        {getButtonContent()}
      </button>
      
      {/* Animated pulse effect */}
      {!isProcessing && !hasResult && (
        <div 
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 animate-ping"
          style={{ zIndex: -1 }}
        />
      )}
    </div>
  );
};

export default DescribeButton;
