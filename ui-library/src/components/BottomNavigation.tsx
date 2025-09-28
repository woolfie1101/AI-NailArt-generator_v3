import { Home, Wand2, FolderOpen, User } from "lucide-react";

export type TabType = 'home' | 'generator' | 'library' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'home' as TabType, icon: Home, label: '홈' },
    { id: 'generator' as TabType, icon: Wand2, label: '생성' },
    { id: 'library' as TabType, icon: FolderOpen, label: '라이브러리' },
    { id: 'profile' as TabType, icon: User, label: '프로필' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1"
            >
              <Icon 
                className={`w-6 h-6 mb-1 transition-colors ${
                  isActive 
                    ? 'text-purple-600 fill-purple-600' 
                    : 'text-gray-500'
                }`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className={`text-xs transition-colors ${
                isActive ? 'text-purple-600 font-medium' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}