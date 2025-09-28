import { useState } from "react";
import { ArrowLeft, Hash } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CreatePostProps {
  imageUrl: string;
  onBack: () => void;
  onShare: (caption: string, tags: string[]) => void;
}

export function CreatePost({ imageUrl, onBack, onShare }: CreatePostProps) {
  const [caption, setCaption] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  const addTag = () => {
    const trimmedTag = tagInput.trim().replace(/^#/, '');
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addTag();
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    // Simulate API call
    setTimeout(() => {
      onShare(caption, tags);
      setIsSharing(false);
    }, 1500);
  };

  const canShare = caption.trim().length > 0;

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
          
          <h2 className="font-medium">새 게시물</h2>

          <Button
            onClick={handleShare}
            disabled={!canShare || isSharing}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300"
          >
            {isSharing ? "공유 중..." : "공유하기"}
          </Button>
        </div>

        {/* Image Preview */}
        <div className="aspect-square relative">
          <ImageWithFallback
            src={imageUrl}
            alt="공유할 네일아트"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Form */}
        <div className="p-4 space-y-6">
          {/* Caption */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              설명
            </label>
            <Textarea
              placeholder="설명을 입력하세요..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[100px] resize-none bg-gray-50 border-gray-200 focus:bg-white"
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500">
              {caption.length}/500
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              태그 추가
            </label>
            
            <div className="flex gap-2">
              <Input
                placeholder="태그 입력 (예: 프렌치네일)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 bg-gray-50 border-gray-200 focus:bg-white"
                maxLength={20}
              />
              <Button
                onClick={addTag}
                disabled={!tagInput.trim()}
                variant="outline"
                className="bg-white"
              >
                추가
              </Button>
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    #{tag} ×
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500">
              태그를 클릭하면 제거됩니다. 최대 10개까지 추가할 수 있습니다.
            </p>
          </div>

          {/* Popular Tags Suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">인기 태그</p>
            <div className="flex flex-wrap gap-2">
              {['프렌치네일', '미니멀', '글리터', '홀로그램', '마블', '그라데이션'].map((popularTag) => (
                <button
                  key={popularTag}
                  onClick={() => {
                    if (!tags.includes(popularTag) && tags.length < 10) {
                      setTags([...tags, popularTag]);
                    }
                  }}
                  disabled={tags.includes(popularTag) || tags.length >= 10}
                  className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  #{popularTag}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>개인정보 보호:</strong> 게시물은 피드 공개 설정에 따라 다른 사용자들에게 표시됩니다. 
              프로필에서 언제든지 공개/비공개 설정을 변경할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}