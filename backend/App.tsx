import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Header from './src/components/Header';
import LandingPage from './src/components/LandingPage';
import ErrorModal from './src/components/ErrorModal';
import Footer from './src/components/Footer';
import ImageUploader from './src/components/ImageUploader';
import InspirationCarousel from './src/components/InspirationCarousel';
import ResultDisplay from './src/components/ResultDisplay';
import { SparklesIcon } from './src/components/icons/SparklesIcon';
import { BottomNavigation, BottomNavTab } from './src/components/navigation/BottomNavigation';
import { HomeFeed } from './src/components/social/HomeFeed';
import { PostDetailModal } from './src/components/social/PostDetailModal';
import { UserProfile } from './src/components/social/UserProfile';
import { CreatePost } from './src/components/social/CreatePost';
import { LibraryView } from './src/components/library/LibraryView';
import { FolderDetailView } from './src/components/library/FolderDetailView';
import { fileToBase64 } from './src/utils/fileUtils';
import { generateNailArt, extractDominantColors, generateTagsForImage } from './src/services/geminiService';
import { BackendService, UploadedAsset } from './src/services/backendService';
import {
  fetchLibraryFolders,
  fetchLibraryFolderDetail,
  toggleFavoriteFolder,
  deleteFolder,
  deleteAsset,
  updateFolder,
  updateAsset,
} from './src/services/libraryService';
import type {
  AppState,
  GenerationMode,
  StagedChanges,
  FeedPost,
  LibraryFolder,
  LibraryImage,
  ProfileSummary,
  GeneratedResult,
} from './src/types';
import { AppStatus } from './src/types';
import { useTranslations } from './src/hooks/useTranslations';
import { translations } from './src/lib/i18n/translations';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DebugPanel } from './src/components/DebugPanel';

const TAB_PATHS: Record<BottomNavTab, string> = {
  home: '/home',
  create: '/create',
  library: '/library',
  profile: '/profile',
};

function normalizePath(path: string) {
  if (!path) return '/';
  const normalized = path.replace(/\/+/g, '/').replace(/\/+$/, '');
  return normalized.length === 0 ? '/' : normalized;
}

function resolveTabFromLocation(pathname: string): BottomNavTab {
  const normalized = normalizePath(pathname);
  if (normalized.startsWith('/library')) {
    return 'library';
  }
  switch (normalized) {
    case '/create':
      return 'create';
    case '/profile':
      return 'profile';
    default:
      return 'home';
  }
}

function extractFolderIdFromPath(pathname: string): string | null {
  const normalized = normalizePath(pathname);
  const match = normalized.match(/^\/library\/folder\/(.+)$/);
  return match ? match[1] : null;
}

const SAMPLE_FEED_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    imageUrl: 'https://images.unsplash.com/photo-1599472308689-1b0d452886b7?auto=format&fit=crop&w=800&q=80',
    author: {
      id: 'nail_artist_kr',
      name: '김예린',
      avatar: 'https://images.unsplash.com/photo-1722270608841-35d7372a2e85?auto=format&fit=crop&w=200&q=80',
    },
    likes: 124,
    hasLiked: false,
    commentCount: 8,
    caption: '미니멀 프렌치 네일 완성! ✨ #프렌치네일 #미니멀',
  },
  {
    id: 'post-2',
    imageUrl: 'https://images.unsplash.com/photo-1667877610066-18221c560e30?auto=format&fit=crop&w=800&q=80',
    author: {
      id: 'seoul_nail',
      name: '이서현',
      avatar: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?auto=format&fit=crop&w=200&q=80',
    },
    likes: 89,
    hasLiked: true,
    commentCount: 12,
    caption: '가을 분위기 가득한 네일 디자인 🍂',
  },
];

const SAMPLE_PROFILE: ProfileSummary = {
  id: 'you',
  name: 'My Nail Studio',
  avatar: 'https://images.unsplash.com/photo-1722270608841-35d7372a2e85?auto=format&fit=crop&w=200&q=80',
  bio: 'AI 네일 아트 실험실 ✨ 트렌디한 디자인 기록 중',
  followers: 5420,
  following: 321,
  posts: 12,
  isPrivate: false,
};

// 로그인하지 않은 사용자를 위한 컴포넌트
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

// 로그인한 사용자를 위한 메인 앱 컴포넌트
const AuthenticatedApp: React.FC = () => {
  const { t, language } = useTranslations();
  const { user, loading: authLoading, session } = useAuth();

  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(SAMPLE_FEED_POSTS);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [profile, setProfile] = useState<ProfileSummary>(SAMPLE_PROFILE);
  const [libraryFolders, setLibraryFolders] = useState<LibraryFolder[]>([]);
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [createPostContext, setCreatePostContext] = useState<{ open: boolean; folderId: string | null; imageId: string | null }>({ open: false, folderId: null, imageId: null });
  const [activeGroup, setActiveGroup] = useState<{ id: string; name: string } | null>(null);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [folderDetailLoading, setFolderDetailLoading] = useState(false);
  const [folderDetailError, setFolderDetailError] = useState<string | null>(null);

  // Generator states (existing functionality)
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [styleImage, setStyleImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [appState, setAppState] = useState<AppState>({ status: AppStatus.IDLE });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('inspiration');
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [stagedChanges, setStagedChanges] = useState<StagedChanges>({
    colorSwap: null,
    styleModifier: null,
    textPrompt: '',
  });
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [folderTags, setFolderTags] = useState<Record<string, {
    tags: string[];
    isLoading: boolean;
    isDirty: boolean;
    isSaving: boolean;
    error?: string;
  }>>({});
  const loadingIntervalRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    },
    []
  );

  // 리다이렉트 로직 제거 - 각 URL에서 해당 컨텐츠 바로 표시

  useEffect(() => {
    if (!session?.access_token) {
      setLibraryFolders([]);
      setLibraryImages([]);
      setSelectedFolderId(null);
      setLibraryError(null);
      setLibraryLoading(false);
      setFolderDetailError(null);
      setFolderDetailLoading(false);
      return;
    }

    setLibraryLoading(true);
    setLibraryError(null);

    fetchLibraryFolders(session.access_token)
      .then((folders) => {
        setLibraryFolders(folders);
        setSelectedFolderId((prev) => (prev && folders.some((folder) => folder.id === prev) ? prev : null));
        setLibraryImages((prevImages) =>
          prevImages.filter((image) => folders.some((folder) => folder.id === image.folderId))
        );

        // URL에서 폴더 ID를 확인하고 해당 폴더 로드
        if (typeof window !== 'undefined') {
          const folderIdFromUrl = extractFolderIdFromPath(window.location.pathname);
          if (folderIdFromUrl && folders.some((folder) => folder.id === folderIdFromUrl)) {
            // 직접 폴더 상세 조회 실행 (handleSelectFolder 호출 시 무한 루프 방지)
            setSelectedFolderId(folderIdFromUrl);
            setFolderDetailLoading(true);
            setFolderDetailError(null);

            fetchLibraryFolderDetail(session.access_token, folderIdFromUrl)
              .then(({ folder, assets }) => {
                setLibraryFolders((prev) => {
                  const index = prev.findIndex((item) => item.id === folderIdFromUrl);
                  if (index === -1) {
                    return [folder, ...prev];
                  }
                  const next = [...prev];
                  next[index] = { ...next[index], ...folder };
                  return next;
                });

                setLibraryImages((prev) => {
                  const filtered = prev.filter((image) => image.folderId !== folderIdFromUrl);
                  return [...filtered, ...assets];
                });
              })
              .catch((error) => {
                console.error('폴더 상세 조회 실패:', error);
                setFolderDetailError(error instanceof Error ? error.message : '폴더 정보를 불러오지 못했습니다.');
              })
              .finally(() => {
                setFolderDetailLoading(false);
              });
          }
        }
      })
      .catch((error) => {
        console.error('라이브러리 목록 조회 실패:', error);
        setLibraryError(error instanceof Error ? error.message : '라이브러리를 불러오지 못했습니다.');
      })
      .finally(() => {
        setLibraryLoading(false);
      });
  }, [session?.access_token]);

  const handleColorExtraction = useCallback(async (previewUrl: string) => {
    setIsExtractingColors(true);
    setExtractedColors([]);
    try {
      const [metaPart, base64Part] = previewUrl.split(',');
      const mimeType = metaPart.split(':')[1]?.split(';')[0] ?? 'image/png';
      const colors = await extractDominantColors({ data: base64Part, mimeType });
      setExtractedColors(colors);
    } catch (error) {
      console.error('Failed to extract colors:', error);
    } finally {
      setIsExtractingColors(false);
    }
  }, []);

  const syncLibraryWithAsset = useCallback((asset: UploadedAsset, groupInfo: { id: string; name: string }) => {
    const createdAt = asset.createdAt ?? new Date().toISOString();
    // 전체 datetime 유지 (시분초 포함)
    const createdDate = createdAt.slice(0, 10); // 디스플레이용 날짜
    let isNewAsset = false;

    setLibraryImages((prev) => {
      const exists = prev.some((image) => image.id === asset.id);
      isNewAsset = !exists;
      const withoutCurrent = prev.filter((image) => image.id !== asset.id);
      const mapped: LibraryImage = {
        id: asset.id,
        folderId: asset.groupId,
        imageUrl: asset.imageUrl,
        name: asset.name,
        createdAt: createdAt, // 전체 datetime 사용
        tags: asset.tags ?? [],
        storagePath: asset.storagePath,
        parentAssetId: asset.parentAssetId ?? null,
      };
      return [mapped, ...withoutCurrent];
    });

    setLibraryFolders((prev) => {
      const index = prev.findIndex((folder) => folder.id === groupInfo.id);

      if (index === -1) {
        const newFolder: LibraryFolder = {
          id: groupInfo.id,
          name: groupInfo.name,
          description: null,
          createdAt: createdAt, // 전체 datetime 사용
          imageCount: 1,
          tags: asset.tags ?? [],
          isFavorite: false,
          thumbnails: [asset.imageUrl],
        };
        return [newFolder, ...prev];
      }

      const folder = prev[index];
      const thumbnails = [asset.imageUrl, ...folder.thumbnails.filter((url) => url !== asset.imageUrl)].slice(0, 4);

      const next = [...prev];
      next[index] = {
        ...folder,
        name: groupInfo.name,
        imageCount: folder.imageCount + (isNewAsset ? 1 : 0),
        thumbnails,
        tags: folder.tags.length > 0 ? folder.tags : asset.tags ?? [],
      };

      return next;
    });
  }, []);

  const mapToGeneratedResult = useCallback((asset: UploadedAsset, previewUrl: string): GeneratedResult => (
    {
      previewUrl,
      asset: {
        id: asset.id,
        groupId: asset.groupId,
        imageUrl: asset.imageUrl,
        storagePath: asset.storagePath,
        name: asset.name,
        createdAt: asset.createdAt ?? null,
        tags: asset.tags,
        parentAssetId: asset.parentAssetId ?? null,
      },
    }
  ), []);

  const handleFolderTagsChange = useCallback((folderId: string, newTags: string[]) => {
    console.log('handleFolderTagsChange called:', folderId, newTags);

    setFolderTags((prev) => ({
      ...prev,
      [folderId]: {
        tags: newTags,
        isLoading: false,
        isDirty: true,
        isSaving: false,
        error: undefined,
      },
    }));

    // 폴더 정보 업데이트
    setLibraryFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, tags: newTags } : folder
      )
    );

    console.log('Folder tags updated in state');
  }, []);

  const handleSaveFolderTags = useCallback(
    async (folderId: string) => {
      console.log('handleSaveFolderTags called for folder:', folderId);

      const entry = folderTags[folderId];
      console.log('Folder tags entry:', entry);

      if (!entry) {
        console.log('No folder tags entry found');
        return;
      }

      if (!session?.access_token) {
        console.log('No access token available');
        alert('로그인이 필요합니다.');
        return;
      }

      const nextTags = entry.tags;
      console.log('Tags to save:', nextTags);

      const previousFolders = libraryFolders;

      setFolderTags((prev) => ({
        ...prev,
        [folderId]: {
          ...prev[folderId],
          isSaving: true,
          error: undefined,
        },
      }));

      try {
        console.log('Calling updateFolder API...');
        await updateFolder(session.access_token, folderId, { tags: nextTags });
        console.log('updateFolder API success');

        setFolderTags((prev) => ({
          ...prev,
          [folderId]: {
            ...prev[folderId],
            isSaving: false,
            isDirty: false,
            error: undefined,
          },
        }));

        setLibraryFolders((prev) =>
          prev.map((folder) =>
            folder.id === folderId ? { ...folder, tags: nextTags } : folder
          )
        );

        console.log('Folder tags saved successfully');
      } catch (error) {
        console.error('폴더 태그 저장 실패:', error);
        const message = error instanceof Error ? error.message : '태그를 저장하지 못했습니다.';

        setFolderTags((prev) => ({
          ...prev,
          [folderId]: {
            ...prev[folderId],
            isSaving: false,
            isDirty: true,
            error: message,
          },
        }));

        setLibraryFolders(previousFolders);
        alert(`태그 저장 실패: ${message}`);
      }
    },
    [folderTags, libraryFolders, session?.access_token]
  );

  const handleFolderTagGeneration = useCallback(
    async (result: { previewUrl: string; folderId: string }) => {
      console.log('handleFolderTagGeneration called:', result.folderId);

      // 이미 태그가 있는 폴더는 생성하지 않음
      const existingFolder = libraryFolders.find(f => f.id === result.folderId);
      console.log('existingFolder:', existingFolder);

      if (existingFolder && existingFolder.tags.length > 0) {
        console.log('Folder already has tags, skipping generation');
        return;
      }

      // 이미 태그 생성 중인지 확인
      const currentFolderTags = folderTags[result.folderId];
      if (currentFolderTags?.isLoading) {
        console.log('Tag generation already in progress, skipping');
        return;
      }

      console.log('Starting tag generation for folder:', result.folderId);

      setFolderTags((prev) => ({
        ...prev,
        [result.folderId]: {
          tags: prev[result.folderId]?.tags ?? [],
          isLoading: true,
          isDirty: prev[result.folderId]?.isDirty ?? false,
          isSaving: prev[result.folderId]?.isSaving ?? false,
          error: undefined,
        },
      }));

      try {
        const [metaPart, base64Part] = result.previewUrl.split(',');
        const mimeType = metaPart.split(':')[1]?.split(';')[0] ?? 'image/png';
        console.log('Generating tags with mimeType:', mimeType);

        const tags = await generateTagsForImage({ data: base64Part, mimeType }, language);
        console.log('Generated tags:', tags);

        handleFolderTagsChange(result.folderId, tags);
      } catch (error) {
        console.error('Failed to generate tags:', error);
        setFolderTags((prev) => ({
          ...prev,
          [result.folderId]: {
            tags: prev[result.folderId]?.tags ?? [],
            isLoading: false,
            isDirty: prev[result.folderId]?.isDirty ?? false,
            isSaving: prev[result.folderId]?.isSaving ?? false,
            error: error instanceof Error ? error.message : 'Tag generation failed',
          },
        }));
      }
    },
    [language, handleFolderTagsChange, libraryFolders, folderTags]
  );

  useEffect(() => {
    if (appState.status !== AppStatus.SUCCESS) {
      setExtractedColors([]);
      setIsExtractingColors(false);
      return;
    }

    const currentResult = appState.results[activeResultIndex];
    if (!currentResult) {
      return;
    }

    handleColorExtraction(currentResult.previewUrl);
  }, [appState, activeResultIndex]);

  useEffect(() => {
    console.log('Tag generation useEffect triggered');

    if (appState.status !== AppStatus.SUCCESS) {
      console.log('App state not SUCCESS, skipping tag generation');
      return;
    }

    const currentResult = appState.results[activeResultIndex];
    if (!currentResult) {
      console.log('No current result, skipping tag generation');
      return;
    }

    const folderId = currentResult.asset.groupId;
    console.log('Current result folderId:', folderId);

    if (!folderId) {
      console.log('No folderId, skipping tag generation');
      return;
    }

    // 폴더에 이미 태그가 있으면 생성하지 않음
    const existingFolder = libraryFolders.find(f => f.id === folderId);
    console.log('Existing folder check:', existingFolder);

    if (existingFolder && existingFolder.tags.length > 0) {
      console.log('Folder already has tags, skipping tag generation');
      return;
    }

    // 이미 태그 생성 중이거나 완료된 폴더는 스킵
    const currentFolderTags = folderTags[folderId];
    console.log('Current folder tags state:', currentFolderTags);

    if (currentFolderTags && (currentFolderTags.isLoading || currentFolderTags.tags.length > 0)) {
      console.log('Tag generation already in progress or completed, skipping');
      return;
    }

    console.log('All checks passed, starting tag generation');
    handleFolderTagGeneration({ previewUrl: currentResult.previewUrl, folderId });
  }, [appState, activeResultIndex, folderTags, libraryFolders]);

  const handleInitialGenerate = useCallback(async () => {
    if (!baseImage || !styleImage) {
      setAppState({ status: AppStatus.ERROR, error: t('errorUpload') });
      return;
    }

    setAppState({ status: AppStatus.LOADING });
    setExtractedColors([]);

    const messages = [t('loading1'), t('loading2'), t('loading3'), t('loading4')];
    let messageIndex = 0;
    setLoadingMessage(messages[messageIndex]);
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    loadingIntervalRef.current = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2500);

    try {
      const { data: baseImageBase64, mimeType: baseImageMimeType } = await fileToBase64(baseImage);
      const { data: styleImageBase64, mimeType: styleImageMimeType } = await fileToBase64(styleImage);

      const generatedImageBase64 = await generateNailArt(
        { data: baseImageBase64, mimeType: baseImageMimeType },
        { data: styleImageBase64, mimeType: styleImageMimeType },
        prompt,
        false,
        generationMode
      );

      const resultUrl = `data:image/png;base64,${generatedImageBase64}`;

      if (!session?.access_token) {
        throw new Error('로그인이 필요합니다.');
      }

      const backendResponse = await BackendService.generateNailArt(
        {
          prompt,
          mode: generationMode,
          generatedImage: { data: generatedImageBase64, mimeType: 'image/png' },
        },
        session.access_token
      );

      const generatedResult = mapToGeneratedResult(backendResponse.asset, resultUrl);

      setActiveGroup({ id: backendResponse.group.id, name: backendResponse.group.name });
      syncLibraryWithAsset(backendResponse.asset, backendResponse.group);
      setAppState({ status: AppStatus.SUCCESS, results: [generatedResult] });
      setActiveResultIndex(0);

      // 폴더 태그 초기화 (새 폴더인 경우만)
      const existingFolder = libraryFolders.find(f => f.id === backendResponse.group.id);
      if (!existingFolder || existingFolder.tags.length === 0) {
        setFolderTags(prev => ({
          ...prev,
          [backendResponse.group.id]: {
            tags: [],
            isLoading: false,
            isDirty: false,
            isSaving: false,
            error: undefined,
          }
        }));
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message === 'QUOTA_EXHAUSTED') {
        setModalMessage(t('errorQuota'));
        setIsModalOpen(true);
        setIsQuotaExhausted(true);
        setAppState({ status: AppStatus.IDLE });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setAppState({ status: AppStatus.ERROR, error: `${t('errorGeneric')} ${errorMessage}` });
      }
    } finally {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    }
  }, [baseImage, styleImage, prompt, generationMode, t, mapToGeneratedResult, syncLibraryWithAsset]);

  const performRegeneration = useCallback(
    async (regenerationPrompt: string) => {
      const currentResults = appState.status === AppStatus.SUCCESS ? appState.results : [];
      if (currentResults.length === 0) {
        setAppState({ status: AppStatus.ERROR, error: t('errorNoImageToRegen') });
        return;
      }

      const baseResult = currentResults[activeResultIndex];
      setAppState({ status: AppStatus.LOADING });
      setExtractedColors([]);

      const messages = [t('regenLoading1'), t('regenLoading2'), t('regenLoading3')];
      let messageIndex = 0;
      setLoadingMessage(messages[messageIndex]);
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 2500);

      try {
        const [metaPart, base64Part] = baseResult.previewUrl.split(',');
        const mimeType = metaPart.split(':')[1]?.split(';')[0] ?? 'image/png';

        const generatedImageBase64 = await generateNailArt(
          { data: base64Part, mimeType },
          null,
          regenerationPrompt,
          true
        );

        const resultUrl = `data:image/png;base64,${generatedImageBase64}`;

        if (!session?.access_token) {
          throw new Error('로그인이 필요합니다.');
        }

        const backendResponse = await BackendService.generateNailArt(
          {
            prompt: regenerationPrompt,
            mode: generationMode,
            generatedImage: { data: generatedImageBase64, mimeType },
            groupId: activeGroup?.id,
            parentAssetId: baseResult.asset.id,
          },
          session.access_token
        );

        const generatedResult = mapToGeneratedResult(backendResponse.asset, resultUrl);
        const newResults = [...currentResults, generatedResult];
        const nextIndex = newResults.length - 1;

        setActiveGroup({ id: backendResponse.group.id, name: backendResponse.group.name });
        syncLibraryWithAsset(backendResponse.asset, backendResponse.group);
        setAppState({ status: AppStatus.SUCCESS, results: newResults });
        setActiveResultIndex(nextIndex);
      } catch (error) {
        console.error(error);
        if (error instanceof Error && error.message === 'QUOTA_EXHAUSTED') {
          setModalMessage(t('errorQuota'));
          setIsModalOpen(true);
          setIsQuotaExhausted(true);
          setAppState({ status: AppStatus.SUCCESS, results: currentResults });
        } else {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          setAppState({ status: AppStatus.ERROR, error: `${t('errorRegenerate')} ${errorMessage}` });
        }
      } finally {
        if (loadingIntervalRef.current) {
          clearInterval(loadingIntervalRef.current);
        }
      }
    },
    [appState, activeResultIndex, t, activeGroup, generationMode, mapToGeneratedResult, syncLibraryWithAsset]
  );

  const handleSelectFolder = useCallback(
    async (folderId: string) => {
      if (!session?.access_token) {
        return;
      }

      setSelectedFolderId(folderId);
      setFolderDetailLoading(true);
      setFolderDetailError(null);

      // URL 변경
      const folderPath = `/library/folder/${folderId}`;
      if (typeof window !== 'undefined') {
        window.history.pushState({ tab: 'library', folderId }, '', folderPath);
      }

      try {
        const { folder, assets } = await fetchLibraryFolderDetail(session.access_token, folderId);

        setLibraryFolders((prev) => {
          const index = prev.findIndex((item) => item.id === folderId);
          if (index === -1) {
            return [folder, ...prev];
          }

          const next = [...prev];
          next[index] = {
            ...next[index],
            ...folder,
          };
          return next;
        });

        setLibraryImages((prev) => {
          const filtered = prev.filter((image) => image.folderId !== folderId);
          return [...filtered, ...assets];
        });
      } catch (error) {
        console.error('폴더 상세 조회 실패:', error);
        setFolderDetailError(error instanceof Error ? error.message : '폴더 정보를 불러오지 못했습니다.');
      } finally {
        setFolderDetailLoading(false);
      }
    },
    [session?.access_token]
  );

  const handleApplyStagedChanges = useCallback(() => {
    const { colorSwap, styleModifier, textPrompt } = stagedChanges;
    const promptParts: string[] = [];

    if (colorSwap) {
      const colorEntries = translations[language]?.colors;
      const colorKey = colorEntries
        ? (Object.keys(colorEntries) as Array<keyof typeof translations.en.colors>).find((key) => colorEntries[key] === colorSwap.to)
        : undefined;
      const englishColorName = colorKey ? translations.en.colors[colorKey] : colorSwap.to;
      promptParts.push(`Change the color '${colorSwap.from}' to '${englishColorName}'.`);
    }

    if (styleModifier) {
      const styleEntries = translations[language]?.styleModifiers;
      const styleKey = styleEntries
        ? (Object.keys(styleEntries) as Array<keyof typeof translations.en.styleModifiers>).find((key) => styleEntries[key] === styleModifier)
        : undefined;
      const englishStyleName = styleKey ? translations.en.styleModifiers[styleKey] : styleModifier;
      promptParts.push(`Apply this style effect: '${englishStyleName}'.`);
    }

    if (textPrompt.trim()) {
      promptParts.push(`Additionally, incorporate this request: "${textPrompt.trim()}".`);
    }

    if (promptParts.length === 0) {
      console.warn('No changes staged to apply.');
      return;
    }

    const combinedPrompt =
      'Apply the following changes to the nail art, keeping the overall design integrity: ' + promptParts.join(' ');

    performRegeneration(combinedPrompt);
    setStagedChanges({ colorSwap: null, styleModifier: null, textPrompt: '' });
  }, [stagedChanges, performRegeneration, language]);

  const canGenerate = Boolean(baseImage && styleImage && appState.status !== AppStatus.LOADING && !isQuotaExhausted);
  const baseImagePreview = baseImage ? URL.createObjectURL(baseImage) : null;
  const styleImagePreview = styleImage ? URL.createObjectURL(styleImage) : null;

  const baseImageUploaderTitle = generationMode === 'tryon' ? t('handPhotoTitleTryon') : t('handPhotoTitleInspiration');
  const styleImageUploaderTitle = generationMode === 'inspiration' ? t('styleImageTitleInspiration') : t('styleImageTitleTryon');
  const baseImageUploaderDescription = t('handPhotoDesc');
  const styleImageUploaderDescription =
    generationMode === 'inspiration' ? t('styleImageDescInspiration') : t('styleImageDescTryon');

  const folderDictionary = useMemo(() => {
    return Object.fromEntries(libraryFolders.map((folder) => [folder.id, folder]));
  }, [libraryFolders]);

  const resetLibraryView = useCallback(() => {
    setSelectedFolderId(null);
    setCreatePostContext({ open: false, folderId: null, imageId: null });
    setFolderDetailError(null);
  }, [setSelectedFolderId, setCreatePostContext, setFolderDetailError]);

  const navigateToTab = useCallback(
    (tab: BottomNavTab, options: { replace?: boolean } = {}) => {
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
    [resetLibraryView]
  );

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
        setFolderDetailError(null);
      } else if (nextTab !== 'library') {
        resetLibraryView();
      } else {
        // library 탭이지만 폴더 ID가 없는 경우 (라이브러리 메인)
        setSelectedFolderId(null);
        setFolderDetailError(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const initialTab = resolveTabFromLocation(window.location.pathname);
    const folderId = extractFolderIdFromPath(window.location.pathname);
    
    setActiveTab(initialTab);
    setSelectedFolderId(folderId);
    window.history.replaceState({ tab: initialTab }, '', TAB_PATHS[initialTab]);
  }, []);

  const openCreatePost = (folderId: string | null, imageId: string | null) => {
    setCreatePostContext({ open: true, folderId, imageId });
    navigateToTab('library');
  };

  const handlePublishPost = (values: { imageId: string; caption: string; visibility: 'public' | 'followers' | 'private' }) => {
    const image = libraryImages.find((item) => item.id === values.imageId);
    if (!image) {
      alert('선택한 이미지를 찾을 수 없습니다.');
      return;
    }

    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      imageUrl: image.imageUrl,
      author: {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
      },
      likes: 0,
      hasLiked: false,
      commentCount: 0,
      caption: values.caption,
    };

    setFeedPosts((prev) => [newPost, ...prev]);
    setProfile((prev) => ({ ...prev, posts: prev.posts + 1 }));
    setCreatePostContext({ open: false, folderId: null, imageId: null });
    setSelectedFolderId(null);
    navigateToTab('home');
  };

  const handleToggleFavoriteFolder = async (folderId: string) => {
    if (!session?.access_token) {
      return;
    }

    const folder = libraryFolders.find((item) => item.id === folderId);
    const nextState = folder ? !folder.isFavorite : true;

    setLibraryFolders((prev) =>
      prev.map((item) =>
        item.id === folderId ? { ...item, isFavorite: nextState } : item
      )
    );

    try {
      await toggleFavoriteFolder(session.access_token, folderId, nextState);
    } catch (error) {
      console.error('즐겨찾기 변경 실패:', error);
      setLibraryFolders((prev) =>
        prev.map((item) =>
          item.id === folderId ? { ...item, isFavorite: !nextState } : item
        )
      );
      alert('즐겨찾기를 변경하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!window.confirm('폴더를 삭제하면 포함된 이미지가 모두 삭제됩니다. 계속할까요?')) {
      return;
    }
    if (!session?.access_token) {
      return;
    }

    const snapshotFolders = libraryFolders;
    const snapshotImages = libraryImages;

    setLibraryImages((prevImages) => prevImages.filter((image) => image.folderId !== folderId));
    setLibraryFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== folderId));
    setSelectedFolderId(null);

    try {
      await deleteFolder(session.access_token, folderId);
    } catch (error) {
      console.error('폴더 삭제 실패:', error);
      setLibraryFolders(snapshotFolders);
      setLibraryImages(snapshotImages);
      alert('폴더를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('이미지를 삭제하시겠습니까?')) {
      return;
    }
    if (!session?.access_token) {
      return;
    }
    const snapshotFolders = libraryFolders;
    const snapshotImages = libraryImages;
    let removedImage: LibraryImage | undefined;
    let updatedImages: LibraryImage[] = [];

    setLibraryImages((prev) => {
      removedImage = prev.find((image) => image.id === imageId);
      updatedImages = prev.filter((image) => image.id !== imageId);
      return updatedImages;
    });

    if (removedImage) {
      setLibraryFolders((prevFolders) =>
        prevFolders.map((folder) => {
          if (folder.id !== removedImage?.folderId) {
            return folder;
          }
          const relatedImages = updatedImages
            .filter((image) => image.folderId === folder.id)
            .slice(0, 4)
            .map((image) => image.imageUrl);
          return {
            ...folder,
            imageCount: Math.max(0, folder.imageCount - 1),
            thumbnails: relatedImages,
          };
        })
      );
    }

    try {
      await deleteAsset(session.access_token, imageId);
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      alert('이미지를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.');
      setLibraryImages(snapshotImages);
      setLibraryFolders(snapshotFolders);
    }
  };

  const handleRenameFolder = async (folder: LibraryFolder) => {
    if (!session?.access_token) {
      return;
    }

    const newName = window.prompt('새 폴더 이름을 입력하세요.', folder.name)?.trim();
    if (!newName || newName === folder.name) {
      return;
    }

    const previousName = folder.name;
    setLibraryFolders((prev) =>
      prev.map((item) => (item.id === folder.id ? { ...item, name: newName } : item))
    );

    try {
      await updateFolder(session.access_token, folder.id, { name: newName });
    } catch (error) {
      console.error('폴더 이름 변경 실패:', error);
      setLibraryFolders((prev) =>
        prev.map((item) => (item.id === folder.id ? { ...item, name: previousName } : item))
      );
      alert('폴더 이름을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleEditFolderTags = async (folder: LibraryFolder) => {
    if (!session?.access_token) {
      return;
    }

    const raw = window.prompt('태그를 쉼표(,)로 구분하여 입력하세요.', folder.tags.join(', '));
    if (raw === null) {
      return;
    }

    const parsed = raw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const previousTags = folder.tags;
    setLibraryFolders((prev) =>
      prev.map((item) => (item.id === folder.id ? { ...item, tags: parsed } : item))
    );

    try {
      await updateFolder(session.access_token, folder.id, { tags: parsed });
    } catch (error) {
      console.error('폴더 태그 변경 실패:', error);
      setLibraryFolders((prev) =>
        prev.map((item) => (item.id === folder.id ? { ...item, tags: previousTags } : item))
      );
      alert('폴더 태그를 수정하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleRenameImage = async (image: LibraryImage) => {
    if (!session?.access_token) {
      return;
    }

    const newName = window.prompt('새 이미지 이름을 입력하세요.', image.name)?.trim();
    if (!newName || newName === image.name) {
      return;
    }

    const previousName = image.name;
    setLibraryImages((prev) =>
      prev.map((item) => (item.id === image.id ? { ...item, name: newName } : item))
    );

    try {
      await updateAsset(session.access_token, image.id, { name: newName });
    } catch (error) {
      console.error('이미지 이름 수정 실패:', error);
      setLibraryImages((prev) =>
        prev.map((item) => (item.id === image.id ? { ...item, name: previousName } : item))
      );
      alert('이미지 이름을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };


  const handlePrivacyToggle = () => {
    setProfile((prev) => ({ ...prev, isPrivate: !prev.isPrivate }));
  };

  const handleLikeToggle = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              hasLiked: !post.hasLiked,
              likes: post.hasLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
            }
          : post
      )
    );
  };

  const renderGeneratorView = () => {
    const activeResult = appState.status === AppStatus.SUCCESS ? appState.results[activeResultIndex] : null;
    const activeFolderId = activeResult?.asset.groupId;
    const activeFolderTagsState = activeFolderId ? folderTags[activeFolderId] : undefined;
    const existingFolder = activeFolderId ? libraryFolders.find(f => f.id === activeFolderId) : null;

    console.log('renderGeneratorView debug:', {
      activeResult: !!activeResult,
      activeFolderId,
      activeFolderTagsState,
      existingFolder: !!existingFolder,
      existingFolderTags: existingFolder?.tags,
    });

    // 폴더 태그 우선, 없으면 기존 폴더 태그, 마지막으로 빈 배열
    const activeTags = activeFolderTagsState?.tags ?? existingFolder?.tags ?? [];
    const activeTagsLoading = activeFolderTagsState?.isLoading ?? false;
    const activeTagsDirty = activeFolderTagsState?.isDirty ?? false;
    const activeTagsSaving = activeFolderTagsState?.isSaving ?? false;
    const activeTagsError = activeFolderTagsState?.error ?? null;

    console.log('Tags display state:', {
      activeTags,
      activeTagsLoading,
      activeTagsDirty,
      activeTagsSaving,
      activeTagsError,
    });

    return (
      <div className="pb-24">
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm md:p-10">
          <InspirationCarousel />

          <div className="mb-8">
            <h2 className="mb-3 block text-center text-base font-medium text-gray-700">{t('generationMode')}</h2>
            <div className="mx-auto flex max-w-xs justify-center rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setGenerationMode('inspiration')}
                disabled={isQuotaExhausted}
                className={`w-1/2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                  generationMode === 'inspiration' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('inspirationMode')}
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode('tryon')}
                disabled={isQuotaExhausted}
                className={`w-1/2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                  generationMode === 'tryon' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('tryonMode')}
              </button>
            </div>
            <p className="mt-3 px-4 text-center text-xs text-gray-500">
              {generationMode === 'inspiration' ? t('inspirationModeDesc') : t('tryonModeDesc')}
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
            <ImageUploader
              title={baseImageUploaderTitle}
              description={baseImageUploaderDescription}
              onFileSelect={setBaseImage}
              previewUrl={baseImagePreview}
              disabled={isQuotaExhausted}
            />
            <ImageUploader
              title={styleImageUploaderTitle}
              description={styleImageUploaderDescription}
              onFileSelect={setStyleImage}
              previewUrl={styleImagePreview}
              disabled={isQuotaExhausted}
            />
          </div>

          {generationMode === 'inspiration' && (
            <div className="mb-8">
              <label htmlFor="prompt" className="mb-2 block text-base font-medium text-gray-700">
                {t('promptLabel')}
              </label>
              <input
                id="prompt"
                type="text"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={t('promptPlaceholder')}
                className="w-full rounded-md border border-slate-300 bg-slate-50 px-4 py-2 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-200"
                disabled={isQuotaExhausted}
              />
            </div>
          )}

          <div className="mb-8 text-center">
            <button
              type="button"
              onClick={handleInitialGenerate}
              disabled={!canGenerate}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 font-semibold text-white transition ${
                canGenerate ? 'bg-gray-900 hover:bg-gray-700' : 'cursor-not-allowed bg-gray-400'
              }`}
            >
              <SparklesIcon />
              {appState.status === AppStatus.LOADING ? t('generatingButton') : t('generateButton')}
            </button>
          </div>

          {appState.status === AppStatus.ERROR && (
            <div className="mb-6 rounded-lg border border-red-400 bg-red-100 p-3 text-center text-red-600">
              {appState.error}
            </div>
          )}

          <ResultDisplay
            appState={appState}
            isQuotaExhausted={isQuotaExhausted}
            loadingMessage={loadingMessage}
            extractedColors={extractedColors}
            isExtractingColors={isExtractingColors}
            stagedChanges={stagedChanges}
            setStagedChanges={setStagedChanges}
            onApplyChanges={handleApplyStagedChanges}
            activeResultIndex={activeResultIndex}
            onSelectResult={setActiveResultIndex}
            tags={activeTags}
            isGeneratingTags={activeTagsLoading}
            isDirty={activeTagsDirty}
            isSavingTags={activeTagsSaving}
            saveError={activeTagsError}
            onTagsChange={(newTags) => {
              if (!activeFolderId) return;
              handleFolderTagsChange(activeFolderId, newTags);
            }}
            onSaveTags={() => {
              if (!activeFolderId) return;
              void handleSaveFolderTags(activeFolderId);
            }}
          />
        </div>
      </main>
    </div>
    );
  };

  const imagesForCreatePost = useMemo(() => {
    return libraryImages.map((image) => ({
      ...image,
      folderName: folderDictionary[image.folderId]?.name ?? 'Unnamed',
    }));
  }, [libraryImages, folderDictionary]);

  const selectedFolder = selectedFolderId ? folderDictionary[selectedFolderId] : null;
  const folderImages = selectedFolderId
    ? libraryImages.filter((image) => image.folderId === selectedFolderId)
    : [];

  // 로딩 중일 때
  if (authLoading) {
    console.log('🔄 App 로딩 중:', { user: !!user, session: !!session, loading: authLoading });
    return (
      <div className="min-h-screen font-sans text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // OAuth 콜백 처리 - URL에 code가 있으면 홈피드로 리다이렉트
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
      console.log('🔄 OAuth 콜백 감지, 홈피드로 리다이렉트');
      // URL에서 code 파라미터 제거하고 홈피드로 리다이렉트
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, '', '/home');
    }
  }, []);

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-800">
      <Header />

      {activeTab === 'home' && (
        <HomeFeed
          posts={feedPosts}
          onPostClick={(post) => setSelectedPost(post)}
          onUserClick={() => navigateToTab('profile')}
          onLikeToggle={handleLikeToggle}
        />
      )}

      {activeTab === 'create' && renderGeneratorView()}

      {activeTab === 'library' && !createPostContext.open && !selectedFolder && (
        <LibraryView
          folders={libraryFolders}
          onSelectFolder={handleSelectFolder}
          onToggleFavorite={handleToggleFavoriteFolder}
          onPostFolder={(folderId) => openCreatePost(folderId, null)}
          isLoading={libraryLoading}
          emptyMessage="아직 생성한 폴더가 없습니다. 첫 이미지를 생성해보세요."
          errorMessage={libraryError}
        />
      )}

      {activeTab === 'library' && selectedFolder && !createPostContext.open && (
        folderDetailLoading ? (
          <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-gray-500">
            폴더를 불러오는 중입니다...
          </div>
        ) : folderDetailError ? (
          <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-rose-600">
            {folderDetailError}
          </div>
        ) : (
          <FolderDetailView
            folderName={selectedFolder.name}
            createdAt={selectedFolder.createdAt}
            tags={selectedFolder.tags}
            images={folderImages}
            onBack={() => {
              setSelectedFolderId(null);
              setFolderDetailError(null);
              // URL을 라이브러리 메인으로 변경
              if (typeof window !== 'undefined') {
                window.history.pushState({ tab: 'library' }, '', '/library');
              }
            }}
            onDeleteFolder={() => handleDeleteFolder(selectedFolder.id)}
            onRenameFolder={() => handleRenameFolder(selectedFolder)}
            onUpdateTags={() => handleEditFolderTags(selectedFolder)}
            onShareImage={(imageId) => openCreatePost(selectedFolder.id, imageId)}
            onDeleteImage={handleDeleteImage}
            onRenameImage={handleRenameImage}
          />
        )
      )}

      {activeTab === 'library' && createPostContext.open && (
        <CreatePost
          libraryImages={imagesForCreatePost.filter((image) =>
            createPostContext.folderId ? image.folderId === createPostContext.folderId : true
          )}
          initialImageId={createPostContext.imageId}
          onPublish={handlePublishPost}
          onCancel={() => setCreatePostContext({ open: false, folderId: null, imageId: null })}
        />
      )}

      {activeTab === 'profile' && (
        <UserProfile
          profile={profile}
          posts={feedPosts.filter((post) => post.author.id === profile.id)}
          onPostClick={(post) => setSelectedPost(post)}
          onPrivacyToggle={handlePrivacyToggle}
        />
      )}

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          navigateToTab(tab);
        }}
      />

      <PostDetailModal
        isOpen={Boolean(selectedPost)}
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onLikeToggle={handleLikeToggle}
      />

      <ErrorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} message={modalMessage} />
      
      <DebugPanel />
    </div>
  );
};

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
