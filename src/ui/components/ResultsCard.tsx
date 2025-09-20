import React, { useState, useEffect } from 'react';
import { ImageAnalysis } from '../../lib/imageScanner';

interface ResultsCardProps {
  analysis: ImageAnalysis;
  onAccept: (altText: string) => void;
  onEdit: (newText: string) => void;
  onClose: () => void;
  position: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
}

const ResultsCard: React.FC<ResultsCardProps> = ({
  analysis,
  onAccept,
  onEdit,
  onClose,
  position
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Set initial text
    const initialText = analysis.captionResult?.shortCaption || 
                       analysis.ocrResult?.ocr.text || 
                       'No description available';
    setEditedText(initialText);
    
    // Show card with animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [analysis]);

  const handleAccept = () => {
    onAccept(editedText);
    onClose();
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit(editedText);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProvenanceColor = (provenance: string) => {
    switch (provenance) {
      case 'openai': return 'bg-blue-100 text-blue-800';
      case 'huggingface': return 'bg-purple-100 text-purple-800';
      case 'local': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const cardStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${position.bottom + 10}px`,
    left: `${position.left}px`,
    zIndex: 10001,
    maxWidth: '400px',
    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
    opacity: isVisible ? 1 : 0,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  return (
    <div style={cardStyle} className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎨</span>
            <h3 className="font-semibold">AI Image Analysis</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close results card"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Short Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description
          </label>
          {isEditing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Enter description..."
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-800">{editedText}</p>
            </div>
          )}
        </div>

        {/* OCR Text (if available) */}
        {analysis.ocrResult?.ocr.text && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extracted Text (OCR)
            </label>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-mono">
                {analysis.ocrResult.ocr.text}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(analysis.ocrResult.ocr.confidence / 100)}`}>
                  {Math.round(analysis.ocrResult.ocr.confidence)}% confidence
                </span>
                <span className="text-xs text-gray-500">
                  {analysis.ocrResult.ocr.processingTime}ms
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Long Description (if available and expanded) */}
        {analysis.captionResult?.longDescription && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>{isExpanded ? '▼' : '▶'}</span>
              <span>{isExpanded ? 'Hide' : 'Show'} Detailed Description</span>
            </button>
            
            {isExpanded && (
              <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  {analysis.captionResult.longDescription}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-2">
          {analysis.captionResult && (
            <span className={`text-xs px-2 py-1 rounded-full ${getProvenanceColor(analysis.captionResult.provenance)}`}>
              {analysis.captionResult.provenance === 'openai' ? 'OpenAI' :
               analysis.captionResult.provenance === 'huggingface' ? 'HuggingFace' : 'Local'}
            </span>
          )}
          
          {analysis.ocrResult && (
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
              {analysis.ocrResult.imageType}
            </span>
          )}
          
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
            {analysis.processingTime}ms
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={handleEdit}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isEditing 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isEditing ? 'Save Edit' : 'Edit'}
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Accept & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;
