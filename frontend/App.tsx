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
import { BackendService, UploadedAsset } from './services/backendService';
import {
  fetchLibraryFolders,
  fetchLibraryFolderDetail,
  toggleFavoriteFolder,
  deleteFolder,
  deleteAsset,
  updateFolder,
  updateAsset,
} from './services/libraryService';
import type {
  AppState,
  GenerationMode,
  StagedChanges,
  FeedPost,
  LibraryFolder,
  LibraryImage,
  ProfileSummary,
  GeneratedResult,
} from './types';
import { AppStatus } from './types';
import { useTranslations } from './hooks/useTranslations';
import { translations } from './lib/i18n/translations';
import { AuthProvider, useAuth } from './src/context/AuthContext';

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
  const [tagsByResult, setTagsByResult] = useState<Record<string, {
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
    const createdDate = createdAt.slice(0, 10);
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
        createdAt: createdDate,
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
          createdAt: createdDate,
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

  const handleTagsChange = useCallback((assetId: string, newTags: string[]) => {
    setTagsByResult((prev) => ({
      ...prev,
      [assetId]: {
        tags: newTags,
        isLoading: false,
        isDirty: true,
        isSaving: false,
        error: undefined,
      },
    }));

    setAppState((prevState) => {
      if (prevState.status !== AppStatus.SUCCESS) {
        return prevState;
      }

      const updatedResults = prevState.results.map((result) =>
        result.asset.id === assetId
          ? { ...result, asset: { ...result.asset, tags: newTags } }
          : result
      );

      return { ...prevState, results: updatedResults };
    });
  }, []);

  const handleSaveTags = useCallback(
    async (assetId: string) => {
      const entry = tagsByResult[assetId];
      if (!entry) {
        return;
      }

      if (!session?.access_token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const nextTags = entry.tags;
      const previousImages = libraryImages;
      const previousFolders = libraryFolders;
      const previousResultTags = (() => {
        if (appState.status !== AppStatus.SUCCESS) {
          return [] as string[];
        }
        const result = appState.results.find((item) => item.asset.id === assetId);
        return result?.asset.tags ?? [];
      })();
      const targetImage = libraryImages.find((image) => image.id === assetId);
      const folderId = targetImage?.folderId ?? null;

      setTagsByResult((prev) => ({
        ...prev,
        [assetId]: {
          ...prev[assetId],
          isSaving: true,
          error: undefined,
        },
      }));

      try {
        await updateAsset(session.access_token, assetId, { tags: nextTags });

        setTagsByResult((prev) => ({
          ...prev,
          [assetId]: {
            ...prev[assetId],
            isSaving: false,
            isDirty: false,
            error: undefined,
          },
        }));

        setAppState((prevState) => {
          if (prevState.status !== AppStatus.SUCCESS) {
            return prevState;
          }

          const updatedResults = prevState.results.map((result) =>
            result.asset.id === assetId
              ? { ...result, asset: { ...result.asset, tags: nextTags } }
              : result
          );

          return { ...prevState, results: updatedResults };
        });

        let updatedImages: LibraryImage[] = [];
        setLibraryImages((prev) => {
          const next = prev.map((image) =>
            image.id === assetId ? { ...image, tags: nextTags } : image
          );
          updatedImages = next;
          return next;
        });

        if (folderId) {
          const aggregatedTags = Array.from(
            new Set(
              updatedImages
                .filter((image) => image.folderId === folderId)
                .flatMap((image) => image.tags)
            )
          );

          setLibraryFolders((prev) =>
            prev.map((folder) =>
              folder.id === folderId ? { ...folder, tags: aggregatedTags } : folder
            )
          );
        }
      } catch (error) {
        console.error('태그 저장 실패:', error);
        const message = error instanceof Error ? error.message : '태그를 저장하지 못했습니다.';

        setTagsByResult((prev) => ({
          ...prev,
          [assetId]: {
            ...prev[assetId],
            isSaving: false,
            isDirty: true,
            error: message,
          },
        }));

        setAppState((prevState) => {
          if (prevState.status !== AppStatus.SUCCESS) {
            return prevState;
          }

          const updatedResults = prevState.results.map((result) =>
            result.asset.id === assetId
              ? { ...result, asset: { ...result.asset, tags: previousResultTags } }
              : result
          );

          return { ...prevState, results: updatedResults };
        });

        setLibraryImages(previousImages);
        setLibraryFolders(previousFolders);
      }
    },
    [appState, libraryImages, libraryFolders, session?.access_token, tagsByResult]
  );

  const handleTagGeneration = useCallback(
    async (result: { previewUrl: string; assetId: string }) => {
      setTagsByResult((prev) => ({
        ...prev,
        [result.assetId]: {
          tags: prev[result.assetId]?.tags ?? [],
          isLoading: true,
          isDirty: prev[result.assetId]?.isDirty ?? false,
          isSaving: prev[result.assetId]?.isSaving ?? false,
          error: undefined,
        },
      }));

      try {
        const [metaPart, base64Part] = result.previewUrl.split(',');
        const mimeType = metaPart.split(':')[1]?.split(';')[0] ?? 'image/png';
        const tags = await generateTagsForImage({ data: base64Part, mimeType }, language);
        handleTagsChange(result.assetId, tags);
      } catch (error) {
        console.error('Failed to generate tags:', error);
        setTagsByResult((prev) => ({
          ...prev,
          [result.assetId]: {
            tags: prev[result.assetId]?.tags ?? [],
            isLoading: false,
            isDirty: prev[result.assetId]?.isDirty ?? false,
            isSaving: prev[result.assetId]?.isSaving ?? false,
            error: prev[result.assetId]?.error,
          },
        }));
      }
    },
    [language, handleTagsChange]
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
  }, [appState, activeResultIndex, handleColorExtraction]);

  useEffect(() => {
    if (appState.status !== AppStatus.SUCCESS) {
      return;
    }

    const currentResult = appState.results[activeResultIndex];
    if (!currentResult) {
      return;
    }

    const assetId = currentResult.asset.id;
    if (tagsByResult[assetId]) {
      return;
    }

    handleTagGeneration({ previewUrl: currentResult.previewUrl, assetId });
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

  const handleEditImageTags = async (image: LibraryImage) => {
    if (!session?.access_token) {
      return;
    }

    const raw = window.prompt('태그를 쉼표(,)로 구분하여 입력하세요.', image.tags.join(', '));
    if (raw === null) {
      return;
    }

    const parsed = raw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const previousTags = image.tags;
    const previousFolder = libraryFolders.find((folder) => folder.id === image.folderId);
    const previousFolderTags = previousFolder?.tags ?? [];
    setTagsByResult((prev) => ({
      ...prev,
      [image.id]: {
        tags: parsed,
        isLoading: false,
        isDirty: false,
        isSaving: false,
        error: undefined,
      },
    }));
    let updatedImages: LibraryImage[] = [];
    setLibraryImages((prev) => {
      const next = prev.map((item) => (item.id === image.id ? { ...item, tags: parsed } : item));
      updatedImages = next;
      return next;
    });

    setLibraryFolders((prev) =>
      prev.map((folder) => {
        if (folder.id !== image.folderId) {
          return folder;
        }
        const aggregatedTags = Array.from(
          new Set(
            updatedImages
              .filter((item) => item.folderId === image.folderId)
              .flatMap((item) => item.tags)
          )
        );
        return { ...folder, tags: aggregatedTags };
      })
    );

    try {
      await updateAsset(session.access_token, image.id, { tags: parsed });
    } catch (error) {
      console.error('이미지 태그 수정 실패:', error);
      setTagsByResult((prev) => ({
        ...prev,
        [image.id]: {
          tags: previousTags,
          isLoading: false,
          isDirty: false,
          isSaving: false,
          error: undefined,
        },
      }));
      setLibraryImages((prev) =>
        prev.map((item) => (item.id === image.id ? { ...item, tags: previousTags } : item))
      );
      setLibraryFolders((prev) =>
        prev.map((folder) =>
          folder.id === image.folderId ? { ...folder, tags: previousFolderTags } : folder
        )
      );
      alert('이미지 태그를 수정하지 못했습니다. 잠시 후 다시 시도해주세요.');
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
    const activeTagsState = activeResult ? tagsByResult[activeResult.asset.id] : undefined;
    const activeTags = activeTagsState?.tags ?? activeResult?.asset.tags ?? [];
    const activeTagsLoading = activeTagsState?.isLoading ?? false;
    const activeTagsDirty = activeTagsState?.isDirty ?? false;
    const activeTagsSaving = activeTagsState?.isSaving ?? false;
    const activeTagsError = activeTagsState?.error ?? null;

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
              if (!activeResult) return;
              handleTagsChange(activeResult.asset.id, newTags);
            }}
            onSaveTags={() => {
              if (!activeResult) return;
              void handleSaveTags(activeResult.asset.id);
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
            }}
            onDeleteFolder={() => handleDeleteFolder(selectedFolder.id)}
            onRenameFolder={() => handleRenameFolder(selectedFolder)}
            onUpdateTags={() => handleEditFolderTags(selectedFolder)}
            onShareImage={(imageId) => openCreatePost(selectedFolder.id, imageId)}
            onDeleteImage={handleDeleteImage}
            onRenameImage={handleRenameImage}
            onEditImageTags={handleEditImageTags}
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
