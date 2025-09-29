'use client'

import React from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header';
import LandingPage from '../components/LandingPage';
import Footer from '../components/Footer';

export default function Home() {
  console.log('🏛️ / 페이지 - 랜딩페이지 표시');

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen font-sans text-gray-800">
          <Header />
          <main className="container mx-auto px-4 py-12">
            <LandingPage />
          </main>
          <Footer />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}