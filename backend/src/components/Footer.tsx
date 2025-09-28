import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

const Footer: React.FC = () => {
  const { t, language } = useTranslations();
  return (
    <footer className="w-full text-center py-6 text-sm text-gray-500">
      <div className="flex justify-center items-center space-x-4 mb-2">
        <a 
          href="https://github.com/joohee-k" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-indigo-500 transition-colors"
          aria-label="Joohee Kim's GitHub Profile"
        >
          GitHub
        </a>
        <span aria-hidden="true">|</span>
        <a 
          href="https://www.linkedin.com/in/joohee-kim-077740347/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-indigo-500 transition-colors"
          aria-label="Joohee Kim's LinkedIn Profile"
        >
          LinkedIn
        </a>
        <span aria-hidden="true">|</span>
        <a 
          href="mailto:woolfie1101@gmail.com" 
          className="hover:text-indigo-500 transition-colors"
          aria-label="Email Joohee Kim"
        >
          Email
        </a>
      </div>
      <p>&copy; {new Date().getFullYear()} Kim Joohee. {t('footerCopyright')}</p>
       <p className="mt-2">{t('footerPoweredBy')}</p>
    </footer>
  );
};

export default Footer;