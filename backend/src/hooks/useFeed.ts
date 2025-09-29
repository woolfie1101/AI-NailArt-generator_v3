import { useCallback } from 'react';
import type { FeedPost, ProfileSummary } from '../types';

export function useFeed(
  feedPosts: FeedPost[],
  setFeedPosts: any,
  profile: ProfileSummary,
  setProfile: any,
  setCreatePostContext: any,
  setSelectedFolderId: any,
  navigateToTab: any
) {
  const handleLikeToggle = useCallback((postId: string) => {
    setFeedPosts((prev: FeedPost[]) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              hasLiked: !post.hasLiked,
              likes: post.hasLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
            }
          : post
      )
    );
  }, [setFeedPosts]);

  const handlePublishPost = useCallback((values: { 
    imageId: string; 
    caption: string; 
    visibility: 'public' | 'followers' | 'private' 
  }, libraryImages: any[]) => {
    const image = libraryImages.find((item) => item.id === values.imageId);
    if (!image) {
      alert('선택한 이미지를 찾을 수 없습니다.');
      return;
    }

    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      imageUrl: image.imageUrl,
      author: {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
      },
      likes: 0,
      hasLiked: false,
      commentCount: 0,
      caption: values.caption,
    };

    setFeedPosts((prev: FeedPost[]) => [newPost, ...prev]);
    setProfile((prev: ProfileSummary) => ({ ...prev, posts: prev.posts + 1 }));
    setCreatePostContext({ open: false, folderId: null, imageId: null });
    setSelectedFolderId(null);
    navigateToTab('home');
  }, [profile, setFeedPosts, setProfile, setCreatePostContext, setSelectedFolderId, navigateToTab]);

  const handlePrivacyToggle = useCallback(() => {
    setProfile((prev: ProfileSummary) => ({ ...prev, isPrivate: !prev.isPrivate }));
  }, [setProfile]);

  return {
    handleLikeToggle,
    handlePublishPost,
    handlePrivacyToggle,
  };
}
