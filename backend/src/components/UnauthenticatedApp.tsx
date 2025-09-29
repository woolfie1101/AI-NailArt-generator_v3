import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import LandingPage from './LandingPage';
import Footer from './Footer';

const UnauthenticatedApp: React.FC = () => {
  const { user, loading: authLoading, session } = useAuth();
  
  console.log('🔍 사용자 로그인 상태:', { user: !!user, session: !!session, loading: authLoading });
  
  return (
    <div className="min-h-screen font-sans text-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <LandingPage />
      </main>
      <Footer />
    </div>
  );
};

export default UnauthenticatedApp;
