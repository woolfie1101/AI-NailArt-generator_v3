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
  const thumbnails = folder.thumbnails.filter(Boolean).slice(0, 4);
  const count = thumbnails.length;

  const { gridClassName, cellSpans } = React.useMemo(() => {
    if (count === 0) {
      return {
        gridClassName: 'grid-cols-2 grid-rows-2',
        cellSpans: [] as Array<string>,
      };
    }

    if (count === 1) {
      return {
        gridClassName: 'grid-cols-2 grid-rows-2',
        cellSpans: ['col-span-2 row-span-2'],
      };
    }

    if (count === 2) {
      return {
        gridClassName: 'grid-cols-2 grid-rows-2',
        cellSpans: ['col-span-1 row-span-2', 'col-span-1 row-span-2'],
      };
    }

    if (count === 3) {
      return {
        gridClassName: 'grid-cols-2 grid-rows-2',
        cellSpans: ['col-span-1 row-span-2', 'col-span-1 row-span-1', 'col-span-1 row-span-1'],
      };
    }

    return {
      gridClassName: 'grid-cols-2 grid-rows-2',
      cellSpans: ['col-span-1 row-span-1', 'col-span-1 row-span-1', 'col-span-1 row-span-1', 'col-span-1 row-span-1'],
    };
  }, [count]);

  const handleCardClick = () => {
    onClick(folder.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(folder.id);
    }
  };

  return (
    <article
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-400"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={clsx(
          'grid gap-1 bg-slate-100 aspect-[4/3] overflow-hidden',
          gridClassName
        )}
      >
        {thumbnails.length > 0 ? (
          thumbnails.map((thumb, index) => (
            <img
              key={thumb}
              src={thumb}
              alt="thumbnail"
              className={clsx('h-full w-full object-cover', cellSpans[index])}
            />
          ))
        ) : (
          <div className="col-span-2 row-span-2 flex items-center justify-center bg-slate-200 text-slate-500">
            <FolderOpen className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4 min-h-[168px]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-left text-sm font-semibold text-gray-900">{folder.name}</p>
            <p className="text-xs text-gray-500">{new Date(folder.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(folder.id);
            }}
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
            onClick={(event) => {
              event.stopPropagation();
              onPostToFeed(folder.id);
            }}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            피드에 게시하기
          </button>
        </div>
      </div>
    </article>
  );
};
