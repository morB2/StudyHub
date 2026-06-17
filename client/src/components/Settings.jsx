// client/src/components/Settings.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Globe, Bell, Save } from 'lucide-react';

export default function Settings({ onClose }) {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [chatNotifications, setChatNotifications] = useState(true);
  const [meetingNotifications, setMeetingNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = () => {
      if (auth.currentUser && auth.currentUser.notificationSettings) {
        setChatNotifications(auth.currentUser.notificationSettings.chat ?? true);
        setMeetingNotifications(auth.currentUser.notificationSettings.meetings ?? true);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // עדכון נתוני הדמה המקומיים
      if (auth.currentUser) {
        auth.currentUser.notificationSettings = {
          chat: chatNotifications,
          meetings: meetingNotifications
        };
        console.log("Settings Saved:", auth.currentUser.notificationSettings);
      }
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
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
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('settings')}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Language Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Globe size={14} />
              {t('language')}
            </label>
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              <button
                onClick={() => setLanguage('he')}
                className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                  language === 'he' 
                    ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100/50 font-bold' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                עברית
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                  language === 'en' 
                    ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100/50 font-bold' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Notifications Toggles */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Bell size={14} />
              {t('notifications')}
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100/70 transition-colors border border-gray-50">
                <span className="font-medium text-gray-700 text-sm">{t('chatNotifications')}</span>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-gray-300 transition-all cursor-pointer"
                  checked={chatNotifications}
                  onChange={(e) => setChatNotifications(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100/70 transition-colors border border-gray-50">
                <span className="font-medium text-gray-700 text-sm">{t('meetingNotifications')}</span>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-gray-300 transition-all cursor-pointer"
                  checked={meetingNotifications}
                  onChange={(e) => setMeetingNotifications(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? '...' : t('save')}
          </button>
        </div>

      </div>
    </div>
  );
}