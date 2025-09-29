import { useState, useCallback, useRef, useEffect } from 'react';
import { fileToBase64 } from '../utils/fileUtils';
import { generateNailArt, extractDominantColors, generateTagsForImage } from '../services/geminiService';
import { BackendService, UploadedAsset } from '../services/backendService';
import { useTranslations } from './useTranslations';
import { translations } from '../lib/i18n/translations';
import type { AppState, GenerationMode, StagedChanges, GeneratedResult, LibraryFolder } from '../types';
import { AppStatus } from '../types';

export function useGenerator(
  session: any,
  libraryFolders: LibraryFolder[],
  setLibraryFolders: any,
  setLibraryImages: any,
  setActiveGroup: any,
  setFolderTags: any,
  activeGroup: { id: string; name: string } | null
) {
  const { t, language } = useTranslations();

  // Generator states
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

  const loadingIntervalRef = useRef<number | null>(null);

  // Cleanup interval on unmount
  useEffect(
    () => () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    },
    []
  );

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
    let isNewAsset = false;

    setLibraryImages((prev: any[]) => {
      const exists = prev.some((image) => image.id === asset.id);
      isNewAsset = !exists;
      const withoutCurrent = prev.filter((image) => image.id !== asset.id);
      const mapped = {
        id: asset.id,
        folderId: asset.groupId,
        imageUrl: asset.imageUrl,
        name: asset.name,
        createdAt: createdAt,
        tags: asset.tags ?? [],
        storagePath: asset.storagePath,
        parentAssetId: asset.parentAssetId ?? null,
      };
      return [mapped, ...withoutCurrent];
    });

    setLibraryFolders((prev: any[]) => {
      const index = prev.findIndex((folder) => folder.id === groupInfo.id);

      if (index === -1) {
        const newFolder = {
          id: groupInfo.id,
          name: groupInfo.name,
          description: null,
          createdAt: createdAt,
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
  }, [setLibraryImages, setLibraryFolders]);

  const mapToGeneratedResult = useCallback((asset: UploadedAsset, previewUrl: string): GeneratedResult => ({
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
  }), []);

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
        setFolderTags((prev: any) => ({
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
  }, [baseImage, styleImage, prompt, generationMode, t, mapToGeneratedResult, syncLibraryWithAsset, session?.access_token, libraryFolders, setFolderTags]);

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
            groupId: baseResult.asset.groupId,
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
    [appState, activeResultIndex, t, generationMode, mapToGeneratedResult, syncLibraryWithAsset, session?.access_token]
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

  return {
    // States
    baseImage,
    setBaseImage,
    styleImage,
    setStyleImage,
    prompt,
    setPrompt,
    appState,
    setAppState,
    isModalOpen,
    setIsModalOpen,
    modalMessage,
    setModalMessage,
    isQuotaExhausted,
    setIsQuotaExhausted,
    loadingMessage,
    setLoadingMessage,
    generationMode,
    setGenerationMode,
    extractedColors,
    setExtractedColors,
    isExtractingColors,
    setIsExtractingColors,
    stagedChanges,
    setStagedChanges,
    activeResultIndex,
    setActiveResultIndex,
    activeGroup,

    // Computed values
    canGenerate,
    baseImagePreview,
    styleImagePreview,
    baseImageUploaderTitle,
    styleImageUploaderTitle,
    baseImageUploaderDescription,
    styleImageUploaderDescription,

    // Functions
    handleColorExtraction,
    handleInitialGenerate,
    performRegeneration,
    handleApplyStagedChanges,
  };
}
