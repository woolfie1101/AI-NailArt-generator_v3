import { useState, useRef } from 'react';
import type { 
  BottomNavTab, 
  FeedPost, 
  LibraryFolder, 
  LibraryImage, 
  ProfileSummary,
  AppState,
  GenerationMode,
  StagedChanges
} from '../types';
import { AppStatus } from '../types';
import { SAMPLE_FEED_POSTS, SAMPLE_PROFILE } from '../data/sampleData';

export function useAppState() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [createPostContext, setCreatePostContext] = useState<{ 
    open: boolean; 
    folderId: string | null; 
    imageId: string | null 
  }>({ open: false, folderId: null, imageId: null });

  // Feed state
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(SAMPLE_FEED_POSTS);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [profile, setProfile] = useState<ProfileSummary>(SAMPLE_PROFILE);

  // Library state
  const [libraryFolders, setLibraryFolders] = useState<LibraryFolder[]>([]);
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [folderDetailLoading, setFolderDetailLoading] = useState(false);
  const [folderDetailError, setFolderDetailError] = useState<string | null>(null);

  // Generator state
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
  const [activeGroup, setActiveGroup] = useState<{ id: string; name: string } | null>(null);

  // Folder tags state
  const [folderTags, setFolderTags] = useState<Record<string, {
    tags: string[];
    isLoading: boolean;
    isDirty: boolean;
    isSaving: boolean;
    error?: string;
  }>>({});

  const loadingIntervalRef = useRef<number | null>(null);

  return {
    // Navigation
    activeTab,
    setActiveTab,
    selectedFolderId,
    setSelectedFolderId,
    createPostContext,
    setCreatePostContext,

    // Feed
    feedPosts,
    setFeedPosts,
    selectedPost,
    setSelectedPost,
    profile,
    setProfile,

    // Library
    libraryFolders,
    setLibraryFolders,
    libraryImages,
    setLibraryImages,
    libraryLoading,
    setLibraryLoading,
    libraryError,
    setLibraryError,
    folderDetailLoading,
    setFolderDetailLoading,
    folderDetailError,
    setFolderDetailError,

    // Generator
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
    setActiveGroup,

    // Folder tags
    folderTags,
    setFolderTags,

    // Refs
    loadingIntervalRef,
  };
}
