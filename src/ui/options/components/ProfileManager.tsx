import React, { useState } from 'react';
import { AccessibilityProfile } from '../../../lib/types';
import ProfileEditor from './ProfileEditor';

interface ProfileManagerProps {
  profiles: AccessibilityProfile[];
  onProfilesChange: (profiles: AccessibilityProfile[]) => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  onProfilesChange
}) => {
  const [editingProfile, setEditingProfile] = useState<AccessibilityProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProfile = () => {
    const newProfile: AccessibilityProfile = {
      id: `profile-${Date.now()}`,
      name: 'New Profile',
      description: 'Custom accessibility profile',
      settings: {
        globalMode: false,
        ocrEnabled: true,
        ttsEnabled: true,
        sttEnabled: false,
        contrastFix: false,
        keyboardMode: false,
        captions: false,
        signLanguage: false,
        fontSize: 1
      },
      siteOverrides: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setEditingProfile(newProfile);
    setIsCreating(true);
  };

  const handleEditProfile = (profile: AccessibilityProfile) => {
    setEditingProfile(profile);
    setIsCreating(false);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      const newProfiles = profiles.filter(p => p.id !== profileId);
      onProfilesChange(newProfiles);
    }
  };

  const handleSaveProfile = (profile: AccessibilityProfile) => {
    let newProfiles: AccessibilityProfile[];
    
    if (isCreating) {
      newProfiles = [...profiles, profile];
    } else {
      newProfiles = profiles.map(p => p.id === profile.id ? profile : p);
    }
    
    onProfilesChange(newProfiles);
    setEditingProfile(null);
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
    setIsCreating(false);
  };

  if (editingProfile) {
    return (
      <ProfileEditor
        profile={editingProfile}
        isCreating={isCreating}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Accessibility Profiles</h2>
          <p className="text-gray-600 mt-1">
            Create and manage custom accessibility profiles for different needs
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCreateProfile}
        >
          Create Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <div key={profile.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  onClick={() => handleEditProfile(profile)}
                >
                  Edit
                </button>
                {profile.id !== 'default' && (
                  <button
                    className="text-red-600 hover:text-red-800 text-sm"
                    onClick={() => handleDeleteProfile(profile.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-700">
                <strong>Active Features:</strong>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(profile.settings).map(([key, value]) => {
                  if (typeof value === 'boolean' && value) {
                    const labels: Record<string, string> = {
                      globalMode: 'Global Mode',
                      ocrEnabled: 'OCR',
                      ttsEnabled: 'TTS',
                      sttEnabled: 'STT',
                      contrastFix: 'Contrast Fix',
                      keyboardMode: 'Keyboard',
                      captions: 'Captions',
                      signLanguage: 'Sign Language'
                    };
                    
                    return (
                      <span
                        key={key}
                        className="status-indicator status-active text-xs"
                      >
                        {labels[key] || key}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Created: {profile.createdAt.toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500">
                Updated: {profile.updatedAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first accessibility profile to get started
          </p>
          <button
            className="btn btn-primary"
            onClick={handleCreateProfile}
          >
            Create Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileManager;
