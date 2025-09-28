import React from 'react';
import { ArrowLeft, Download, Share2, Trash, Edit2 } from 'lucide-react';
import { LibraryImage } from '../../types';

interface FolderDetailProps {
  folderName: string;
  createdAt: string;
  tags: string[];
  images: LibraryImage[];
  onBack: () => void;
  onDeleteFolder: () => void;
  onRenameFolder: () => void;
  onUpdateTags: () => void;
  onShareImage: (imageId: string) => void;
  onDeleteImage: (imageId: string) => void;
  onRenameImage: (image: LibraryImage) => void;
}

export const FolderDetailView: React.FC<FolderDetailProps> = ({
  folderName,
  createdAt,
  tags,
  images,
  onBack,
  onDeleteFolder,
  onRenameFolder,
  onUpdateTags,
  onShareImage,
  onDeleteImage,
  onRenameImage,
}) => {
  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-24">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" /> 뒤로가기
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{folderName}</h1>
              <button
                type="button"
                onClick={onRenameFolder}
                className="rounded-full border border-slate-200 p-2 text-gray-500 transition hover:bg-gray-100"
                aria-label="폴더 이름 변경"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">{new Date(createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-gray-600">#{tag}</span>
              ))}
              <button
                type="button"
                onClick={onUpdateTags}
                className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs font-semibold text-gray-500 transition hover:border-gray-400"
              >
                태그 편집
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onDeleteFolder}
            className="self-start rounded-full border border-rose-200 px-5 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
          >
            폴더 삭제
          </button>
        </header>

        {images.length === 0 ? (
          <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-gray-500">
            이 폴더에는 이미지가 없습니다.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {images.map((image) => (
              <figure key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img src={image.imageUrl} alt={image.name} className="h-64 w-full object-cover" />
                <figcaption className="space-y-3 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{image.name}</p>
                    <p className="text-xs text-gray-500">{new Date(image.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={image.imageUrl}
                        download
                        className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        <Download className="h-3.5 w-3.5" /> 다운로드
                      </a>
                      <button
                        type="button"
                        onClick={() => onShareImage(image.id)}
                        className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        <Share2 className="h-3.5 w-3.5" /> 피드 게시
                      </button>
                      <button
                        type="button"
                        onClick={() => onRenameImage(image)}
                        className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> 이름 수정
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteImage(image.id)}
                      className="flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-50"
                    >
                      <Trash className="h-3.5 w-3.5" /> 삭제
                    </button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
