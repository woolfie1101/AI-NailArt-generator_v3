import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import AuthButton from './AuthButton';

const Header: React.FC = () => {
  const { t, language, setLanguage } = useTranslations();

  const handleLanguageChange = (lang: 'en' | 'ko') => {
    setLanguage(lang);
  };

  return (
    <header className="py-8 text-center relative">
      <div className="absolute top-4 right-4 md:top-6 md:right-8 flex items-center space-x-4">
        <AuthButton />
        <div className="flex items-center p-1 bg-gray-200/80 rounded-full">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              language === 'en' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            }`}
            aria-pressed={language === 'en'}
          >
            EN
          </button>
          <button
            onClick={() => handleLanguageChange('ko')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              language === 'ko' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            }`}
            aria-pressed={language === 'ko'}
          >
            KO
          </button>
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
        {t('headerTitle')}
      </h1>
      <p className="text-base text-gray-500 mt-2">
        {t('headerSubtitle')}
      </p>
    </header>
  );
};

export default Header;