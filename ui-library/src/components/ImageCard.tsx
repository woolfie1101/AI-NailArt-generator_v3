import { Download, Trash2, Tag, Send } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ImageCardProps {
  image: {
    id: string;
    url: string;
    name?: string;
    timestamp: string;
  };
  onDownload: (imageId: string) => void;
  onDelete: (imageId: string) => void;
  onEditTags: (imageId: string) => void;
  onShareToFeed?: (imageId: string) => void;
}

export function ImageCard({ image, onDownload, onDelete, onEditTags, onShareToFeed }: ImageCardProps) {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
      {/* Image */}
      <div className="aspect-square relative overflow-hidden">
        <ImageWithFallback
          src={image.url}
          alt={image.name || "네일아트 이미지"}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onShareToFeed && (
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white text-purple-600 hover:text-purple-700"
                onClick={() => onShareToFeed(image.id)}
                title="피드에 게시하기"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={() => onDownload(image.id)}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={() => onEditTags(image.id)}
            >
              <Tag className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white text-red-600 hover:text-red-700"
              onClick={() => onDelete(image.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Image Info */}
      {(image.name || image.timestamp) && (
        <div className="p-3">
          {image.name && (
            <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
          )}
          <p className="text-xs text-gray-500">{image.timestamp}</p>
        </div>
      )}
    </div>
  );
}