import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import clsx from 'clsx';
import { FeedPost } from '../../types';

interface PostCardProps {
  post: FeedPost;
  onPostClick: (postId: string) => void;
  onLikeToggle: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostClick, onLikeToggle, onUserClick }) => {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.caption ?? 'Nail art design'}
          className="h-full w-full object-cover"
          onClick={() => onPostClick(post.id)}
        />
      </div>

      <div className="space-y-3 px-4 py-4">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onUserClick(post.author.id)}
            className="h-9 w-9 overflow-hidden rounded-full border border-slate-200"
          >
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-semibold text-slate-500">
                {post.author.name.slice(0, 1)}
              </div>
            )}
          </button>
          <div className="flex flex-col text-left">
            <button
              type="button"
              className="text-sm font-semibold text-gray-900"
              onClick={() => onUserClick(post.author.id)}
            >
              {post.author.name}
            </button>
            <span className="text-xs text-gray-500">@{post.author.id}</span>
          </div>
        </header>

        {post.caption && (
          <p className="text-sm text-gray-700">{post.caption}</p>
        )}

        <footer className="flex items-center justify-between text-sm text-gray-500">
          <button
            type="button"
            onClick={() => onLikeToggle(post.id)}
            className={clsx('flex items-center gap-1 font-medium transition', post.hasLiked ? 'text-rose-500' : 'hover:text-gray-900')}
          >
            <Heart className={clsx('h-4 w-4', post.hasLiked ? 'fill-rose-500 text-rose-500' : '')} />
            {post.likes.toLocaleString()}
          </button>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {post.commentCount.toLocaleString()}
          </div>
        </footer>
      </div>
    </article>
  );
};
