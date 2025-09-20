import React, { useState, useEffect } from 'react';

interface ElementInspectorProps {
  selectedElement: HTMLElement | null;
  onElementSelect: (element: HTMLElement | null) => void;
}

interface ElementInfo {
  tagName: string;
  id: string;
  className: string;
  textContent: string;
  attributes: Record<string, string>;
  computedStyles: Record<string, string>;
  accessibility: {
    role: string;
    ariaLabel: string;
    ariaDescribedBy: string;
    tabIndex: string;
    hasFocus: boolean;
    isVisible: boolean;
    isInteractive: boolean;
  };
  boundingRect: DOMRect | null;
}

const ElementInspector: React.FC<ElementInspectorProps> = ({
  selectedElement,
  onElementSelect
}) => {
  const [elementInfo, setElementInfo] = useState<ElementInfo | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);

  useEffect(() => {
    if (selectedElement) {
      analyzeElement(selectedElement);
    }
  }, [selectedElement]);

  const analyzeElement = (element: HTMLElement): void => {
    const computedStyle = window.getComputedStyle(element);
    
    const info: ElementInfo = {
      tagName: element.tagName.toLowerCase(),
      id: element.id || '',
      className: element.className || '',
      textContent: element.textContent?.substring(0, 100) || '',
      attributes: {},
      computedStyles: {},
      accessibility: {
        role: element.getAttribute('role') || computedStyle.getPropertyValue('--role') || 'none',
        ariaLabel: element.getAttribute('aria-label') || '',
        ariaDescribedBy: element.getAttribute('aria-describedby') || '',
        tabIndex: element.getAttribute('tabindex') || '',
        hasFocus: document.activeElement === element,
        isVisible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden',
        isInteractive: isInteractiveElement(element)
      },
      boundingRect: element.getBoundingClientRect()
    };

    // Get all attributes
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      info.attributes[attr.name] = attr.value;
    }

    // Get relevant computed styles
    const relevantStyles = [
      'display', 'visibility', 'opacity', 'position', 'top', 'right', 'bottom', 'left',
      'width', 'height', 'margin', 'padding', 'border', 'background-color', 'color',
      'font-size', 'font-family', 'font-weight', 'line-height', 'text-align'
    ];

    relevantStyles.forEach(style => {
      info.computedStyles[style] = computedStyle.getPropertyValue(style);
    });

    setElementInfo(info);
  };

  const isInteractiveElement = (element: HTMLElement): boolean => {
    const interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'details', 'summary'];
    const interactiveRoles = ['button', 'link', 'menuitem', 'tab', 'option', 'checkbox', 'radio'];
    
    return (
      interactiveTags.includes(element.tagName.toLowerCase()) ||
      interactiveRoles.includes(element.getAttribute('role') || '') ||
      element.hasAttribute('onclick') ||
      element.hasAttribute('tabindex')
    );
  };

  const startInspection = async () => {
    setIsInspecting(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'START_ELEMENT_INSPECTION'
        });
      }
    } catch (error) {
      console.error('Failed to start inspection:', error);
    }
  };

  const stopInspection = async () => {
    setIsInspecting(false);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'STOP_ELEMENT_INSPECTION'
        });
      }
    } catch (error) {
      console.error('Failed to stop inspection:', error);
    }
  };

  const highlightElement = async (element: HTMLElement) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'HIGHLIGHT_ELEMENT',
          payload: { element: element.outerHTML }
        });
      }
    } catch (error) {
      console.error('Failed to highlight element:', error);
    }
  };

  if (!elementInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🔎</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Element Inspector</h3>
          <p className="text-gray-600 mb-4">
            Click "Start Inspection" to select an element on the page
          </p>
          <button
            className={`btn ${isInspecting ? 'btn-danger' : 'btn-primary'}`}
            onClick={isInspecting ? stopInspection : startInspection}
          >
            {isInspecting ? 'Stop Inspection' : 'Start Inspection'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Element Inspector</h2>
          <div className="flex space-x-2">
            <button
              className={`btn btn-sm ${isInspecting ? 'btn-danger' : 'btn-primary'}`}
              onClick={isInspecting ? stopInspection : startInspection}
            >
              {isInspecting ? 'Stop' : 'Inspect'}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onElementSelect(null)}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Element Summary */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {elementInfo.tagName}
            </span>
            {elementInfo.id && (
              <span className="font-mono text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                #{elementInfo.id}
              </span>
            )}
            {elementInfo.className && (
              <span className="font-mono text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                .{elementInfo.className.split(' ')[0]}
              </span>
            )}
          </div>
          {elementInfo.textContent && (
            <p className="text-sm text-gray-600 truncate">
              "{elementInfo.textContent}..."
            </p>
          )}
        </div>
      </div>

      {/* Element Details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Accessibility */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Accessibility</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <p className="text-sm text-gray-900">{elementInfo.accessibility.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tab Index</label>
              <p className="text-sm text-gray-900">{elementInfo.accessibility.tabIndex || 'auto'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ARIA Label</label>
              <p className="text-sm text-gray-900">{elementInfo.accessibility.ariaLabel || 'none'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ARIA Described By</label>
              <p className="text-sm text-gray-900">{elementInfo.accessibility.ariaDescribedBy || 'none'}</p>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`status-indicator ${elementInfo.accessibility.isVisible ? 'status-pass' : 'status-critical'}`}>
              {elementInfo.accessibility.isVisible ? 'Visible' : 'Hidden'}
            </span>
            <span className={`status-indicator ${elementInfo.accessibility.isInteractive ? 'status-pass' : 'status-minor'}`}>
              {elementInfo.accessibility.isInteractive ? 'Interactive' : 'Static'}
            </span>
            <span className={`status-indicator ${elementInfo.accessibility.hasFocus ? 'status-pass' : 'status-minor'}`}>
              {elementInfo.accessibility.hasFocus ? 'Focused' : 'Not Focused'}
            </span>
          </div>
        </div>

        {/* Dimensions */}
        {elementInfo.boundingRect && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Dimensions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Width</label>
                <p className="text-sm text-gray-900">{Math.round(elementInfo.boundingRect.width)}px</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Height</label>
                <p className="text-sm text-gray-900">{Math.round(elementInfo.boundingRect.height)}px</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">X Position</label>
                <p className="text-sm text-gray-900">{Math.round(elementInfo.boundingRect.x)}px</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Y Position</label>
                <p className="text-sm text-gray-900">{Math.round(elementInfo.boundingRect.y)}px</p>
              </div>
            </div>
          </div>
        )}

        {/* Attributes */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Attributes</h3>
          <div className="space-y-2">
            {Object.entries(elementInfo.attributes).map(([name, value]) => (
              <div key={name} className="flex justify-between items-center py-1">
                <span className="font-mono text-sm text-blue-600">{name}</span>
                <span className="text-sm text-gray-900 truncate ml-4">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Computed Styles */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Computed Styles</h3>
          <div className="space-y-2">
            {Object.entries(elementInfo.computedStyles).map(([property, value]) => (
              <div key={property} className="flex justify-between items-center py-1">
                <span className="font-mono text-sm text-blue-600">{property}</span>
                <span className="text-sm text-gray-900 truncate ml-4">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementInspector;
