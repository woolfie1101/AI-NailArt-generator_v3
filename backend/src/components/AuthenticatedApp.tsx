import React, { useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { useAppState } from '../hooks/useAppState';
import { useLibrary } from '../hooks/useLibrary';
import { useFeed } from '../hooks/useFeed';
import { useNavigation } from '../hooks/useNavigation';
import { useGenerator } from '../hooks/useGenerator';
import GeneratorView from './GeneratorView';
import Header from './Header';
import { BottomNavigation } from './navigation/BottomNavigation';
import { HomeFeed } from './social/HomeFeed';
import { PostDetailModal } from './social/PostDetailModal';
import { UserProfile } from './social/UserProfile';
import { CreatePost } from './social/CreatePost';
import { LibraryView } from './library/LibraryView';
import { FolderDetailView } from './library/FolderDetailView';
import ErrorModal from './ErrorModal';
import { DebugPanel } from './DebugPanel';
import type { BottomNavTab } from './navigation/BottomNavigation';

const AuthenticatedApp: React.FC = () => {
  const { t, language } = useTranslations();
  const { user, loading: authLoading, session } = useAuth();

  // 상태 관리
  const appState = useAppState();
  const {
    activeTab,
    setActiveTab,
    selectedFolderId,
    setSelectedFolderId,
    createPostContext,
    setCreatePostContext,
    feedPosts,
    setFeedPosts,
    selectedPost,
    setSelectedPost,
    profile,
    setProfile,
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
    isModalOpen,
    setIsModalOpen,
    modalMessage,
    setModalMessage,
    activeGroup,
    setActiveGroup,
    folderTags,
    setFolderTags,
  } = appState;

  // 라이브러리 관련 훅
  const libraryHooks = useLibrary(
    session,
    libraryFolders,
    setLibraryFolders,
    libraryImages,
    setLibraryImages,
    selectedFolderId,
    setSelectedFolderId,
    setLibraryLoading,
    setLibraryError,
    setFolderDetailLoading,
    setFolderDetailError,
    setCreatePostContext
  );

  // 라이브러리 뷰 리셋 함수
  const resetLibraryView = useCallback(() => {
    setSelectedFolderId(null);
    setCreatePostContext({ open: false, folderId: null, imageId: null });
    setFolderDetailError(null);
  }, [setSelectedFolderId, setCreatePostContext, setFolderDetailError]);

  // 네비게이션 훅
  const { navigateToTab } = useNavigation(
    activeTab,
    setActiveTab,
    selectedFolderId,
    setSelectedFolderId,
    resetLibraryView
  );

  // 피드 관련 훅
  const feedHooks = useFeed(
    feedPosts,
    setFeedPosts,
    profile,
    setProfile,
    setCreatePostContext,
    setSelectedFolderId,
    navigateToTab
  );

  // 생성기 관련 훅
  const generatorHooks = useGenerator(
    session,
    libraryFolders,
    setLibraryFolders,
    setLibraryImages,
    setActiveGroup,
    setFolderTags,
    activeGroup
  );

  // 폴더 딕셔너리
  const folderDictionary = useMemo(() => {
    return Object.fromEntries(libraryFolders.map((folder) => [folder.id, folder]));
  }, [libraryFolders]);

  // CreatePost용 이미지 데이터
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

  // OAuth 콜백 처리
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
      console.log('🔄 OAuth 콜백 감지, 홈피드로 리다이렉트');
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, '', '/home');
    }
  }, []);

  // CreatePost 열기 함수
  const openCreatePost = (folderId: string | null, imageId: string | null) => {
    setCreatePostContext({ open: true, folderId, imageId });
    navigateToTab('library');
  };

  // 로딩 중일 때
  if (authLoading) {
    console.log('🔄 App 로딩 중:', { user: !!user, session: !!session, loading: authLoading });
    return (
      <div className="min-h-screen font-sans text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
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
          onUserClick={() => navigateToTab('profile')}
          onLikeToggle={feedHooks.handleLikeToggle}
        />
      )}

      {activeTab === 'create' && (
        <GeneratorView
          baseImage={generatorHooks.baseImage}
          setBaseImage={generatorHooks.setBaseImage}
          styleImage={generatorHooks.styleImage}
          setStyleImage={generatorHooks.setStyleImage}
          prompt={generatorHooks.prompt}
          setPrompt={generatorHooks.setPrompt}
          appState={generatorHooks.appState}
          isQuotaExhausted={generatorHooks.isQuotaExhausted}
          loadingMessage={generatorHooks.loadingMessage}
          extractedColors={generatorHooks.extractedColors}
          isExtractingColors={generatorHooks.isExtractingColors}
          stagedChanges={generatorHooks.stagedChanges}
          setStagedChanges={generatorHooks.setStagedChanges}
          activeResultIndex={generatorHooks.activeResultIndex}
          setActiveResultIndex={generatorHooks.setActiveResultIndex}
          generationMode={generatorHooks.generationMode}
          setGenerationMode={generatorHooks.setGenerationMode}
          canGenerate={generatorHooks.canGenerate}
          baseImagePreview={generatorHooks.baseImagePreview}
          styleImagePreview={generatorHooks.styleImagePreview}
          baseImageUploaderTitle={generatorHooks.baseImageUploaderTitle}
          styleImageUploaderTitle={generatorHooks.styleImageUploaderTitle}
          baseImageUploaderDescription={generatorHooks.baseImageUploaderDescription}
          styleImageUploaderDescription={generatorHooks.styleImageUploaderDescription}
          handleInitialGenerate={generatorHooks.handleInitialGenerate}
          handleApplyStagedChanges={generatorHooks.handleApplyStagedChanges}
          onTagsChange={(newTags) => {
            if (!generatorHooks.activeGroup?.id) return;
            // 태그 변경 로직은 나중에 추가
          }}
          onSaveTags={() => {
            if (!generatorHooks.activeGroup?.id) return;
            // 태그 저장 로직은 나중에 추가
          }}
          tags={[]}
          isGeneratingTags={false}
          isDirty={false}
          isSavingTags={false}
          saveError={null}
        />
      )}

      {activeTab === 'library' && !createPostContext.open && !selectedFolder && (
        <LibraryView
          folders={libraryFolders}
          onSelectFolder={libraryHooks.handleSelectFolder}
          onToggleFavorite={libraryHooks.handleToggleFavoriteFolder}
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
              if (typeof window !== 'undefined') {
                window.history.pushState({ tab: 'library' }, '', '/library');
              }
            }}
            onDeleteFolder={() => libraryHooks.handleDeleteFolder(selectedFolder.id)}
            onRenameFolder={() => libraryHooks.handleRenameFolder(selectedFolder)}
            onUpdateTags={() => libraryHooks.handleEditFolderTags(selectedFolder)}
            onShareImage={(imageId) => openCreatePost(selectedFolder.id, imageId)}
            onDeleteImage={libraryHooks.handleDeleteImage}
            onRenameImage={libraryHooks.handleRenameImage}
          />
        )
      )}

      {activeTab === 'library' && createPostContext.open && (
        <CreatePost
          libraryImages={imagesForCreatePost.filter((image) =>
            createPostContext.folderId ? image.folderId === createPostContext.folderId : true
          )}
          initialImageId={createPostContext.imageId}
          onPublish={(values) => feedHooks.handlePublishPost(values, libraryImages)}
          onCancel={() => setCreatePostContext({ open: false, folderId: null, imageId: null })}
        />
      )}

      {activeTab === 'profile' && (
        <UserProfile
          profile={profile}
          posts={feedPosts.filter((post) => post.author.id === profile.id)}
          onPostClick={(post) => setSelectedPost(post)}
          onPrivacyToggle={feedHooks.handlePrivacyToggle}
        />
      )}

      <BottomNavigation
        activeTab={activeTab as BottomNavTab}
        onTabChange={(tab) => {
          navigateToTab(tab);
        }}
      />

      <PostDetailModal
        isOpen={Boolean(selectedPost)}
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onLikeToggle={feedHooks.handleLikeToggle}
      />

      <ErrorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} message={modalMessage} />
      
      <DebugPanel />
    </div>
  );
};

export default AuthenticatedApp;
