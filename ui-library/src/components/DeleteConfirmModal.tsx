import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "./ui/alert-dialog";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'folder' | 'image';
  itemName?: string;
  imageCount?: number;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  itemName,
  imageCount
}: DeleteConfirmModalProps) {
  const isFolderDelete = type === 'folder';

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>
                {isFolderDelete ? '폴더를 삭제하시겠습니까?' : '이미지를 삭제하시겠습니까?'}
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-gray-600">
          {isFolderDelete ? (
            <>
              '{itemName}' 폴더를 정말 삭제하시겠습니까? 
              {imageCount && imageCount > 0 && (
                <>
                  {' '}폴더 안의 모든 이미지 {imageCount}개가 영구적으로 제거되며,
                </>
              )}
              {' '}이 작업은 되돌릴 수 없습니다.
            </>
          ) : (
            '이 이미지를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
          )}
        </AlertDialogDescription>

        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel onClick={onClose}>
            취소
          </AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            삭제
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}