import { useCallback, useEffect } from 'react';
import { resolveTabFromLocation, extractFolderIdFromPath, TAB_PATHS, normalizePath } from '../utils/navigation';

export function useNavigation(
  activeTab: string,
  setActiveTab: any,
  selectedFolderId: string | null,
  setSelectedFolderId: any,
  resetLibraryView: any
) {
  const navigateToTab = useCallback(
    (tab: string, options: { replace?: boolean } = {}) => {
      setActiveTab(tab);

      if (typeof window === 'undefined') {
        if (tab !== 'library') {
          resetLibraryView();
        }
        return;
      }

      const targetPath = TAB_PATHS[tab];
      const currentPath = normalizePath(window.location.pathname);
      const normalizedTarget = normalizePath(targetPath);

      if (currentPath !== normalizedTarget) {
        if (options.replace) {
          window.history.replaceState({ tab }, '', targetPath);
        } else {
          window.history.pushState({ tab }, '', targetPath);
        }
      } else if (options.replace) {
        window.history.replaceState({ tab }, '', targetPath);
      }

      if (tab !== 'library') {
        resetLibraryView();
      }
    },
    [resetLibraryView, setActiveTab]
  );

  // URL 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handlePopState = () => {
      const nextTab = resolveTabFromLocation(window.location.pathname);
      const folderId = extractFolderIdFromPath(window.location.pathname);

      setActiveTab(nextTab);

      if (nextTab === 'library' && folderId) {
        setSelectedFolderId(folderId);
      } else if (nextTab !== 'library') {
        resetLibraryView();
      } else {
        // library 탭이지만 폴더 ID가 없는 경우 (라이브러리 메인)
        setSelectedFolderId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setActiveTab, setSelectedFolderId, resetLibraryView]);

  // 초기 탭 설정
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const initialTab = resolveTabFromLocation(window.location.pathname);
    const folderId = extractFolderIdFromPath(window.location.pathname);
    
    setActiveTab(initialTab);
    setSelectedFolderId(folderId);
    window.history.replaceState({ tab: initialTab }, '', TAB_PATHS[initialTab]);
  }, [setActiveTab, setSelectedFolderId]);

  return {
    navigateToTab,
  };
}
