// client/src/components/ProfileModal.jsx
import React, { useState } from 'react';
import { auth, updateProfile } from '../firebase';
import { X, User, Save, Check, Camera } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProfileModal({ onClose }) {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || '');
  const [bio, setBio] = useState(auth.currentUser?.bio || '');
  const [institution, setInstitution] = useState(auth.currentUser?.institution || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      // עדכון ה-Profile המדומה ב-Auth המקומי
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL
      });

      // עדכון שאר השדות המורחבים באובייקט הדמה
      auth.currentUser.bio = bio;
      auth.currentUser.institution = institution;

      console.log("Mock Profile Updated Successfully:", auth.currentUser);

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden relative transform transition-all scale-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('profile')}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="space-y-4">
            
            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">{t('displayName')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>

            {/* Avatar URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                {t('avatarUrl')} ({t('optional')})
              </label>
              <div className="relative">
                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                />
              </div>
            </div>

            {/* Institution */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                {t('institution')} ({t('optional')})
              </label>
              <input
                type="text"
                placeholder={t('institution')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                {t('bio')} ({t('optional')})
              </label>
              <textarea
                placeholder={t('bio')}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
              success ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {success ? <Check size={20} /> : <Save size={20} />}
            {loading ? '...' : (success ? t('saved') : t('saveChanges'))}
          </button>
        </form>

      </div>
    </div>
  );
}