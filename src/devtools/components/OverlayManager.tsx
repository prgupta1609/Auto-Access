import React, { useState, useEffect } from 'react';

interface Overlay {
  id: string;
  name: string;
  type: 'focus' | 'landmarks' | 'headings' | 'images' | 'forms' | 'links' | 'custom';
  enabled: boolean;
  color: string;
  opacity: number;
}

const OverlayManager: React.FC = () => {
  const [overlays, setOverlays] = useState<Overlay[]>([
    { id: 'focus', name: 'Focus Indicators', type: 'focus', enabled: false, color: '#3b82f6', opacity: 0.8 },
    { id: 'landmarks', name: 'Landmarks', type: 'landmarks', enabled: false, color: '#10b981', opacity: 0.6 },
    { id: 'headings', name: 'Headings', type: 'headings', enabled: false, color: '#f59e0b', opacity: 0.7 },
    { id: 'images', name: 'Images', type: 'images', enabled: false, color: '#ef4444', opacity: 0.6 },
    { id: 'forms', name: 'Form Elements', type: 'forms', enabled: false, color: '#8b5cf6', opacity: 0.6 },
    { id: 'links', name: 'Links', type: 'links', enabled: false, color: '#06b6d4', opacity: 0.6 }
  ]);

  const toggleOverlay = async (overlayId: string) => {
    const updatedOverlays = overlays.map(overlay => 
      overlay.id === overlayId 
        ? { ...overlay, enabled: !overlay.enabled }
        : overlay
    );
    
    setOverlays(updatedOverlays);

    const overlay = updatedOverlays.find(o => o.id === overlayId);
    if (overlay) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_OVERLAY',
            payload: { overlay }
          });
        }
      } catch (error) {
        console.error('Failed to toggle overlay:', error);
      }
    }
  };

  const updateOverlayColor = async (overlayId: string, color: string) => {
    const updatedOverlays = overlays.map(overlay => 
      overlay.id === overlayId 
        ? { ...overlay, color }
        : overlay
    );
    
    setOverlays(updatedOverlays);

    const overlay = updatedOverlays.find(o => o.id === overlayId);
    if (overlay && overlay.enabled) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'UPDATE_OVERLAY',
            payload: { overlay }
          });
        }
      } catch (error) {
        console.error('Failed to update overlay:', error);
      }
    }
  };

  const updateOverlayOpacity = async (overlayId: string, opacity: number) => {
    const updatedOverlays = overlays.map(overlay => 
      overlay.id === overlayId 
        ? { ...overlay, opacity }
        : overlay
    );
    
    setOverlays(updatedOverlays);

    const overlay = updatedOverlays.find(o => o.id === overlayId);
    if (overlay && overlay.enabled) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'UPDATE_OVERLAY',
            payload: { overlay }
          });
        }
      } catch (error) {
        console.error('Failed to update overlay:', error);
      }
    }
  };

  const clearAllOverlays = async () => {
    const updatedOverlays = overlays.map(overlay => ({ ...overlay, enabled: false }));
    setOverlays(updatedOverlays);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'CLEAR_ALL_OVERLAYS'
        });
      }
    } catch (error) {
      console.error('Failed to clear overlays:', error);
    }
  };

  const getOverlayIcon = (type: string): string => {
    switch (type) {
      case 'focus': return '🎯';
      case 'landmarks': return '🏛️';
      case 'headings': return '📝';
      case 'images': return '🖼️';
      case 'forms': return '📋';
      case 'links': return '🔗';
      default: return '🎨';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Overlay Manager</h2>
          <button
            className="btn btn-secondary btn-sm"
            onClick={clearAllOverlays}
          >
            Clear All
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Visual overlays to help identify accessibility elements on the page
        </p>
      </div>

      {/* Overlays List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {overlays.map((overlay) => (
            <div key={overlay.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getOverlayIcon(overlay.type)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{overlay.name}</h3>
                    <p className="text-sm text-gray-600">
                      {overlay.type === 'focus' && 'Highlight focus indicators and tab order'}
                      {overlay.type === 'landmarks' && 'Show ARIA landmarks and regions'}
                      {overlay.type === 'headings' && 'Display heading hierarchy (h1-h6)'}
                      {overlay.type === 'images' && 'Identify images and their alt text status'}
                      {overlay.type === 'forms' && 'Highlight form elements and labels'}
                      {overlay.type === 'links' && 'Show links and their destinations'}
                    </p>
                  </div>
                </div>
                <div
                  className={`toggle ${overlay.enabled ? 'toggle-enabled' : 'toggle-disabled'}`}
                  onClick={() => toggleOverlay(overlay.id)}
                >
                  <span
                    className={`toggle-thumb ${
                      overlay.enabled ? 'toggle-thumb-enabled' : 'toggle-thumb-disabled'
                    }`}
                  />
                </div>
              </div>

              {overlay.enabled && (
                <div className="border-t border-gray-200 pt-3 space-y-3">
                  {/* Color Picker */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={overlay.color}
                        onChange={(e) => updateOverlayColor(overlay.id, e.target.value)}
                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 font-mono">
                        {overlay.color}
                      </span>
                    </div>
                  </div>

                  {/* Opacity Slider */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Opacity: {Math.round(overlay.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={overlay.opacity}
                      onChange={(e) => updateOverlayOpacity(overlay.id, parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-2">Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Focus indicators</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Landmarks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Headings</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Images</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Forms</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
            <span>Links</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayManager;
