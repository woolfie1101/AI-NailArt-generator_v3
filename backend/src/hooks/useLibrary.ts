import { useCallback, useEffect } from 'react';
import { 
  fetchLibraryFolders,
  fetchLibraryFolderDetail,
  toggleFavoriteFolder,
  deleteFolder,
  deleteAsset,
  updateFolder,
  updateAsset,
} from '../services/libraryService';
import { extractFolderIdFromPath } from '../utils/navigation';

export function useLibrary(
  session: any,
  libraryFolders: any[],
  setLibraryFolders: any,
  libraryImages: any[],
  setLibraryImages: any,
  selectedFolderId: string | null,
  setSelectedFolderId: any,
  setLibraryLoading: any,
  setLibraryError: any,
  setFolderDetailLoading: any,
  setFolderDetailError: any,
  setCreatePostContext: any
) {
  // 라이브러리 폴더 로드
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
        setSelectedFolderId((prev: string | null) => (prev && folders.some((folder) => folder.id === prev) ? prev : null));
        setLibraryImages((prevImages: any[]) =>
          prevImages.filter((image) => folders.some((folder) => folder.id === image.folderId))
        );

        // URL에서 폴더 ID를 확인하고 해당 폴더 로드
        if (typeof window !== 'undefined') {
          const folderIdFromUrl = extractFolderIdFromPath(window.location.pathname);
          if (folderIdFromUrl && folders.some((folder) => folder.id === folderIdFromUrl)) {
            // 직접 폴더 상세 조회 실행
            setSelectedFolderId(folderIdFromUrl);
            setFolderDetailLoading(true);
            setFolderDetailError(null);

            fetchLibraryFolderDetail(session.access_token, folderIdFromUrl)
              .then(({ folder, assets }) => {
                setLibraryFolders((prev: any[]) => {
                  const index = prev.findIndex((item) => item.id === folderIdFromUrl);
                  if (index === -1) {
                    return [folder, ...prev];
                  }
                  const next = [...prev];
                  next[index] = { ...next[index], ...folder };
                  return next;
                });

                setLibraryImages((prev: any[]) => {
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

        setLibraryFolders((prev: any[]) => {
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

        setLibraryImages((prev: any[]) => {
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

  const handleToggleFavoriteFolder = async (folderId: string) => {
    if (!session?.access_token) {
      return;
    }

    const folder = libraryFolders.find((item) => item.id === folderId);
    const nextState = folder ? !folder.isFavorite : true;

    setLibraryFolders((prev: any[]) =>
      prev.map((item) =>
        item.id === folderId ? { ...item, isFavorite: nextState } : item
      )
    );

    try {
      await toggleFavoriteFolder(session.access_token, folderId, nextState);
    } catch (error) {
      console.error('즐겨찾기 변경 실패:', error);
      setLibraryFolders((prev: any[]) =>
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

    setLibraryImages((prevImages: any[]) => prevImages.filter((image) => image.folderId !== folderId));
    setLibraryFolders((prevFolders: any[]) => prevFolders.filter((folder) => folder.id !== folderId));
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
    let removedImage: any;
    let updatedImages: any[] = [];

    setLibraryImages((prev: any[]) => {
      removedImage = prev.find((image) => image.id === imageId);
      updatedImages = prev.filter((image) => image.id !== imageId);
      return updatedImages;
    });

    if (removedImage) {
      setLibraryFolders((prevFolders: any[]) =>
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

  const handleRenameFolder = async (folder: any) => {
    if (!session?.access_token) {
      return;
    }

    const newName = window.prompt('새 폴더 이름을 입력하세요.', folder.name)?.trim();
    if (!newName || newName === folder.name) {
      return;
    }

    const previousName = folder.name;
    setLibraryFolders((prev: any[]) =>
      prev.map((item) => (item.id === folder.id ? { ...item, name: newName } : item))
    );

    try {
      await updateFolder(session.access_token, folder.id, { name: newName });
    } catch (error) {
      console.error('폴더 이름 변경 실패:', error);
      setLibraryFolders((prev: any[]) =>
        prev.map((item) => (item.id === folder.id ? { ...item, name: previousName } : item))
      );
      alert('폴더 이름을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleEditFolderTags = async (folder: any) => {
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
    setLibraryFolders((prev: any[]) =>
      prev.map((item) => (item.id === folder.id ? { ...item, tags: parsed } : item))
    );

    try {
      await updateFolder(session.access_token, folder.id, { tags: parsed });
    } catch (error) {
      console.error('폴더 태그 변경 실패:', error);
      setLibraryFolders((prev: any[]) =>
        prev.map((item) => (item.id === folder.id ? { ...item, tags: previousTags } : item))
      );
      alert('폴더 태그를 수정하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleRenameImage = async (image: any) => {
    if (!session?.access_token) {
      return;
    }

    const newName = window.prompt('새 이미지 이름을 입력하세요.', image.name)?.trim();
    if (!newName || newName === image.name) {
      return;
    }

    const previousName = image.name;
    setLibraryImages((prev: any[]) =>
      prev.map((item) => (item.id === image.id ? { ...item, name: newName } : item))
    );

    try {
      await updateAsset(session.access_token, image.id, { name: newName });
    } catch (error) {
      console.error('이미지 이름 수정 실패:', error);
      setLibraryImages((prev: any[]) =>
        prev.map((item) => (item.id === image.id ? { ...item, name: previousName } : item))
      );
      alert('이미지 이름을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return {
    handleSelectFolder,
    handleToggleFavoriteFolder,
    handleDeleteFolder,
    handleDeleteImage,
    handleRenameFolder,
    handleEditFolderTags,
    handleRenameImage,
  };
}