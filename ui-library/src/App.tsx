import { useState } from "react";
import { BottomNavigation, TabType } from "./components/BottomNavigation";
import { HomeFeed } from "./components/HomeFeed";
import { LibraryPage } from "./components/LibraryPage";
import { FolderDetailPage } from "./components/FolderDetailPage";
import { UserProfile } from "./components/UserProfile";
import { PostDetail } from "./components/PostDetail";
import { CreatePost } from "./components/CreatePost";
import { toast } from "sonner@2.0.3";

type AppView = 'home' | 'generator' | 'library' | 'profile' | 'folder-detail' | 'post-detail' | 'create-post' | 'user-profile';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [createPostImageUrl, setCreatePostImageUrl] = useState<string | null>(null);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        setCurrentView('home');
        break;
      case 'generator':
        // In a real app, this would navigate to the AI nail art generator
        toast.success("AI 네일아트 생성기로 이동합니다!");
        break;
      case 'library':
        setCurrentView('library');
        break;
      case 'profile':
        setCurrentView('profile');
        break;
    }
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
    setCurrentView('folder-detail');
  };

  const handleBackToLibrary = () => {
    setCurrentView('library');
    setActiveTab('library');
    setSelectedFolderId(null);
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentView('post-detail');
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView('user-profile');
  };

  const handleShareToFeed = (imageId: string, imageUrl: string) => {
    setCreatePostImageUrl(imageUrl);
    setCurrentView('create-post');
  };

  const handleCreatePostBack = () => {
    setCurrentView('folder-detail');
    setCreatePostImageUrl(null);
  };

  const handleCreatePostShare = (caption: string, tags: string[]) => {
    toast.success("게시물이 성공적으로 공유되었습니다!");
    setCurrentView('profile');
    setActiveTab('profile');
    setCreatePostImageUrl(null);
  };

  const handleBackFromPost = () => {
    setCurrentView('home');
    setActiveTab('home');
    setSelectedPostId(null);
  };

  const handleBackFromUserProfile = () => {
    setCurrentView('home');
    setActiveTab('home');
    setSelectedUserId(null);
  };

  const handleCreateNew = () => {
    toast.success("AI 네일아트 생성기로 이동합니다!");
  };

  const shouldShowNavigation = !['folder-detail', 'post-detail', 'create-post', 'user-profile'].includes(currentView);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {currentView === 'home' && (
        <HomeFeed 
          onPostClick={handlePostClick}
          onUserClick={handleUserClick}
        />
      )}
      
      {currentView === 'library' && (
        <LibraryPage 
          onFolderSelect={handleFolderSelect}
          onCreateNew={handleCreateNew}
        />
      )}
      
      {currentView === 'folder-detail' && selectedFolderId && (
        <FolderDetailPage
          folderId={selectedFolderId}
          onBackToLibrary={handleBackToLibrary}
          onShareToFeed={handleShareToFeed}
        />
      )}

      {currentView === 'profile' && (
        <UserProfile 
          onPostClick={handlePostClick}
          onEditProfile={() => toast.info("프로필 편집 기능은 준비 중입니다.")}
        />
      )}

      {currentView === 'user-profile' && selectedUserId && (
        <UserProfile 
          userId={selectedUserId}
          onPostClick={handlePostClick}
          onBack={handleBackFromUserProfile}
        />
      )}

      {currentView === 'post-detail' && selectedPostId && (
        <PostDetail
          postId={selectedPostId}
          onBack={handleBackFromPost}
          onUserClick={handleUserClick}
        />
      )}

      {currentView === 'create-post' && createPostImageUrl && (
        <CreatePost
          imageUrl={createPostImageUrl}
          onBack={handleCreatePostBack}
          onShare={handleCreatePostShare}
        />
      )}

      {shouldShowNavigation && (
        <BottomNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}