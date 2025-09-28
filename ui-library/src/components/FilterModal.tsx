import { CalendarDays, Tag, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    startDate: string;
    endDate: string;
    selectedTags: string[];
  };
  availableTags: string[];
  onFiltersChange: (filters: {
    startDate: string;
    endDate: string;
    selectedTags: string[];
  }) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export function FilterModal({
  isOpen,
  onClose,
  filters,
  availableTags,
  onFiltersChange,
  onApplyFilters,
  onClearFilters
}: FilterModalProps) {
  const handleTagToggle = (tag: string) => {
    const newSelectedTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter(t => t !== tag)
      : [...filters.selectedTags, tag];
    
    onFiltersChange({
      ...filters,
      selectedTags: newSelectedTags
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            필터 설정
          </DialogTitle>
          <DialogDescription>
            날짜 범위와 태그를 선택하여 폴더를 필터링하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              날짜 범위
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate" className="text-sm text-gray-600">
                  시작일
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    startDate: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm text-gray-600">
                  종료일
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    endDate: e.target.value
                  })}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              태그
            </Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={filters.selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  />
                  <Label htmlFor={tag} className="text-sm">
                    #{tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="flex-1"
            >
              초기화
            </Button>
            <Button 
              onClick={() => {
                onApplyFilters();
                onClose();
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              적용
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}