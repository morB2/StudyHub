// client/src/contexts/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';
import { auth } from '../firebase';

const LanguageContext = createContext(undefined);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('he'); // נגדיר ברירת מחדל עברית

  useEffect(() => {
    const fetchUserLang = async () => {
      if (auth.currentUser && auth.currentUser.language) {
        setLanguageState(auth.currentUser.language);
      }
    };
    fetchUserLang();
  }, []);

  const setLanguage = async (lang) => {
    setLanguageState(lang);
    if (auth.currentUser) {
      auth.currentUser.language = lang;
      console.log(`Mock Language Update: Changed to ${lang}`);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const isRTL = language === 'he';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div className={isRTL ? 'font-hebrew' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};