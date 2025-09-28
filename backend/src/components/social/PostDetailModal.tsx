import React from 'react';
import { X, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import clsx from 'clsx';
import { FeedPost } from '../../types';

interface PostDetailModalProps {
  isOpen: boolean;
  post: FeedPost | null;
  onClose: () => void;
  onLikeToggle: (postId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ isOpen, post, onClose, onLikeToggle }) => {
  if (!isOpen || !post) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:h-[75vh] md:flex-row">
        <button
          type="button"
          className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/70"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex-1 bg-black/5">
          <img src={post.imageUrl} alt={post.caption ?? 'Nail art'} className="h-full w-full object-cover" />
        </div>

        <aside className="flex w-full max-w-md flex-1 flex-col bg-white">
          <header className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-semibold text-slate-500">
                  {post.author.name.slice(0, 1)}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
              <p className="text-xs text-gray-500">@{post.author.id}</p>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            {post.caption && (
              <div>
                <p className="text-sm text-gray-800">{post.caption}</p>
              </div>
            )}
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-gray-500">
              댓글 기능은 준비 중입니다.
            </div>
          </div>

          <footer className="border-t border-slate-200 px-6 py-4">
            <div className="mb-3 flex items-center gap-4 text-gray-500">
              <button
                type="button"
                onClick={() => onLikeToggle(post.id)}
                className={clsx('flex items-center gap-2 text-sm font-medium transition', post.hasLiked ? 'text-rose-500' : 'hover:text-gray-900')}
              >
                <Heart className={clsx('h-5 w-5', post.hasLiked ? 'fill-rose-500 text-rose-500' : '')} />
                {post.likes.toLocaleString()}
              </button>
              <button type="button" className="flex items-center gap-2 text-sm transition hover:text-gray-900">
                <MessageCircle className="h-5 w-5" /> 댓글
              </button>
              <button type="button" className="flex items-center gap-2 text-sm transition hover:text-gray-900">
                <Send className="h-5 w-5" /> 공유
              </button>
              <button type="button" className="ml-auto flex items-center gap-2 text-sm transition hover:text-gray-900">
                <Bookmark className="h-5 w-5" /> 저장
              </button>
            </div>
            <p className="text-xs text-gray-500">좋아요 {post.likes.toLocaleString()}개 • 댓글 {post.commentCount.toLocaleString()}개</p>
          </footer>
        </aside>
      </div>
    </div>
  );
};
