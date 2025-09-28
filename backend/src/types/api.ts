// API 응답 타입 정의

export interface ApiResponse<T = unknown> {
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

export type VisibilityType = 'public' | 'followers' | 'private';

export interface FeedAuthorSummary {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  isFollowed: boolean;
  isFollowingMe: boolean;
  followersCount: number;
  followingCount: number;
}

export interface FeedAssetSummary {
  id: string;
  name: string;
  tags: string[];
  imageUrl: string;
  storagePath: string;
  createdAt: string | null;
}

export interface FeedPostSummary {
  id: string;
  caption: string | null;
  hashtags: string[];
  visibility: VisibilityType;
  likeCount: number;
  commentCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  author: FeedAuthorSummary;
  asset: FeedAssetSummary;
  isLiked: boolean;
  isSaved: boolean;
  canEdit: boolean;
}

export interface FeedCommentSummary {
  id: string;
  message: string;
  createdAt: string | null;
  author: FeedAuthorSummary;
  canDelete: boolean;
}

export interface FeedResponse {
  success: boolean;
  posts: FeedPostSummary[];
  nextCursor: string | null;
}

export interface FeedPostDetailResponse {
  success: boolean;
  post: FeedPostSummary;
  comments: FeedCommentSummary[];
  nextCursor: string | null;
}

export interface FeedPostPublishRequest {
  assetId: string;
  caption?: string | null;
  visibility?: VisibilityType;
  hashtags?: string[];
}

export interface FeedPostPublishResponse {
  success: boolean;
  post: FeedPostSummary;
}

export interface FeedPostActionResponse {
  success: boolean;
  post: FeedPostSummary;
}

export interface FeedCommentActionResponse {
  success: boolean;
  comment: FeedCommentSummary;
  commentCount: number;
}

export interface FeedCommentDeleteResponse {
  success: boolean;
  commentId: string;
  commentCount: number;
}

export interface FollowActionResponse {
  success: boolean;
  author: FeedAuthorSummary;
  isFollowing: boolean;
}

export interface ImagePayload {
  data: string;
  mimeType: string;
}

export interface GenerateRequest {
  groupId?: string;
  prompt: string;
  style?: string | null;
  mode?: 'inspiration' | 'tryon';
  baseImage?: ImagePayload;
  styleImage?: ImagePayload | null;
  generatedImage?: ImagePayload;
  parentAssetId?: string | null;
  name?: string;
  tags?: string[];
}

export interface GenerateResponse {
  success: boolean;
  asset: LibraryAssetResponse;
  group: {
    id: string;
    name: string;
    isNew: boolean;
  };
}

// 에러 타입
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}
