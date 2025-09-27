
export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type AppState =
  | { status: AppStatus.IDLE }
  | { status: AppStatus.LOADING }
  | { status: AppStatus.SUCCESS; results: string[] }
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
