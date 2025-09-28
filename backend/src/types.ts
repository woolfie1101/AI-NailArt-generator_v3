
export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GeneratedResult {
  previewUrl: string;
  asset: GeneratedAsset;
}

export interface GeneratedAsset {
  id: string;
  groupId: string;
  imageUrl: string;
  storagePath: string;
  name: string;
  createdAt: string | null;
  tags: string[];
  parentAssetId: string | null;
}

export type AppState =
  | { status: AppStatus.IDLE }
  | { status: AppStatus.LOADING }
  | { status: AppStatus.SUCCESS; results: GeneratedResult[] }
  | { status: AppStatus.ERROR; error: string };

export interface ImageData {
  data: string;
  mimeType: string;
}

export type GenerationMode = 'inspiration' | 'tryon';

export interface StagedChanges {
  colorSwap: { from: string; to: string } | null;
  styleModifier: string | null;
  textPrompt: string;
}

export interface FeedPost {
  id: string;
  imageUrl: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  hasLiked: boolean;
  commentCount: number;
  caption?: string;
}

export interface LibraryFolder {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  imageCount: number;
  tags: string[];
  isFavorite: boolean;
  thumbnails: string[];
}

export interface LibraryImage {
  id: string;
  imageUrl: string;
  name: string;
  createdAt: string;
  tags: string[];
  folderId: string;
  storagePath?: string;
  parentAssetId?: string | null;
}

export interface ProfileSummary {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
  isPrivate: boolean;
}
