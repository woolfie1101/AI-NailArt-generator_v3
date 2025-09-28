import { useState } from "react";
import { ArrowLeft, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}

interface PostDetailProps {
  postId: string;
  onBack: () => void;
  onUserClick: (userId: string) => void;
}

export function PostDetail({ postId, onBack, onUserClick }: PostDetailProps) {
  // Mock post data
  const postData = {
    id: postId,
    imageUrl: "https://images.unsplash.com/photo-1599472308689-1b0d452886b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwbmFpbCUyMGFydCUyMGZyZW5jaHxlbnwxfHx8fDE3NTg5NTA0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    author: {
      id: "user1",
      name: "김예린",
      avatar: "https://images.unsplash.com/photo-1722270608841-35d7372a2e85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg5NTI1NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    caption: "미니멀한 프렌치 네일 완성! ✨ 오늘은 심플하지만 우아한 느낌으로 연출해봤어요. 베이스는 투명한 누드톤으로 하고 끝부분만 화이트로 포인트를 줬답니다. #프렌치네일 #미니멀 #네일아트 #누드톤 #심플네일",
    timestamp: "2시간 전",
    likes: 124,
    hasLiked: false,
    hasSaved: false
  };

  const [hasLiked, setHasLiked] = useState(postData.hasLiked);
  const [hasSaved, setHasSaved] = useState(postData.hasSaved);
  const [likes, setLikes] = useState(postData.likes);
  const [newComment, setNewComment] = useState("");

  // Mock comments
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: {
        id: "user2",
        name: "이서현",
        avatar: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyJTIwbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU4OTUyNTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      },
      content: "너무 예뻐요! 어떤 젤을 사용하셨나요?",
      timestamp: "1시간 전",
      likes: 3
    },
    {
      id: "2",
      author: {
        id: "user3",
        name: "박지민"
      },
      content: "와 진짜 깔끔하다 👍 따라해보고 싶어요",
      timestamp: "45분 전",
      likes: 1
    },
    {
      id: "3",
      author: {
        id: "user4",
        name: "최하영"
      },
      content: "프렌치네일 중에 제일 이쁜 것 같아요! 혹시 가격이 어떻게 되나요?",
      timestamp: "30분 전",
      likes: 0
    }
  ]);

  const handleLike = () => {
    setHasLiked(!hasLiked);
    setLikes(hasLiked ? likes - 1 : likes + 1);
  };

  const handleSave = () => {
    setHasSaved(!hasSaved);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: {
          id: "current-user",
          name: "나"
        },
        content: newComment.trim(),
        timestamp: "방금 전",
        likes: 0
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-20">
      <div className="max-w-md mx-auto bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <button
            onClick={() => onUserClick(postData.author.id)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={postData.author.avatar} />
              <AvatarFallback className="bg-purple-100 text-purple-600">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{postData.author.name}</span>
          </button>

          <Button variant="ghost" size="sm" className="p-2">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Image */}
        <div className="aspect-square relative">
          <ImageWithFallback
            src={postData.imageUrl}
            alt="네일아트"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`transition-colors ${
                hasLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${hasLiked ? 'fill-current' : ''}`} />
            </button>
            <button className="text-gray-700 hover:text-gray-900 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="text-gray-700 hover:text-gray-900 transition-colors">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={handleSave}
            className={`transition-colors ${
              hasSaved ? 'text-purple-600' : 'text-gray-700 hover:text-purple-600'
            }`}
          >
            <Bookmark className={`w-6 h-6 ${hasSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Likes */}
        <div className="px-4 pb-2">
          <p className="font-medium">좋아요 {likes.toLocaleString()}개</p>
        </div>

        {/* Caption */}
        <div className="px-4 pb-4">
          <p className="text-gray-900">
            <button 
              onClick={() => onUserClick(postData.author.id)}
              className="font-medium hover:opacity-80 mr-2"
            >
              {postData.author.name}
            </button>
            {postData.caption}
          </p>
          <p className="text-gray-500 text-sm mt-1">{postData.timestamp}</p>
        </div>

        {/* Comments */}
        <div className="border-t border-gray-200">
          {comments.map((comment) => (
            <div key={comment.id} className="px-4 py-3 flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <button 
                    onClick={() => onUserClick(comment.author.id)}
                    className="font-medium hover:opacity-80 mr-2"
                  >
                    {comment.author.name}
                  </button>
                  {comment.content}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">{comment.timestamp}</span>
                  {comment.likes > 0 && (
                    <span className="text-xs text-gray-500">좋아요 {comment.likes}개</span>
                  )}
                  <button className="text-xs text-gray-500 hover:text-gray-700">
                    답글 달기
                  </button>
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-purple-100 text-purple-600">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <Input
              placeholder="댓글 달기..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-none bg-transparent px-0 focus-visible:ring-0"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700 disabled:text-gray-400"
            >
              게시
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}