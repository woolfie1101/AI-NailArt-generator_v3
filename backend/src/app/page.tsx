'use client'

import React from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import App from '../../App';

export default function Home() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}