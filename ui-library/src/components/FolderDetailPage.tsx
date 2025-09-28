import { useState } from "react";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { ImageCard } from "./ImageCard";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface Image {
  id: string;
  url: string;
  name?: string;
  timestamp: string;
}

interface FolderDetailPageProps {
  folderId: string;
  onBackToLibrary: () => void;
  onShareToFeed?: (imageId: string, imageUrl: string) => void;
}

export function FolderDetailPage({ folderId, onBackToLibrary, onShareToFeed }: FolderDetailPageProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'folder' | 'image' } | null>(null);
  
  // Mock folder data
  const folderData = {
    id: folderId,
    name: "2025-09-27_가을 느낌",
    images: [
      {
        id: "img1",
        url: "https://images.unsplash.com/photo-1667877610066-18221c560e30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBuYWlsJTIwYXJ0JTIwZGVzaWdufGVufDF8fHx8MTc1ODk1MDQ3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        name: "가을 네일아트 1",
        timestamp: "2025년 9월 27일 14:30"
      },
      {
        id: "img2",
        url: "https://images.unsplash.com/photo-1699997760248-71ac169e640e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwYXJ0JTIwaG9sb2dyYXBoaWMlMjBnbGl0dGVyfGVufDF8fHx8MTc1ODk1MDQ3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        name: "홀로그램 글리터",
        timestamp: "2025년 9월 27일 15:15"
      },
      {
        id: "img3",
        url: "https://images.unsplash.com/photo-1599472308689-1b0d452886b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwbmFpbCUyMGFydCUyMGZyZW5jaHxlbnwxfHx8fDE3NTg5NTA0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        name: "미니멀 프렌치",
        timestamp: "2025년 9월 26일 16:45"
      },
      {
        id: "img4",
        url: "https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMG5haWwlMjBhcnQlMjBkZXNpZ258ZW58MXx8fHwxNzU4OTUwNDcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        name: "컬러풀 디자인",
        timestamp: "2025년 9월 26일 11:20"
      },
      {
        id: "img5",
        url: "https://images.unsplash.com/photo-1673252413885-a3d44c339621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwbmFpbCUyMGFydCUyMG1hcmJsZXxlbnwxfHx8fDE3NTg5NTA0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        name: "마블 패턴",
        timestamp: "2025년 9월 25일 19:30"
      },
      {
        id: "img6",
        url: "https://images.unsplash.com/photo-1674383600495-bfa0405f3c93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjBuYWlsJTIwYXJ0JTIwZGVzaWdufGVufDF8fHx8MTc1ODk1MDQ3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        name: "플로럴 아트",
        timestamp: "2025년 9월 25일 13:45"
      }
    ] as Image[]
  };

  const [folderName, setFolderName] = useState(folderData.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [images, setImages] = useState(folderData.images);

  const handleDownloadImage = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (image) {
      // Create a temporary link element to download the image
      const link = document.createElement('a');
      link.href = image.url;
      link.download = image.name || 'nail-art-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    setItemToDelete({ id: imageId, type: 'image' });
    setShowDeleteModal(true);
  };

  const handleEditImageTags = (imageId: string) => {
    // In a real app, this would open a tag editing modal
    console.log("Edit tags for image:", imageId);
  };

  const handleShareToFeed = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (image && onShareToFeed) {
      onShareToFeed(imageId, image.url);
    }
  };

  const handleDeleteFolder = () => {
    setItemToDelete({ id: folderId, type: 'folder' });
    setShowDeleteModal(true);
  };

  const handleEditTags = () => {
    // In a real app, this would open a tag editing modal for the folder
    console.log("Edit folder tags");
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'image') {
        setImages(prev => prev.filter(img => img.id !== itemToDelete.id));
      } else {
        // Delete folder - navigate back to library
        onBackToLibrary();
      }
      setItemToDelete(null);
    }
  };

  const handleNameEdit = () => {
    if (isEditingName) {
      setIsEditingName(false);
    } else {
      setIsEditingName(true);
    }
  };

  const handleNameSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingName(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBackToLibrary}
            className="mb-4 text-gray-600 hover:text-gray-900 p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            라이브러리로 돌아가기
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={handleNameSubmit}
                  onBlur={() => setIsEditingName(false)}
                  className="text-2xl font-medium bg-transparent border-b-2 border-purple-300 focus:border-purple-500 outline-none"
                  autoFocus
                />
              ) : (
                <h1 className="cursor-pointer hover:text-purple-600 transition-colors" onClick={handleNameEdit}>
                  {folderName}
                </h1>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNameEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleEditTags}
                className="bg-white"
              >
                태그 편집
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteFolder}
                className="bg-white text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                폴더 삭제
              </Button>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onDownload={handleDownloadImage}
                onDelete={handleDeleteImage}
                onEditTags={handleEditImageTags}
                onShareToFeed={handleShareToFeed}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Edit3 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="mb-2">이 폴더는 비어있습니다</h3>
            <p className="text-gray-600">
              새로운 네일아트 디자인을 생성하여 이 폴더에 저장해보세요.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        type={itemToDelete?.type || 'image'}
        itemName={itemToDelete?.type === 'folder' ? folderName : undefined}
        imageCount={itemToDelete?.type === 'folder' ? images.length : undefined}
      />
    </div>
  );
}