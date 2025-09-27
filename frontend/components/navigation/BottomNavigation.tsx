import React from 'react';
import clsx from 'clsx';
import { Home, Sparkles, Folder, User as UserIcon } from 'lucide-react';

export type BottomNavTab = 'home' | 'create' | 'library' | 'profile';

interface BottomNavigationProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
}

const TABS: Array<{ id: BottomNavTab; label: string; Icon: React.ComponentType<{ className?: string }>; }> = [
  { id: 'home', label: '홈', Icon: Home },
  { id: 'create', label: '생성', Icon: Sparkles },
  { id: 'library', label: '라이브러리', Icon: Folder },
  { id: 'profile', label: '프로필', Icon: UserIcon },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200/80 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-6 py-3">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={clsx(
                'flex flex-col items-center gap-1 text-xs font-medium transition-colors',
                isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'
              )}
            >
              <span
                className={clsx(
                  'rounded-full p-2 transition-colors',
                  isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
