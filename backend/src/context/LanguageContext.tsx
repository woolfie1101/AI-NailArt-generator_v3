import React, { createContext, useState, useContext, PropsWithChildren, useEffect } from 'react';

type Language = 'en' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  // Default to 'en' on server, will be hydrated with correct value on client
  const [language, setLanguageState] = useState<Language>('en');

  // Client-side initialization
  useEffect(() => {
    const getInitialLanguage = (): Language => {
      // Check if we're on the client side
      if (typeof window === 'undefined') return 'en';

      const storedLang = localStorage.getItem('app-lang');
      if (storedLang === 'en' || storedLang === 'ko') {
        return storedLang;
      }
      const browserLang = navigator.language.split('-')[0];
      return browserLang === 'ko' ? 'ko' : 'en';
    };

    setLanguageState(getInitialLanguage());
  }, []);

  const setLanguage = (lang: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-lang', lang);
    }
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
