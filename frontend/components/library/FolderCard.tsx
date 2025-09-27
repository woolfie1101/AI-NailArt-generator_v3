import React from 'react';
import clsx from 'clsx';
import { Heart, FolderOpen } from 'lucide-react';
import { LibraryFolder } from '../../types';

interface FolderCardProps {
  folder: LibraryFolder;
  onClick: (folderId: string) => void;
  onToggleFavorite: (folderId: string) => void;
  onPostToFeed: (folderId: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick, onToggleFavorite, onPostToFeed }) => {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <button type="button" onClick={() => onClick(folder.id)} className="block w-full">
        <div className="grid grid-cols-2 gap-1 bg-slate-100">
          {Array.from({ length: 4 }).map((_, index) => {
            const thumb = folder.thumbnails[index];
            return thumb ? (
              <img key={thumb} src={thumb} alt="thumbnail" className="h-20 w-full object-cover" />
            ) : (
              <div key={index} className="flex h-20 items-center justify-center bg-slate-200 text-slate-500">
                <FolderOpen className="h-5 w-5" />
              </div>
            );
          })}
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <button type="button" className="text-left text-sm font-semibold text-gray-900" onClick={() => onClick(folder.id)}>
              {folder.name}
            </button>
            <p className="text-xs text-gray-500">{folder.createdAt}</p>
          </div>
          <button
            type="button"
            onClick={() => onToggleFavorite(folder.id)}
            className={clsx('rounded-full border px-3 py-1 text-xs font-medium transition',
              folder.isFavorite ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 text-gray-500 hover:bg-slate-100'
            )}
          >
            <Heart className={clsx('mr-1 inline h-3.5 w-3.5 align-middle', folder.isFavorite ? 'fill-rose-500 text-rose-500' : '')} />
            즐겨찾기
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {folder.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-gray-600">#{tag}</span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
          <span>{folder.imageCount}개의 이미지</span>
          <button
            type="button"
            onClick={() => onPostToFeed(folder.id)}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            피드에 게시하기
          </button>
        </div>
      </div>
    </article>
  );
};
