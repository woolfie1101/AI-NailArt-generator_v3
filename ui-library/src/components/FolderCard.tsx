import { Star, MoreHorizontal } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface FolderCardProps {
  folder: {
    id: string;
    name: string;
    imageCount: number;
    createdDate: string;
    tags: string[];
    isFavorite: boolean;
    thumbnails: string[];
  };
  onFolderClick: (folderId: string) => void;
  onToggleFavorite: (folderId: string) => void;
  onRename: (folderId: string) => void;
  onDelete: (folderId: string) => void;
}

export function FolderCard({ 
  folder, 
  onFolderClick, 
  onToggleFavorite, 
  onRename, 
  onDelete 
}: FolderCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
      {/* Thumbnail Preview */}
      <div className="relative mb-4" onClick={() => onFolderClick(folder.id)}>
        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative">
          {folder.thumbnails.length > 0 ? (
            <div className="grid grid-cols-2 gap-1 h-full p-2">
              {folder.thumbnails.slice(0, 4).map((thumb, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={thumb}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                <p className="text-sm">빈 폴더</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Favorite Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(folder.id);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Star 
            className={`w-4 h-4 ${
              folder.isFavorite 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-400 hover:text-yellow-400'
            }`} 
          />
        </button>
      </div>

      {/* Folder Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">{folder.name}</h3>
            <p className="text-sm text-gray-500">
              {folder.imageCount}개 이미지 • {folder.createdDate}
            </p>
          </div>
          
          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRename(folder.id)}>
                이름 변경
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(folder.id)}
                className="text-red-600"
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tags */}
        {folder.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {folder.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100"
              >
                #{tag}
              </Badge>
            ))}
            {folder.tags.length > 3 && (
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-1 bg-gray-50 text-gray-500"
              >
                +{folder.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}