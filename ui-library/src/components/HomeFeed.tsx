import { useState } from "react";
import Masonry from "react-responsive-masonry";
import { PostCard } from "./PostCard";

interface Post {
  id: string;
  imageUrl: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  hasLiked: boolean;
  commentCount: number;
  caption?: string;
}

interface HomeFeedProps {
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export function HomeFeed({ onPostClick, onUserClick }: HomeFeedProps) {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      imageUrl: "https://images.unsplash.com/photo-1599472308689-1b0d452886b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwbmFpbCUyMGFydCUyMGZyZW5jaHxlbnwxfHx8fDE3NTg5NTA0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      author: {
        id: "user1",
        name: "김예린",
        avatar: "https://images.unsplash.com/photo-1722270608841-35d7372a2e85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg5NTI1NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      },
      likes: 124,
      hasLiked: false,
      commentCount: 8,
      caption: "미니멀한 프렌치 네일 완성! ✨ #프렌치네일 #미니멀 #네일아트"
    },
    {
      id: "2",
      imageUrl: "https://images.unsplash.com/photo-1667877610066-18221c560e30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBuYWlsJTIwYXJ0JTIwZGVzaWdufGVufDF8fHx8MTc1ODk1MDQ3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      author: {
        id: "user2",
        name: "이서현",
        avatar: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyJTIwbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU4OTUyNTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      },
      likes: 89,
      hasLiked: true,
      commentCount: 12,
      caption: "가을 분위기 가득한 네일 디자인 🍂 어떠신가요?"
    },
    {
      id: "3",
      imageUrl: "https://images.unsplash.com/photo-1699997760248-71ac169e640e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwYXJ0JTIwaG9sb2dyYXBoaWMlMjBnbGl0dGVyfGVufDF8fHx8MTc1ODk1MDQ3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      author: {
        id: "user3",
        name: "박지민",
      },
      likes: 256,
      hasLiked: false,
      commentCount: 23,
      caption: "홀로그램 글리터로 반짝반짝 ✨ #홀로그램 #글리터네일 #파티룩"
    },
    {
      id: "4",
      imageUrl: "https://images.unsplash.com/photo-1599316329891-19df7fa9580d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjBuYWlsJTIwYXJ0JTIwZGVzaWdufGVufDF8fHx8MTc1ODk1MjU0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      author: {
        id: "user4",
        name: "최하영"
      },
      likes: 67,
      hasLiked: true,
      commentCount: 5,
      caption: "기하학적 패턴으로 모던한 느낌 연출 💫"
    },
    {
      id: "5",
      imageUrl: "https://images.unsplash.com/photo-1611821828952-3453ba0f9408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkaWVudCUyMG5haWwlMjBhcnQlMjBvbWJyZXxlbnwxfHx8fDE3NTg5NTI1NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      author: {
        id: "user5",
        name: "송민지"
      },
      likes: 145,
      hasLiked: false,
      commentCount: 16,
      caption: "그라데이션 옴브레 효과 🌈 색감이 너무 예뻐요!"
    },
    {
      id: "6",
      imageUrl: "https://images.unsplash.com/photo-1673252413885-a3d44c339621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwbmFpbCUyMGFydCUyMG1hcmJsZXxlbnwxfHx8fDE3NTg5NTA0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      author: {
        id: "user6",
        name: "한소영"
      },
      likes: 198,
      hasLiked: true,
      commentCount: 31,
      caption: "마블 패턴으로 고급스럽게 💎 #마블네일 #럭셔리"
    }
  ]);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            hasLiked: !post.hasLiked,
            likes: post.hasLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2">네일아트 피드</h1>
          <p className="text-gray-600">다른 사용자들의 멋진 네일아트를 확인해보세요</p>
        </div>

        {/* Masonry Grid */}
        <Masonry columnsCount={2} gutter="16px">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostClick={onPostClick}
              onLike={handleLike}
              onUserClick={onUserClick}
            />
          ))}
        </Masonry>

        {/* Load more placeholder */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-2 text-sm">더 많은 게시물을 불러오는 중...</p>
        </div>
      </div>
    </div>
  );
}