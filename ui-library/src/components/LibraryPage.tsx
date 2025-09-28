import { useState } from "react";
import { Search, Filter, Plus, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FolderCard } from "./FolderCard";
import { FilterModal } from "./FilterModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface Folder {
  id: string;
  name: string;
  imageCount: number;
  createdDate: string;
  tags: string[];
  isFavorite: boolean;
  thumbnails: string[];
}

interface LibraryPageProps {
  onFolderSelect: (folderId: string) => void;
  onCreateNew: () => void;
}

export function LibraryPage({ onFolderSelect, onCreateNew }: LibraryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    selectedTags: [] as string[]
  });

  // Mock data
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: "1",
      name: "2025-09-27_가을 느낌",
      imageCount: 12,
      createdDate: "2025년 9월 27일",
      tags: ["홀로그램", "가을", "우아한"],
      isFavorite: true,
      thumbnails: [
        "https://images.unsplash.com/photo-1667877610066-18221c560e30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBuYWlsJTIwYXJ0JTIwZGVzaWdufGVufDF8fHx8MTc1ODk1MDQ3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1699997760248-71ac169e640e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwYXJ0JTIwaG9sb2dyYXBoaWMlMjBnbGl0dGVyfGVufDF8fHx8MTc1ODk1MDQ3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1599472308689-1b0d452886b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwbmFpbCUyMGFydCUyMGZyZW5jaHxlbnwxfHx8fDE3NTg5NTA0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMG5haWwlMjBhcnQlMjBkZXNpZ258ZW58MXx8fHwxNzU4OTUwNDcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      ]
    },
    {
      id: "2",
      name: "여름 콜렉션",
      imageCount: 8,
      createdDate: "2025년 8월 15일",
      tags: ["밝은색", "여름", "플로럴"],
      isFavorite: false,
      thumbnails: [
        "https://images.unsplash.com/photo-1674383600495-bfa0405f3c93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjBuYWlsJTIwYXJ0JTIwZGVzaWdufGVufDF8fHx8MTc1ODk1MDQ3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1673252413885-a3d44c339621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwbmFpbCUyMGFydCUyMG1hcmJsZXxlbnwxfHx8fDE3NTg5NTA0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      ]
    },
    {
      id: "3",
      name: "미니멀 스타일",
      imageCount: 15,
      createdDate: "2025년 7월 22일",
      tags: ["미니멀", "모던", "심플"],
      isFavorite: true,
      thumbnails: [
        "https://images.unsplash.com/photo-1599472308689-1b0d452886b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwbmFpbCUyMGFydCUyMGZyZW5jaHxlbnwxfHx8fDE3NTg5NTA0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1673252413885-a3d44c339621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwbmFpbCUyMGFydCUyMG1hcmJsZXxlbnwxfHx8fDE3NTg5NTA0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      ]
    }
  ]);

  const availableTags = Array.from(new Set(folders.flatMap(f => f.tags)));

  const filteredFolders = folders.filter(folder => {
    const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         folder.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = filters.selectedTags.length === 0 || 
                       filters.selectedTags.some(tag => folder.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const sortedFolders = [...filteredFolders].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      case "oldest":
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "favorites":
        return b.isFavorite === a.isFavorite ? 0 : b.isFavorite ? 1 : -1;
      default:
        return 0;
    }
  });

  const handleToggleFavorite = (folderId: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, isFavorite: !folder.isFavorite }
        : folder
    ));
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolderToDelete(folderId);
    setShowDeleteModal(true);
  };

  const confirmDeleteFolder = () => {
    if (folderToDelete) {
      setFolders(prev => prev.filter(folder => folder.id !== folderToDelete));
      setFolderToDelete(null);
    }
  };

  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      const newName = prompt("새 폴더 이름을 입력하세요:", folder.name);
      if (newName && newName.trim()) {
        setFolders(prev => prev.map(f => 
          f.id === folderId ? { ...f, name: newName.trim() } : f
        ));
      }
    }
  };

  const folderToDeleteData = folderToDelete ? folders.find(f => f.id === folderToDelete) : null;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1>내 라이브러리</h1>
          <Button 
            onClick={onCreateNew}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 디자인 생성
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="폴더 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilterModal(true)}
              className="bg-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="oldest">오래된 순</SelectItem>
                <SelectItem value="name">이름순 (가나다순)</SelectItem>
                <SelectItem value="favorites">즐겨찾기순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Folders Grid */}
        {sortedFolders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onFolderClick={onFolderSelect}
                onToggleFavorite={handleToggleFavorite}
                onRename={handleRenameFolder}
                onDelete={handleDeleteFolder}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="mb-2">라이브러리가 비어있습니다</h3>
            <p className="text-gray-600 mb-6">
              디자인을 시작하여 나만의 네일아트를 저장해 보세요!
            </p>
            <Button 
              onClick={onCreateNew}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            >
              <Plus className="w-4 h-4 mr-2" />
              아트 생성하기
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        availableTags={availableTags}
        onFiltersChange={setFilters}
        onApplyFilters={() => {}}
        onClearFilters={() => setFilters({ startDate: "", endDate: "", selectedTags: [] })}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setFolderToDelete(null);
        }}
        onConfirm={confirmDeleteFolder}
        type="folder"
        itemName={folderToDeleteData?.name}
        imageCount={folderToDeleteData?.imageCount}
      />
    </div>
  );
}