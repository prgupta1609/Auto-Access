import React, { useState, useEffect } from 'react';
import { AccessibilityProfile } from '../../../lib/types';

interface ProfileEditorProps {
  profile: AccessibilityProfile;
  isCreating: boolean;
  onSave: (profile: AccessibilityProfile) => void;
  onCancel: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  isCreating,
  onSave,
  onCancel
}) => {
  const [editedProfile, setEditedProfile] = useState<AccessibilityProfile>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date()
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSettingChange = (setting: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      },
      updatedAt: new Date()
    }));
  };

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedProfile.name.trim()) {
      newErrors.name = 'Profile name is required';
    }

    if (!editedProfile.description.trim()) {
      newErrors.description = 'Profile description is required';
    }

    if (editedProfile.settings.fontSize < 0.5 || editedProfile.settings.fontSize > 3) {
      newErrors.fontSize = 'Font size must be between 0.5 and 3';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateProfile()) {
      onSave(editedProfile);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setErrors({});
    onCancel();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isCreating ? 'Create Profile' : 'Edit Profile'}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={handleCancel}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Basic Information */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="form-group">
              <label className="form-label">Profile Name</label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                value={editedProfile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter profile name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className={`form-textarea ${errors.description ? 'border-red-500' : ''}`}
                value={editedProfile.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe this profile's purpose"
                rows={3}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Accessibility Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Global Mode</label>
                  <div
                    className={`toggle ${editedProfile.settings.globalMode ? 'toggle-enabled' : 'toggle-disabled'}`}
                    onClick={() => handleSettingChange('globalMode', !editedProfile.settings.globalMode)}
                  >
                    <span
                      className={`toggle-thumb ${
                        editedProfile.settings.globalMode ? 'toggle-thumb-enabled' : 'toggle-thumb-disabled'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">OCR Enabled</label>
                  <div
                    className={`toggle ${editedProfile.settings.ocrEnabled ? 'toggle-enabled' : 'toggle-disabled'}`}
                    onClick={() => handleSettingChange('ocrEnabled', !editedProfile.settings.ocrEnabled)}
                  >
                    <span
                      className={`toggle-thumb ${
                        editedProfile.settings.ocrEnabled ? 'toggle-thumb-enabled' : 'toggle-thumb-disabled'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Text-to-Speech</label>
                  <div
                    className={`toggle ${editedProfile.settings.ttsEnabled ? 'toggle-enabled' : 'toggle-disabled'}`}
                    onClick={() => handleSettingChange('ttsEnabled', !editedProfile.settings.ttsEnabled)}
                  >
                    <span
                      className={`toggle-thumb ${
                        editedProfile.settings.ttsEnabled ? 'toggle-thumb-enabled' : 'toggle-thumb-disabled'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Speech-to-Text</label>
                  <div
                    className={`toggle ${editedProfile.settings.sttEnabled ? 'toggle-enabled' : 'toggle-disabled'}`}
                    onClick={() => handleSettingChange('sttEnabled', !editedProfile.settings.sttEnabled)}
                  >
                    <span
                      className={`toggle-thumb ${
                        editedProfile.settings.sttEnabled ? 'toggle-thumb-enabled' : 'toggle-thumb-disabled'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Contrast Fix</label>
                  <div
                    className={`toggle ${editedProfile.settings.contrastFix ? 'toggle-enabled' : 'toggle-disabled'}`}
                    onClick={() => handleSettingChange('contrastFix', !editedProfile.settings.contrastFix)}
                  >
                    <span
                      className={`toggle-thumb ${
                        editedProfile.settings.contrastFix ? 'toggle-thumb-enabled' : 'toggle-thumb-disabled'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Keyboard Mode</label>
                  <div
                    className={`toggle ${editedProfile.settings.keyboardMode ? 'toggle-enabled' : 'toggle-disabled'}`}
                    onClick={() => handleSettingChange('keyboardMode', !editedProfile.settings.keyboardMode)}
                  >
                    <span
                      className={`toggle-thumb ${
                        editedProfile.settings.keyboardMode ? 'toggle-thumb-enabled' : 'toggle-thumb-disabled'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Live Captions</label>
                  <div
                    className={`toggle ${editedProfile.settings.captions ? 'toggle-enabled' : 'toggle-disabled'}`}
                    onClick={() => handleSettingChange('captions', !editedProfile.settings.captions)}
                  >
                    <span
                      className={`toggle-thumb ${
                        editedProfile.settings.captions ? 'toggle-thumb-enabled' : 'toggle-thumb-disabled'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Sign Language</label>
                  <div
                    className={`toggle ${editedProfile.settings.signLanguage ? 'toggle-enabled' : 'toggle-disabled'}`}
                    onClick={() => handleSettingChange('signLanguage', !editedProfile.settings.signLanguage)}
                  >
                    <span
                      className={`toggle-thumb ${
                        editedProfile.settings.signLanguage ? 'toggle-thumb-enabled' : 'toggle-thumb-disabled'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Font Size Multiplier</label>
                <input
                  type="number"
                  min="0.5"
                  max="3"
                  step="0.1"
                  className={`form-input ${errors.fontSize ? 'border-red-500' : ''}`}
                  value={editedProfile.settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', parseFloat(e.target.value))}
                />
                {errors.fontSize && <p className="text-red-500 text-sm mt-1">{errors.fontSize}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Color Blind Preset</label>
                <select
                  className="form-select"
                  value={editedProfile.settings.colorBlindPreset || ''}
                  onChange={(e) => handleSettingChange('colorBlindPreset', e.target.value || undefined)}
                >
                  <option value="">None</option>
                  <option value="protanopia">Protanopia (Red-blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-blind)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isCreating ? 'Create Profile' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditor;
