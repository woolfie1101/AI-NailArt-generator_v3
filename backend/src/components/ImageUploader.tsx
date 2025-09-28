import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { useTranslations } from '../hooks/useTranslations';

interface ImageUploaderProps {
  title: string;
  description?: string;
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, description, onFileSelect, previewUrl, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslations();
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFile = useCallback((file?: File) => {
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };
  
  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    const file = event.dataTransfer?.files?.[0];
    handleFile(file);
  };

  return (
    <div className="w-full">
      <h3 className="text-base font-medium text-gray-800 mb-2 text-center">{title}</h3>
      {description && <p className="text-xs text-center text-gray-500 mb-3 px-2 min-h-12 flex items-center justify-center">{description}</p>}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full aspect-square bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-gray-500 transition-all duration-300 overflow-hidden group
          ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-indigo-400 hover:bg-slate-100'}
          ${isDragActive ? 'border-indigo-500 bg-indigo-50/80' : ''}
        `}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">{t('changeImage')}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <UploadIcon />
            <p className="mt-2 text-sm">{t('clickToUpload')}</p>
            <p className="text-xs text-gray-500">{t('dragAndDrop')}</p>
            <p className="text-xs">{t('imageFormats')}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
