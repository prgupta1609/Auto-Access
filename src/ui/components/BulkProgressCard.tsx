import React from 'react';
import { BulkAnalysisProgress } from '../../lib/imageScanner';

interface BulkProgressCardProps {
  progress: BulkAnalysisProgress;
  onCancel: () => void;
}

const BulkProgressCard: React.FC<BulkProgressCardProps> = ({
  progress,
  onCancel
}) => {
  const percentage = Math.round((progress.completed / progress.total) * 100);
  const isComplete = progress.completed >= progress.total;

  return (
    <div className="fixed top-4 right-4 z-10002 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🚀</span>
          <h3 className="font-semibold text-gray-800">Bulk Image Analysis</h3>
        </div>
        {!isComplete && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cancel bulk analysis"
          >
            ✕
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress
          </span>
          <span className="text-sm text-gray-500">
            {progress.completed} / {progress.total}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {percentage}% complete
          </span>
          {progress.errors > 0 && (
            <span className="text-xs text-red-500">
              {progress.errors} errors
            </span>
          )}
        </div>
      </div>

      {/* Current Status */}
      {progress.current && !isComplete && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Processing...</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate" title={progress.current}>
            {progress.current}
          </p>
        </div>
      )}

      {/* Results Summary */}
      {isComplete && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-500">✓</span>
            <span className="text-sm font-medium text-gray-700">Analysis Complete!</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-700">
                {progress.results.filter(r => !r.error).length}
              </div>
              <div className="text-green-600">Successful</div>
            </div>
            
            {progress.errors > 0 && (
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="font-semibold text-red-700">
                  {progress.errors}
                </div>
                <div className="text-red-600">Failed</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end">
        {isComplete ? (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default BulkProgressCard;
