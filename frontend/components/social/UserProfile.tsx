import React from 'react';
import { FeedPost, ProfileSummary } from '../../types';
import Masonry from 'react-responsive-masonry';

interface UserProfileProps {
  profile: ProfileSummary;
  posts: FeedPost[];
  onPostClick: (post: FeedPost) => void;
  onPrivacyToggle: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ profile, posts, onPostClick, onPrivacyToggle }) => {
  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-24">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 overflow-hidden rounded-full border border-slate-200">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-2xl font-semibold text-slate-500">
                  {profile.name.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-sm text-gray-500">@{profile.id}</p>
              </div>
              {profile.bio && <p className="text-sm text-gray-700">{profile.bio}</p>}
              <div className="flex gap-6 text-sm">
                <span><strong>{profile.posts}</strong> 게시물</span>
                <span><strong>{profile.followers}</strong> 팔로워</span>
                <span><strong>{profile.following}</strong> 팔로잉</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onPrivacyToggle}
            className="self-start rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            {profile.isPrivate ? '비밀 피드 해제' : '비밀 피드로 전환'}
          </button>
        </header>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">게시물</h2>
            <p className="text-sm text-gray-500">내가 공유한 네일아트를 확인하세요.</p>
          </div>
          {posts.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
              <p className="text-sm text-gray-500">아직 공유한 게시물이 없습니다.</p>
            </div>
          ) : (
            <Masonry columnsCount={3} gutter="12px">
              {posts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  onClick={() => onPostClick(post)}
                >
                  <img src={post.imageUrl} alt={post.caption ?? 'Nail art'} className="w-full object-cover" />
                </button>
              ))}
            </Masonry>
          )}
        </section>
      </div>
    </div>
  );
};
