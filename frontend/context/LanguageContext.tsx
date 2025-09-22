import React, { createContext, useState, useContext, PropsWithChildren } from 'react';

type Language = 'en' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  // Try to get language from localStorage, or default to browser language, or 'en'
  const getInitialLanguage = (): Language => {
    const storedLang = localStorage.getItem('app-lang');
    if (storedLang === 'en' || storedLang === 'ko') {
      return storedLang;
    }
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'ko' ? 'ko' : 'en';
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  const setLanguage = (lang: Language) => {
    localStorage.setItem('app-lang', lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
