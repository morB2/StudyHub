// client/src/components/Auth.jsx
import React, { useState, useEffect } from 'react';
import { auth, signOut, onAuthStateChanged } from '../firebase';
import { LogIn, LogOut, User as UserIcon, Settings } from 'lucide-react';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import { useLanguage } from '../contexts/LanguageContext';

export default function Auth() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // האזנה לשינויי מצב המשתמש המדומה או האמיתי ב-Auth המקומי
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Mock User Logged Out");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />;
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-4 animate-fade-in">
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-sm font-bold text-gray-900">
              {user.displayName || 'Anonymous'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Student
              </span>
              <button
                onClick={handleLogout}
                className="text-[10px] font-bold text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer"
              >
                <LogOut size={10} /> {t('logout')}
              </button>
            </div>
          </div>
          
          {/* Avatar Button to open profile */}
          <button 
            onClick={() => setShowProfileModal(true)}
            className="relative group cursor-pointer outline-none"
          >
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || ''} 
                className="w-10 h-10 rounded-full border border-gray-200 shadow-sm group-hover:scale-105 transition-transform" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform text-indigo-400">
                <UserIcon size={20} />
              </div>
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-bold text-sm cursor-pointer"
        >
          <LogIn size={18} />
          {t('signIn')}
        </button>
      )}

      {/* Auth Modal Selection */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* Profile Editing Modal */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}