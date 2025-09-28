import { Heart, MessageCircle, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PostCardProps {
  post: {
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
  };
  onPostClick: (postId: string) => void;
  onLike: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export function PostCard({ post, onPostClick, onLike, onUserClick }: PostCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Image */}
      <div 
        className="relative cursor-pointer"
        onClick={() => onPostClick(post.id)}
      >
        <ImageWithFallback
          src={post.imageUrl}
          alt="네일아트"
          className="w-full h-auto object-cover"
        />
        
        {/* Hover overlay with stats */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors opacity-0 hover:opacity-100 flex items-center justify-center">
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-1">
              <Heart className="w-5 h-5 fill-white" />
              <span className="font-medium">{post.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post.commentCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Author info and actions */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onUserClick(post.author.id)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="bg-purple-100 text-purple-600">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-900">
              {post.author.name}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
            className={`p-1 rounded-full transition-colors ${
              post.hasLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart 
              className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`} 
            />
          </button>
        </div>

        {post.caption && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {post.caption}
          </p>
        )}
      </div>
    </div>
  );
}