import { useState } from "react";
import { Settings, UserPlus, UserMinus, Lock, Globe, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface UserProfileProps {
  userId?: string; // undefined means current user's profile
  onPostClick: (postId: string) => void;
  onEditProfile?: () => void;
  onBack?: () => void;
}

export function UserProfile({ userId, onPostClick, onEditProfile, onBack }: UserProfileProps) {
  const isOwnProfile = !userId; // If no userId provided, it's the current user's profile
  
  // Mock user data
  const userData = {
    id: userId || "current-user",
    name: isOwnProfile ? "나의 프로필" : "김예린",
    username: isOwnProfile ? "@mynails" : "@yerin_nails",
    bio: isOwnProfile 
      ? "네일아트를 사랑하는 디자이너 ✨\n매일 새로운 디자인에 도전하고 있어요!" 
      : "프로 네일아티스트 💅\n맞춤 디자인 상담 환영합니다",
    avatar: isOwnProfile 
      ? undefined 
      : "https://images.unsplash.com/photo-1722270608841-35d7372a2e85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg5NTI1NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    posts: 42,
    followers: 1234,
    following: 567,
    isFollowing: false,
    isPrivate: false
  };

  const [isFollowing, setIsFollowing] = useState(userData.isFollowing);
  const [isPrivate, setIsPrivate] = useState(userData.isPrivate);

  // Mock posts grid
  const userPosts = [
    {
      id: "1",
      imageUrl: "https://images.unsplash.com/photo-1599472308689-1b0d452886b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwbmFpbCUyMGFydCUyMGZyZW5jaHxlbnwxfHx8fDE3NTg5NTA0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: "2", 
      imageUrl: "https://images.unsplash.com/photo-1667877610066-18221c560e30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBuYWlsJTIwYXJ0JTIwZGVzaWdufGVufDF8fHx8MTc1ODk1MDQ3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: "3",
      imageUrl: "https://images.unsplash.com/photo-1699997760248-71ac169e640e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwYXJ0JTIwaG9sb2dyYXBoaWMlMjBnbGl0dGVyfGVufDF8fHx8MTc1ODk1MDQ3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: "4",
      imageUrl: "https://images.unsplash.com/photo-1673252413885-a3d44c339621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwbmFpbCUyMGFydCUyMG1hcmJsZXxlbnwxfHx8fDE3NTg5NTA0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: "5",
      imageUrl: "https://images.unsplash.com/photo-1674383600495-bfa0405f3c93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjBuYWlsJTIwYXJ0JTIwZGVzaWdufGVufDF8fHx8MTc1ODk1MDQ3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: "6",
      imageUrl: "https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMG5haWwlMjBhcnQlMjBkZXNpZ258ZW58MXx8fHwxNzU4OTUwNDcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Back Button (for other user's profile) */}
        {!isOwnProfile && onBack && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 p-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="w-24 h-24">
              <AvatarImage src={userData.avatar} />
              <AvatarFallback className="bg-purple-100 text-purple-600 text-xl">
                {userData.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div>
                  <h1 className="text-xl font-semibold">{userData.name}</h1>
                  <p className="text-gray-600">{userData.username}</p>
                </div>

                {isOwnProfile ? (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={onEditProfile}
                      className="bg-white"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      프로필 편집
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleFollowToggle}
                    variant={isFollowing ? "outline" : "default"}
                    className={isFollowing ? "bg-white" : "bg-purple-600 hover:bg-purple-700"}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        언팔로우
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        팔로우
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <span><strong>{userData.posts}</strong> 게시물</span>
                <span><strong>{userData.followers.toLocaleString()}</strong> 팔로워</span>
                <span><strong>{userData.following}</strong> 팔로잉</span>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <p className="text-gray-900 whitespace-pre-line">{userData.bio}</p>
                
                {/* Privacy Setting (own profile only) */}
                {isOwnProfile && (
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {isPrivate ? (
                        <Lock className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Globe className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-sm text-gray-600">
                        {isPrivate ? "비밀 피드입니다" : "공개 피드입니다"}
                      </span>
                    </div>
                    <Switch
                      checked={!isPrivate}
                      onCheckedChange={(checked) => setIsPrivate(!checked)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="px-6 py-6">
          <h3 className="mb-4">게시물</h3>
          
          {userPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {userPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => onPostClick(post.id)}
                  className="aspect-square relative overflow-hidden rounded-lg group"
                >
                  <ImageWithFallback
                    src={post.imageUrl}
                    alt="게시물"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="mb-2">아직 게시물이 없습니다</h3>
              <p className="text-gray-600">
                {isOwnProfile 
                  ? "첫 번째 네일아트를 공유해보세요!" 
                  : "이 사용자가 아직 게시물을 올리지 않았습니다."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}