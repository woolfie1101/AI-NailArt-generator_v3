import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { LibraryImage } from '../../types';

interface CreatePostForm {
  imageId: string | null;
  caption: string;
  visibility: 'public' | 'followers' | 'private';
}

interface CreatePostProps {
  libraryImages: Array<LibraryImage & { folderName: string }>;
  initialImageId?: string | null;
  onPublish: (values: { imageId: string; caption: string; visibility: CreatePostForm['visibility']; }) => void;
  onCancel: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ libraryImages, initialImageId, onPublish, onCancel }) => {
  const [form, setForm] = useState<CreatePostForm>({
    imageId: initialImageId ?? libraryImages[0]?.id ?? null,
    caption: '',
    visibility: 'public',
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      imageId: initialImageId ?? libraryImages[0]?.id ?? null,
    }));
  }, [initialImageId, libraryImages]);

  const selectedImage = libraryImages.find((image) => image.id === form.imageId) ?? null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.imageId) {
      alert('게시할 이미지를 선택해주세요.');
      return;
    }
    onPublish({ imageId: form.imageId, caption: form.caption, visibility: form.visibility });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-24">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">게시물 작성</h1>
          <p className="text-sm text-gray-600">라이브러리에서 이미지를 선택해 피드에 공유하세요.</p>
        </header>

        <section className="grid gap-6 md:grid-cols-[2fr_3fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {selectedImage ? (
                <img src={selectedImage.imageUrl} alt={selectedImage.folderName} className="w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center bg-slate-50 text-sm text-gray-500">
                  게시할 이미지를 선택하세요.
                </div>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-900">공개 범위</p>
              <div className="mt-3 grid gap-2">
                {(
                  [
                    { id: 'public', label: '전체 공개', description: '모든 사용자가 피드에서 볼 수 있습니다.' },
                    { id: 'followers', label: '맞팔 사용자에게만', description: '맞팔 관계인 사용자만 볼 수 있습니다.' },
                    { id: 'private', label: '비공개', description: '나만 볼 수 있는 비밀 피드에 게시합니다.' },
                  ] as Array<{ id: CreatePostForm['visibility']; label: string; description: string; }>
                ).map((option) => (
                  <label
                    key={option.id}
                    className={clsx(
                      'cursor-pointer rounded-lg border px-4 py-3 transition',
                      form.visibility === option.id
                        ? 'border-gray-900 bg-gray-900/90 text-white'
                        : 'border-slate-200 bg-white hover:border-gray-900/40'
                    )}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.id}
                      checked={form.visibility === option.id}
                      onChange={() => setForm((prev) => ({ ...prev, visibility: option.id }))}
                      className="hidden"
                    />
                    <div className="text-sm font-semibold">{option.label}</div>
                    <div className={clsx('text-xs', form.visibility === option.id ? 'text-white/80' : 'text-gray-500')}>
                      {option.description}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-medium text-gray-900">라이브러리에서 이미지 선택</p>
              <div className="grid max-h-[420px] grid-cols-3 gap-3 overflow-y-auto">
                {libraryImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, imageId: image.id }))}
                    className={clsx(
                      'group relative overflow-hidden rounded-xl border-2 transition',
                      form.imageId === image.id ? 'border-gray-900 ring-2 ring-gray-900/20' : 'border-transparent hover:border-gray-300'
                    )}
                  >
                    <img src={image.imageUrl} alt={image.folderName} className="h-28 w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1 bg-black/50 p-2 text-[11px] text-white opacity-0 backdrop-blur group-hover:opacity-100">
                      <span>{image.folderName}</span>
                      {image.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5">#{tag}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <label htmlFor="caption" className="mb-2 block text-sm font-medium text-gray-900">
                캡션
              </label>
              <textarea
                id="caption"
                value={form.caption}
                onChange={(event) => setForm((prev) => ({ ...prev, caption: event.target.value }))}
                rows={6}
                placeholder="설명, 태그 등을 자유롭게 작성하세요."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-gray-800 outline-none ring-gray-300 focus:bg-white focus:ring"
              />
              <p className="mt-2 text-right text-xs text-gray-400">{form.caption.length} / 300</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
              >
                게시하기
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};
