// client/src/components/ProfileModal.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { X, User, Save, Check, Camera } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProfileModal({ onClose }) {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || '');
  const [selectedFile, setSelectedFile] = useState(null); 
  const [bio, setBio] = useState(auth.currentUser?.bio || '');
  const [institution, setInstitution] = useState(auth.currentUser?.institution || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

const handleSave = async (e) => {
    e.preventDefault();
    
    // שליפת המשתמש האמיתי מהלוקאל סטורג'
    const storedUserString = localStorage.getItem("studybuddy_user");
    if (!storedUserString) return;
    
    const storedUser = JSON.parse(storedUserString);

    setLoading(true);
    try {
      // שימוש ב-FormData כי אנחנו שולחים קבצים (תמונה) ולא רק טקסט
      const formData = new FormData();
      formData.append("id", storedUser.id);
      formData.append("name", displayName);
      formData.append("bio", bio);
      formData.append("institution", institution);
      
      // אם בחרנו קובץ - נשלח אותו תחת השם 'avatar'
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      } else if (photoURL) {
        formData.append("photoURL", photoURL);
      }

      // שליחת הבקשה לשרת ה-Node.js שלך
      const response = await fetch("http://localhost:3001/users/update", {
        method: "PUT",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const responseData = await response.json();

      // עדכון ה-Local Storage עם הנתונים החדשים שחזרו מהשרת
      localStorage.setItem("studybuddy_user", JSON.stringify(responseData.user));

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // רענון העמוד כדי שהתמונה והשם החדשים יופיעו ב-Navbar למעלה
        window.location.reload(); 
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
            {/* Avatar Section - URL or File Upload */}
            <div className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                {t('avatarUrl')} ({t('optional')})
              </label>
              
              {/* אופציה 1: הדבקת קישור */}
              <div className="relative">
                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm disabled:opacity-50 disabled:bg-gray-100"
                  value={photoURL}
                  onChange={(e) => {
                    setPhotoURL(e.target.value);
                    setSelectedFile(null); // איפוס הקובץ אם מקלידים קישור
                  }}
                  disabled={!!selectedFile} // נטרול השדה אם נבחר קובץ
                />
              </div>

              <div className="text-center text-xs text-gray-400 font-bold">- או -</div>

              {/* אופציה 2: העלאת קובץ מהמחשב */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      setPhotoURL(''); // איפוס הקישור אם מעלים קובץ
                    }
                  }}
                />
                {selectedFile && (
                  <p className="text-[11px] text-emerald-600 mt-2 ml-1 font-medium">
                    קובץ נבחר: {selectedFile.name}
                  </p>
                )}
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