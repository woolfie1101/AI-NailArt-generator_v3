'use client'
import React from 'react';
import { LanguageProvider } from '../../context/LanguageContext';
import App from '../../../App';

export default function HomePage() {
  console.log('🏠 /home 페이지 - 메인 앱 로드');

  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}