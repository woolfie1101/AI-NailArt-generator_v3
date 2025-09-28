import { useCallback, useState } from 'react';
import type { LibraryFolder, LibraryImage } from '../types';
import { fetchLibraryFolders, toggleFavoriteFolder, deleteFolder, updateFolder, fetchLibraryFolderDetail, deleteAsset, updateAsset } from '../services/libraryService';

interface UseLibraryOptions {
  accessToken?: string;
}

export function useLibrary({ accessToken }: UseLibraryOptions) {
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingFolderDetail, setLoadingFolderDetail] = useState(false);
  const [errorFolders, setErrorFolders] = useState<string | null>(null);
  const [errorFolderDetail, setErrorFolderDetail] = useState<string | null>(null);

  const loadFolders = useCallback(async () => {
    if (!accessToken) {
      setFolders([]);
      setImages([]);
      setSelectedFolderId(null);
      setLoadingFolders(false);
      setErrorFolders(null);
      return;
    }

    setLoadingFolders(true);
    setErrorFolders(null);

    try {
      const result = await fetchLibraryFolders(accessToken);
      setFolders(result);
      setImages((prev) => prev.filter((image) => result.some((folder) => folder.id === image.folderId)));
    } catch (error) {
      console.error('라이브러리 목록 조회 실패:', error);
      setErrorFolders(error instanceof Error ? error.message : '라이브러리를 불러오지 못했습니다.');
    } finally {
      setLoadingFolders(false);
    }
  }, [accessToken]);

  const loadFolderDetail = useCallback(
    async (folderId: string) => {
      if (!accessToken) {
        return;
      }

      setSelectedFolderId(folderId);
      setLoadingFolderDetail(true);
      setErrorFolderDetail(null);

      try {
        const { folder, assets } = await fetchLibraryFolderDetail(accessToken, folderId);

        setFolders((prev) => {
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

        setImages((prev) => {
          const filtered = prev.filter((image) => image.folderId !== folderId);
          return [...filtered, ...assets];
        });
      } catch (error) {
        console.error('폴더 상세 조회 실패:', error);
        setErrorFolderDetail(error instanceof Error ? error.message : '폴더 정보를 불러오지 못했습니다.');
      } finally {
        setLoadingFolderDetail(false);
      }
    },
    [accessToken]
  );

  const handleToggleFavorite = useCallback(
    async (folderId: string) => {
      if (!accessToken) return;

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId ? { ...folder, isFavorite: !folder.isFavorite } : folder
        )
      );

      try {
        await toggleFavoriteFolder(accessToken, folderId);
      } catch (error) {
        console.error('즐겨찾기 토글 실패:', error);
        // revert
        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === folderId ? { ...folder, isFavorite: !folder.isFavorite } : folder
          )
        );
        throw error;
      }
    },
    [accessToken]
  );

  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      if (!accessToken) return;

      const current = folders.find((folder) => folder.id === folderId);
      setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
      setImages((prev) => prev.filter((image) => image.folderId !== folderId));
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }

      try {
        await deleteFolder(accessToken, folderId);
      } catch (error) {
        console.error('폴더 삭제 실패:', error);
        if (current) {
          setFolders((prev) => [current, ...prev]);
        }
        throw error;
      }
    },
    [accessToken, folders, selectedFolderId]
  );

  const handleDeleteImage = useCallback(
    async (imageId: string) => {
      if (!accessToken) return;

      const current = images.find((image) => image.id === imageId);
      setImages((prev) => prev.filter((image) => image.id !== imageId));

      if (current) {
        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === current.folderId
              ? {
                  ...folder,
                  imageCount: Math.max(0, folder.imageCount - 1),
                  thumbnails: prev
                    .filter((image) => image.id !== imageId && image.folderId === folder.id)
                    .slice(0, 4)
                    .map((image) => image.imageUrl),
                }
              : folder
          )
        );
      }

      try {
        await deleteAsset(accessToken, imageId);
      } catch (error) {
        console.error('이미지 삭제 실패:', error);
        if (current) {
          setImages((prev) => [current, ...prev]);
        }
        throw error;
      }
    },
    [accessToken, images]
  );

  const handleUpdateFolder = useCallback(
    async (folderId: string, updates: { name?: string; description?: string | null; tags?: string[] }) => {
      if (!accessToken) return;

      const prevState = folders.find((folder) => folder.id === folderId);
      if (!prevState) return;

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                name: updates.name ?? folder.name,
                description: updates.description ?? folder.description ?? null,
                tags: updates.tags ?? folder.tags,
              }
            : folder
        )
      );

      try {
        await updateFolder(accessToken, folderId, updates);
      } catch (error) {
        console.error('폴더 업데이트 실패:', error);
        setFolders((prev) =>
          prev.map((folder) => (folder.id === folderId ? prevState : folder))
        );
        throw error;
      }
    },
    [accessToken, folders]
  );

  const handleUpdateAsset = useCallback(
    async (assetId: string, updates: { name?: string; tags?: string[] }) => {
      if (!accessToken) return;

      const prevState = images.find((image) => image.id === assetId);
      if (!prevState) return;

      setImages((prev) =>
        prev.map((image) =>
          image.id === assetId
            ? {
                ...image,
                name: updates.name ?? image.name,
                tags: updates.tags ?? image.tags,
              }
            : image
        )
      );

      try {
        await updateAsset(accessToken, assetId, updates);
      } catch (error) {
        console.error('이미지 업데이트 실패:', error);
        setImages((prev) =>
          prev.map((image) => (image.id === assetId ? prevState : image))
        );
        throw error;
      }
    },
    [accessToken, images]
  );

  return {
    state: {
      folders,
      images,
      selectedFolderId,
      loadingFolders,
      loadingFolderDetail,
      errorFolders,
      errorFolderDetail,
    },
    actions: {
      loadFolders,
      loadFolderDetail,
      setSelectedFolderId,
      handleToggleFavorite,
      handleDeleteFolder,
      handleDeleteImage,
      handleUpdateFolder,
      handleUpdateAsset,
      setErrorFolderDetail,
    },
  };
}
