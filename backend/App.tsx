import React from 'react';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import UnauthenticatedApp from './src/components/UnauthenticatedApp';
import AuthenticatedApp from './src/components/AuthenticatedApp';

// 메인 AppContent 컴포넌트 - 조건부 렌더링
const AppContent: React.FC = () => {
  const { user, session } = useAuth();
  
  // 로그인하지 않은 사용자는 UnauthenticatedApp 렌더링
  if (!user || !session) {
    return <UnauthenticatedApp />;
  }
  
  // 로그인한 사용자는 AuthenticatedApp 렌더링
  return <AuthenticatedApp />;
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;