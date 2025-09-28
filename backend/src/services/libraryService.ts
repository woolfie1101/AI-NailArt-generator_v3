import type { LibraryFolder, LibraryImage } from '../types';
import { BACKEND_URL } from './backendService';

interface LibraryFoldersApiResponse {
  success: boolean;
  folders: Array<{
    id: string;
    name: string;
    description?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    tags?: string[] | null;
    isFavorite?: boolean | null;
    imageCount?: number | null;
    thumbnails?: string[] | null;
  }>;
  nextCursor: string | null;
  error?: string;
}

interface LibraryFolderDetailApiResponse {
  success: boolean;
  folder: {
    id: string;
    name: string;
    description?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    tags?: string[] | null;
    isFavorite?: boolean | null;
  };
  assets: Array<{
    id: string;
    groupId: string;
    name: string;
    tags?: string[] | null;
    imageUrl: string;
    storagePath: string;
    createdAt?: string | null;
    parentAssetId?: string | null;
  }>;
  error?: string;
}

function mapFolder(summary: LibraryFoldersApiResponse['folders'][number]): LibraryFolder {
  const createdAt = summary.createdAt ? summary.createdAt.slice(0, 10) : '';
  return {
    id: summary.id,
    name: summary.name,
    description: summary.description ?? null,
    createdAt,
    imageCount: summary.imageCount ?? 0,
    tags: summary.tags ?? [],
    isFavorite: summary.isFavorite ?? false,
    thumbnails: summary.thumbnails ?? [],
  };
}

function mapAsset(asset: LibraryFolderDetailApiResponse['assets'][number]): LibraryImage {
  const createdAt = asset.createdAt ? asset.createdAt.slice(0, 10) : '';
  return {
    id: asset.id,
    folderId: asset.groupId,
    name: asset.name,
    imageUrl: asset.imageUrl,
    createdAt,
    tags: asset.tags ?? [],
    storagePath: asset.storagePath,
    parentAssetId: asset.parentAssetId ?? null,
  };
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function fetchLibraryFolders(accessToken: string): Promise<LibraryFolder[]> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/library/folders`, {
      headers: authHeaders(accessToken),
    });
  } catch (error) {
    console.error('라이브러리 API 연결 실패:', error);
    throw new Error('라이브러리를 불러오지 못했습니다. 서버가 실행 중인지 확인해주세요.');
  }

  if (!response.ok) {
    let message = '라이브러리 정보를 불러오지 못했습니다.';
    try {
      const errorBody = (await response.json()) as Partial<LibraryFoldersApiResponse>;
      if (typeof errorBody.error === 'string') {
        message = errorBody.error;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = (await response.json()) as LibraryFoldersApiResponse;
  if (!data.success) {
    throw new Error(data.error ?? '라이브러리 정보를 불러오지 못했습니다.');
  }

  return data.folders.map(mapFolder);
}

export async function fetchLibraryFolderDetail(accessToken: string, folderId: string) {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/library/folders/${folderId}`, {
      headers: authHeaders(accessToken),
    });
  } catch (error) {
    console.error('폴더 상세 API 연결 실패:', error);
    throw new Error('폴더 정보를 불러오지 못했습니다. 서버가 실행 중인지 확인해주세요.');
  }

  if (!response.ok) {
    let message = '폴더 정보를 불러오지 못했습니다.';
    try {
      const errorBody = (await response.json()) as Partial<LibraryFolderDetailApiResponse>;
      if (typeof errorBody.error === 'string') {
        message = errorBody.error;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = (await response.json()) as LibraryFolderDetailApiResponse;
  if (!data.success) {
    throw new Error(data.error ?? '폴더 정보를 불러오지 못했습니다.');
  }

  const folder: LibraryFolder = {
    id: data.folder.id,
    name: data.folder.name,
    description: data.folder.description ?? null,
    createdAt: data.folder.createdAt ? data.folder.createdAt.slice(0, 10) : '',
    imageCount: data.assets.length,
    tags: data.folder.tags ?? [],
    isFavorite: data.folder.isFavorite ?? false,
    thumbnails: data.assets.slice(0, 4).map((asset) => asset.imageUrl),
  };

  const assets = data.assets.map(mapAsset);

  return {
    folder,
    assets,
  };
}

export async function toggleFavoriteFolder(accessToken: string, folderId: string, isFavorite: boolean) {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/library/folders/${folderId}`, {
      method: 'PATCH',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isFavorite }),
    });
  } catch (error) {
    console.error('즐겨찾기 API 연결 실패:', error);
    throw new Error('즐겨찾기 변경에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
  }

  if (!response.ok) {
    throw new Error('즐겨찾기 변경에 실패했습니다.');
  }
}

export async function deleteFolder(accessToken: string, folderId: string) {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/library/folders/${folderId}`, {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    });
  } catch (error) {
    console.error('폴더 삭제 API 연결 실패:', error);
    throw new Error('폴더 삭제에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
  }

  if (!response.ok) {
    throw new Error('폴더 삭제에 실패했습니다.');
  }
}

export async function updateFolder(
  accessToken: string,
  folderId: string,
  updates: { name?: string; description?: string | null; tags?: string[] }
) {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/library/folders/${folderId}`, {
      method: 'PATCH',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('폴더 업데이트 API 연결 실패:', error);
    throw new Error('폴더 정보를 업데이트하지 못했습니다. 서버가 실행 중인지 확인해주세요.');
  }

  if (!response.ok) {
    throw new Error('폴더 정보를 업데이트하지 못했습니다.');
  }
}

export async function deleteAsset(accessToken: string, assetId: string) {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/library/assets/${assetId}`, {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    });
  } catch (error) {
    console.error('이미지 삭제 API 연결 실패:', error);
    throw new Error('이미지 삭제에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
  }

  if (!response.ok) {
    throw new Error('이미지 삭제에 실패했습니다.');
  }
}

export async function updateAsset(
  accessToken: string,
  assetId: string,
  updates: { name?: string; tags?: string[] }
) {
  if (updates.tags && !updates.name) {
    // tags only update route
    let response: Response;
    try {
      response = await fetch(`${BACKEND_URL}/api/library/assets/${assetId}/tags`, {
        method: 'POST',
        headers: {
          ...authHeaders(accessToken),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: updates.tags }),
      });
    } catch (error) {
      console.error('태그 업데이트 API 연결 실패:', error);
      throw new Error('이미지 정보를 업데이트하지 못했습니다. 서버가 실행 중인지 확인해주세요.');
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || '이미지 정보를 업데이트하지 못했습니다.');
    }

    return;
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/library/assets/${assetId}`, {
      method: 'PATCH',
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('이미지 업데이트 API 연결 실패:', error);
    throw new Error('이미지 정보를 업데이트하지 못했습니다. 서버가 실행 중인지 확인해주세요.');
  }

  if (!response.ok) {
    throw new Error('이미지 정보를 업데이트하지 못했습니다.');
  }
}
