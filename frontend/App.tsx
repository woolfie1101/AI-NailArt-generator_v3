import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import ErrorModal from './components/ErrorModal';
import Footer from './components/Footer';
import ImageUploader from './components/ImageUploader';
import InspirationCarousel from './components/InspirationCarousel';
import ResultDisplay from './components/ResultDisplay';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { BottomNavigation, BottomNavTab } from './components/navigation/BottomNavigation';
import { HomeFeed } from './components/social/HomeFeed';
import { PostDetailModal } from './components/social/PostDetailModal';
import { UserProfile } from './components/social/UserProfile';
import { CreatePost } from './components/social/CreatePost';
import { LibraryView } from './components/library/LibraryView';
import { FolderDetailView } from './components/library/FolderDetailView';
import { fileToBase64 } from './utils/fileUtils';
import { generateNailArt, extractDominantColors, generateTagsForImage } from './services/geminiService';
import type {
  AppState,
  GenerationMode,
  StagedChanges,
  FeedPost,
  LibraryFolder,
  LibraryImage,
  ProfileSummary,
} from './types';
import { AppStatus } from './types';
import { useTranslations } from './hooks/useTranslations';
import { translations } from './lib/i18n/translations';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const SAMPLE_LIBRARY_FOLDERS: LibraryFolder[] = [
  {
    id: 'folder-1',
    name: '2025-09-27_가을 무드',
    createdAt: '2025-09-27',
    imageCount: 2,
    tags: ['가을', '홀로그램', '우아한'],
    isFavorite: true,
    thumbnails: [
      'https://images.unsplash.com/photo-1667877610066-18221c560e30?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1699997760248-71ac169e640e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1599472308689-1b0d452886b7?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1673252413885-a3d44c339621?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 'folder-2',
    name: '여름 글리터',
    createdAt: '2025-08-18',
    imageCount: 2,
    tags: ['여름', '글리터', '파티'],
    isFavorite: false,
    thumbnails: [
      'https://images.unsplash.com/photo-1674383600495-bfa0405f3c93?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1611821828952-3453ba0f9408?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1673252413885-a3d44c339621?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 'folder-3',
    name: '미니멀 시리즈',
    createdAt: '2025-07-05',
    imageCount: 1,
    tags: ['미니멀', '모던'],
    isFavorite: true,
    thumbnails: [
      'https://images.unsplash.com/photo-1599316329891-19df7fa9580d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1599472308689-1b0d452886b7?auto=format&fit=crop&w=400&q=80',
    ],
  },
];

const SAMPLE_LIBRARY_IMAGES: LibraryImage[] = [
  {
    id: 'img-1',
    folderId: 'folder-1',
    imageUrl: 'https://images.unsplash.com/photo-1667877610066-18221c560e30?auto=format&fit=crop&w=800&q=80',
    name: '2025-09-27_01',
    createdAt: '2025-09-27',
    tags: ['가을', '홀로그램'],
  },
  {
    id: 'img-2',
    folderId: 'folder-1',
    imageUrl: 'https://images.unsplash.com/photo-1699997760248-71ac169e640e?auto=format&fit=crop&w=800&q=80',
    name: '2025-09-27_02',
    createdAt: '2025-09-27',
    tags: ['가을', '반짝임'],
  },
  {
    id: 'img-3',
    folderId: 'folder-2',
    imageUrl: 'https://images.unsplash.com/photo-1674383600495-bfa0405f3c93?auto=format&fit=crop&w=800&q=80',
    name: '2025-08-18_01',
    createdAt: '2025-08-18',
    tags: ['여름', '글리터'],
  },
  {
    id: 'img-4',
    folderId: 'folder-2',
    imageUrl: 'https://images.unsplash.com/photo-1611821828952-3453ba0f9408?auto=format&fit=crop&w=800&q=80',
    name: '2025-08-18_02',
    createdAt: '2025-08-18',
    tags: ['여름', '옴브레'],
  },
  {
    id: 'img-5',
    folderId: 'folder-3',
    imageUrl: 'https://images.unsplash.com/photo-1599316329891-19df7fa9580d?auto=format&fit=crop&w=800&q=80',
    name: '2025-07-05_01',
    createdAt: '2025-07-05',
    tags: ['미니멀'],
  },
];

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

const AppContent: React.FC = () => {
  const { t, language } = useTranslations();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(SAMPLE_FEED_POSTS);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [profile, setProfile] = useState<ProfileSummary>(SAMPLE_PROFILE);
  const [libraryFolders, setLibraryFolders] = useState<LibraryFolder[]>(SAMPLE_LIBRARY_FOLDERS);
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>(SAMPLE_LIBRARY_IMAGES);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [createPostContext, setCreatePostContext] = useState<{ open: boolean; folderId: string | null; imageId: string | null }>({ open: false, folderId: null, imageId: null });

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
  const [tagsByResult, setTagsByResult] = useState<Record<number, { tags: string[]; isLoading: boolean }>>({});
  const loadingIntervalRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    },
    []
  );

  const handleColorExtraction = useCallback(async (resultImage: string) => {
    setIsExtractingColors(true);
    setExtractedColors([]);
    try {
      const [metaPart, base64Part] = resultImage.split(',');
      const mimeType = metaPart.split(':')[1]?.split(';')[0] ?? 'image/png';
      const colors = await extractDominantColors({ data: base64Part, mimeType });
      setExtractedColors(colors);
    } catch (error) {
      console.error('Failed to extract colors:', error);
    } finally {
      setIsExtractingColors(false);
    }
  }, []);

  const handleTagGeneration = useCallback(
    async (resultImage: string, index: number) => {
      setTagsByResult((prev) => ({
        ...prev,
        [index]: { tags: prev[index]?.tags ?? [], isLoading: true },
      }));

      try {
        const [metaPart, base64Part] = resultImage.split(',');
        const mimeType = metaPart.split(':')[1]?.split(';')[0] ?? 'image/png';
        const tags = await generateTagsForImage({ data: base64Part, mimeType }, language);

        setTagsByResult((prev) => ({
          ...prev,
          [index]: { tags, isLoading: false },
        }));
      } catch (error) {
        console.error('Failed to generate tags:', error);
        setTagsByResult((prev) => ({
          ...prev,
          [index]: { tags: prev[index]?.tags ?? [], isLoading: false },
        }));
      }
    },
    [language]
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

    handleColorExtraction(currentResult);
  }, [appState, activeResultIndex, handleColorExtraction]);

  useEffect(() => {
    if (appState.status !== AppStatus.SUCCESS) {
      return;
    }

    const currentResult = appState.results[activeResultIndex];
    if (!currentResult || tagsByResult[activeResultIndex]) {
      return;
    }

    handleTagGeneration(currentResult, activeResultIndex);
  }, [appState, activeResultIndex, handleTagGeneration, tagsByResult]);

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
      setAppState({ status: AppStatus.SUCCESS, results: [resultUrl] });
      setActiveResultIndex(0);
      setTagsByResult({});
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
  }, [baseImage, styleImage, prompt, generationMode, t]);

  const performRegeneration = useCallback(
    async (regenerationPrompt: string) => {
      const currentResults = appState.status === AppStatus.SUCCESS ? appState.results : [];
      if (currentResults.length === 0) {
        setAppState({ status: AppStatus.ERROR, error: t('errorNoImageToRegen') });
        return;
      }

      const baseImageToRegen = currentResults[activeResultIndex];
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
        const [metaPart, base64Part] = baseImageToRegen.split(',');
        const mimeType = metaPart.split(':')[1]?.split(';')[0] ?? 'image/png';

        const generatedImageBase64 = await generateNailArt(
          { data: base64Part, mimeType },
          null,
          regenerationPrompt,
          true
        );

        const resultUrl = `data:image/png;base64,${generatedImageBase64}`;
        const newResults = [...currentResults, resultUrl];
        const nextIndex = newResults.length - 1;

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
    [appState, activeResultIndex, t]
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

  const rebuildFolders = useCallback(
    (images: LibraryImage[], folders: LibraryFolder[]): LibraryFolder[] => {
      return folders.map((folder) => {
        const related = images.filter((image) => image.folderId === folder.id);
        return {
          ...folder,
          imageCount: related.length,
          thumbnails: related.slice(0, 4).map((image) => image.imageUrl),
        };
      });
    },
    []
  );

  useEffect(() => {
    setLibraryFolders((prev) => rebuildFolders(libraryImages, prev));
  }, [libraryImages, rebuildFolders]);

  const openCreatePost = (folderId: string | null, imageId: string | null) => {
    setCreatePostContext({ open: true, folderId, imageId });
    setActiveTab('library');
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
    setActiveTab('home');
  };

  const handleToggleFavoriteFolder = (folderId: string) => {
    setLibraryFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, isFavorite: !folder.isFavorite } : folder
      )
    );
  };

  const handleDeleteFolder = (folderId: string) => {
    if (!window.confirm('폴더를 삭제하면 포함된 이미지가 모두 삭제됩니다. 계속할까요?')) {
      return;
    }
    setLibraryImages((prevImages) => {
      const updatedImages = prevImages.filter((image) => image.folderId !== folderId);
      setLibraryFolders((prevFolders) =>
        rebuildFolders(
          updatedImages,
          prevFolders.filter((folder) => folder.id !== folderId)
        )
      );
      return updatedImages;
    });
    setSelectedFolderId(null);
  };

  const handleDeleteImage = (imageId: string) => {
    if (!window.confirm('이미지를 삭제하시겠습니까?')) {
      return;
    }
    setLibraryImages((prev) => {
      const updated = prev.filter((image) => image.id !== imageId);
      setLibraryFolders((folders) => rebuildFolders(updated, folders));
      return updated;
    });
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

  const renderGeneratorView = () => (
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
            tags={tagsByResult[activeResultIndex]?.tags ?? []}
            isGeneratingTags={tagsByResult[activeResultIndex]?.isLoading ?? false}
            onTagsChange={(newTags) => {
              setTagsByResult((prev) => ({
                ...prev,
                [activeResultIndex]: {
                  ...(prev[activeResultIndex] ?? { isLoading: false }),
                  tags: newTags,
                },
              }));
            }}
          />
        </div>
      </main>
    </div>
  );

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

  if (authLoading) {
    return (
      <div className="min-h-screen font-sans text-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl text-center text-gray-600">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen font-sans text-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <LandingPage />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-800">
      <Header />

      {activeTab === 'home' && (
        <HomeFeed
          posts={feedPosts}
          onPostClick={(post) => setSelectedPost(post)}
          onUserClick={() => setActiveTab('profile')}
          onLikeToggle={handleLikeToggle}
        />
      )}

      {activeTab === 'create' && renderGeneratorView()}

      {activeTab === 'library' && !createPostContext.open && !selectedFolder && (
        <LibraryView
          folders={libraryFolders}
          onSelectFolder={(folderId) => setSelectedFolderId(folderId)}
          onToggleFavorite={handleToggleFavoriteFolder}
          onPostFolder={(folderId) => openCreatePost(folderId, null)}
        />
      )}

      {activeTab === 'library' && selectedFolder && !createPostContext.open && (
        <FolderDetailView
          folderName={selectedFolder.name}
          createdAt={selectedFolder.createdAt}
          tags={selectedFolder.tags}
          images={folderImages}
          onBack={() => setSelectedFolderId(null)}
          onDeleteFolder={() => handleDeleteFolder(selectedFolder.id)}
          onRenameFolder={() => alert('폴더 이름 변경 기능은 추후 연결될 예정입니다.')}
          onUpdateTags={() => alert('태그 편집 기능은 추후 연결될 예정입니다.')}
          onShareImage={(imageId) => openCreatePost(selectedFolder.id, imageId)}
          onDeleteImage={handleDeleteImage}
        />
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

      <BottomNavigation activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab !== 'library') {
          setSelectedFolderId(null);
          setCreatePostContext({ open: false, folderId: null, imageId: null });
        }
      }} />

      <PostDetailModal
        isOpen={Boolean(selectedPost)}
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onLikeToggle={handleLikeToggle}
      />

      <ErrorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} message={modalMessage} />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
