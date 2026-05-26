// client/src/App.jsx

import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from './firebase';
import { mockGroups } from './mock/mockData';
import { useLanguage } from './contexts/LanguageContext';

// ייבוא קומפוננטות המסכים והרכיבים
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import CreateGroup from './components/CreateGroup';
import GroupList from './components/GroupList';
import GroupDetail from './components/GroupDetail';
import InvitationsList from './components/InvitationsList';
import NotificationManager from './components/NotificationManager';
import Settings from './components/Settings';

// ייבוא אייקונים
import { Plus, GraduationCap, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';

export default function App() {
  const { t, isRTL } = useLanguage();
  
  const [user, setUser] = useState(auth.currentUser);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toasts, setToasts] = useState([]);

  // האזנה למצב המשתמש (מזהה התחברות והתנתקות בזמן אמת)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setSelectedGroup(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (title, description, type, groupId) => {
    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, description, type, groupId }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const handleToastClick = (toast) => {
    if (toast.groupId) {
      const foundGroup = mockGroups.find(g => g.id === toast.groupId);
      if (foundGroup) {
        setSelectedGroup(foundGroup);
      }
    }
    setToasts(prev => prev.filter(t => t.id !== toast.id));
  };

  // שומר סף: אם אין משתמש מחובר, מרנדרים רק את עמוד הנחיתה הנפרד
  if (!user) {
    return <LandingPage />;
  }

  // תצוגת הדשבורד הרשמית למשתמש מחובר
  return (
    <div className={`min-h-screen bg-gray-50/60 font-sans text-gray-900 ${isRTL ? 'rtl text-right' : 'ltr text-left'}`}>
      
      <NotificationManager onNotify={showToast} />

      {/* סרגל ניווט עליון (Navbar) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedGroup(null)}>
          <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-100">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            StudyBuddy
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
            title={t('settings')}
          >
            <SettingsIcon size={20} />
          </button>
          
          {/* כפתור פרופיל והתנתקות בקצה ה-Navbar */}
          <Auth mode="navbarOnly" />
        </div>
      </header>

      {/* תוכן מרכזי של הדשבורד */}
      <main className="pb-16">
        {selectedGroup ? (
          <GroupDetail group={selectedGroup} onBack={() => setSelectedGroup(null)} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
            <InvitationsList />

            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer"
              >
                <Plus size={18} />
                <span>{t('createGroup')}</span>
              </button>
            </div>

            <GroupList onSelectGroup={setSelectedGroup} />
          </div>
        )}
      </main>

      {showSettingsModal && <Settings onClose={() => setShowSettingsModal(false)} />}
      {showCreateModal && <CreateGroup onClose={() => setShowCreateModal(false)} />}

      {/* מערכת התראות צפות */}
      <div className={`fixed bottom-6 z-50 flex flex-col gap-3 max-w-sm w-full p-4 ${isRTL ? 'left-6' : 'right-6'}`}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            onClick={() => handleToastClick(toast)}
            className="bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-gray-800 flex items-start gap-3 cursor-pointer hover:bg-gray-800 transition-all animate-slide-in"
          >
            <div className="p-1.5 bg-indigo-500 text-white rounded-lg mt-0.5">
              <ShieldAlert size={16} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold text-white">{toast.title}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{toast.description}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}