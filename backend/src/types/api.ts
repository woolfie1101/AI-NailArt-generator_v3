// API 응답 타입 정의

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AssetResponse {
  id: string;
  groupId: string;
  name: string;
  tags: string[];
  imageUrl: string;
  storagePath: string;
  createdAt: string;
  parentAssetId?: string | null;
}

export interface UploadResponse {
  success: boolean;
  asset: AssetResponse;
}

export interface InspirationItem {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
}

export interface InspirationResponse {
  success: boolean;
  data: InspirationItem[];
  total: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  services: {
    database: string;
    ai: string;
  };
}

export interface LibraryFolderSummary {
  id: string;
  name: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  tags: string[];
  isFavorite: boolean;
  imageCount: number;
  thumbnails: string[];
}

export interface LibraryFoldersResponse {
  success: boolean;
  folders: LibraryFolderSummary[];
  nextCursor: string | null;
}

export interface LibraryFolderDetailResponse {
  success: boolean;
  folder: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    tags: string[];
    isFavorite: boolean;
  };
  assets: LibraryAssetResponse[];
}

export interface LibraryAssetResponse {
  id: string;
  groupId: string;
  name: string;
  tags: string[];
  imageUrl: string;
  storagePath: string;
  createdAt: string | null;
  parentAssetId: string | null;
}

export interface GenerateRequest {
  imagePath: string;
  prompt?: string;
  style?: string;
}

export interface GenerateResponse {
  success: boolean;
  result: string;
  timestamp: string;
}

// 에러 타입
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}
