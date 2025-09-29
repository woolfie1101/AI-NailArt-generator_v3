'use client'

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const DebugPanel: React.FC = () => {
  const { user, session, loading, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg"
      >
        Debug
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md">
          <h3 className="font-bold text-sm mb-2">🔍 Auth Debug Info</h3>
          <div className="text-xs space-y-1">
            <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
            <div><strong>User:</strong> {user ? user.email : 'null'}</div>
            <div><strong>Session:</strong> {session ? 'active' : 'null'}</div>
            <div><strong>Profile:</strong> {profile ? 'loaded' : 'null'}</div>
            <div><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'server'}</div>
            <div><strong>Hash:</strong> {typeof window !== 'undefined' ? window.location.hash : 'server'}</div>
            <div><strong>Search:</strong> {typeof window !== 'undefined' ? window.location.search : 'server'}</div>
            <div><strong>LocalStorage:</strong> {typeof window !== 'undefined' ? 
              Object.keys(localStorage).filter(key => key.includes('supabase')).join(', ') : 'server'}</div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
