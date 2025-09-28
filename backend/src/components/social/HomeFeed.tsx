import React, { useState } from 'react';
import Masonry from 'react-responsive-masonry';
import { FeedPost } from '../../types';
import { PostCard } from './PostCard';

interface HomeFeedProps {
  posts: FeedPost[];
  onPostClick: (post: FeedPost) => void;
  onUserClick: (userId: string) => void;
  onLikeToggle: (postId: string) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({ posts, onPostClick, onUserClick, onLikeToggle }) => {
  const [isLoadingMore] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-24">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">네일아트 피드</h1>
          <p className="text-sm text-gray-600">다른 크리에이터들의 작품을 둘러보세요.</p>
        </header>

        <Masonry columnsCount={2} gutter="16px">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostClick={() => onPostClick(post)}
              onLikeToggle={onLikeToggle}
              onUserClick={onUserClick}
            />
          ))}
        </Masonry>

        {isLoadingMore && (
          <div className="flex flex-col items-center py-10 text-sm text-gray-500">
            <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600"></div>
            <span className="mt-2">더 많은 게시물을 불러오는 중...</span>
          </div>
        )}
      </div>
    </div>
  );
};
