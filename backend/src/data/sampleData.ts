import type { FeedPost, ProfileSummary } from '../types';

export const SAMPLE_FEED_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    imageUrl: 'https://images.unsplash.com/photo-1599472308689-1b0d452886b7?auto=format&fit=crop&w=800&q=80',
    author: {
      id: 'nail_artist_kr',
      name: '김예린',
      avatar: 'https://images.unsplash.com/photo-1722270608841-35d7372a2e85?auto=format&fit=crop&w=200&q=80',
    },
    likes: 124,
    hasLiked: false,
    commentCount: 8,
    caption: '미니멀 프렌치 네일 완성! ✨ #프렌치네일 #미니멀',
  },
  {
    id: 'post-2',
    imageUrl: 'https://images.unsplash.com/photo-1667877610066-18221c560e30?auto=format&fit=crop&w=800&q=80',
    author: {
      id: 'seoul_nail',
      name: '이서현',
      avatar: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?auto=format&fit=crop&w=200&q=80',
    },
    likes: 89,
    hasLiked: true,
    commentCount: 12,
    caption: '가을 분위기 가득한 네일 디자인 🍂',
  },
];

export const SAMPLE_PROFILE: ProfileSummary = {
  id: 'you',
  name: 'My Nail Studio',
  avatar: 'https://images.unsplash.com/photo-1722270608841-35d7372a2e85?auto=format&fit=crop&w=200&q=80',
  bio: 'AI 네일 아트 실험실 ✨ 트렌디한 디자인 기록 중',
  followers: 5420,
  following: 321,
  posts: 12,
  isPrivate: false,
};
