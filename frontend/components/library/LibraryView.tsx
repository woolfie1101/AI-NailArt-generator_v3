import React, { useMemo, useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import clsx from 'clsx';
import { LibraryFolder } from '../../types';
import { FolderCard } from './FolderCard';

export interface LibraryFilters {
  startDate: string;
  endDate: string;
  selectedTags: string[];
}

interface LibraryViewProps {
  folders: LibraryFolder[];
  onSelectFolder: (folderId: string) => void;
  onToggleFavorite: (folderId: string) => void;
  onPostFolder: (folderId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ folders, onSelectFolder, onToggleFavorite, onPostFolder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'name' | 'favorites'>('latest');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LibraryFilters>({ startDate: '', endDate: '', selectedTags: [] });

  const availableTags = useMemo(() => Array.from(new Set(folders.flatMap((folder) => folder.tags))), [folders]);

  const filteredFolders = useMemo(() => {
    return folders.filter((folder) => {
      const matchesQuery = searchQuery
        ? folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          folder.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      const matchesTags =
        filters.selectedTags.length === 0 ||
        filters.selectedTags.every((tag) => folder.tags.includes(tag));

      const created = new Date(folder.createdAt).getTime();
      const startOk = filters.startDate ? created >= new Date(filters.startDate).getTime() : true;
      const endOk = filters.endDate ? created <= new Date(filters.endDate).getTime() : true;

      return matchesQuery && matchesTags && startOk && endOk;
    });
  }, [folders, searchQuery, filters]);

  const sortedFolders = useMemo(() => {
    const list = [...filteredFolders];
    switch (sortBy) {
      case 'latest':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'favorites':
        return list.sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
    }
  }, [filteredFolders, sortBy]);

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const resetFilters = () => {
    setFilters({ startDate: '', endDate: '', selectedTags: [] });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">내 라이브러리</h1>
            <p className="text-sm text-gray-600">생성한 디자인을 모아보고 피드에 공유하세요.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="폴더 이름 또는 태그 검색"
                className="h-10 w-56 rounded-full border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-gray-900"
              />
            </div>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-gray-900"
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된 순</option>
              <option value="name">이름순</option>
              <option value="favorites">즐겨찾기순</option>
            </select>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <Filter className="h-4 w-4" />
              필터
            </button>
          </div>
        </header>

        {showFilters && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">필터 설정</p>
              <button type="button" onClick={() => setShowFilters(false)} className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="flex flex-col text-sm text-gray-600">
                시작일
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
                  className="mt-2 h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-gray-900"
                />
              </label>
              <label className="flex flex-col text-sm text-gray-600">
                종료일
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
                  className="mt-2 h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-gray-900"
                />
              </label>
              <div className="flex flex-col text-sm text-gray-600">
                태그
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isActive = filters.selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={clsx(
                          'rounded-full border px-3 py-1 text-xs font-semibold transition',
                          isActive ? 'border-gray-900 bg-gray-900 text-white' : 'border-slate-200 bg-white text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-700"
              >
                적용
              </button>
            </div>
          </section>
        )}

        {sortedFolders.length === 0 ? (
          <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-gray-500">
            조건에 맞는 폴더가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onClick={onSelectFolder}
                onToggleFavorite={onToggleFavorite}
                onPostToFeed={onPostFolder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
