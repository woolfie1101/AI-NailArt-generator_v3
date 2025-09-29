import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import ImageUploader from './ImageUploader';
import InspirationCarousel from './InspirationCarousel';
import ResultDisplay from './ResultDisplay';
import { SparklesIcon } from './icons/SparklesIcon';
import type { GenerationMode, AppState, StagedChanges } from '../types';

interface GeneratorViewProps {
  // Generator states
  baseImage: File | null;
  setBaseImage: (file: File | null) => void;
  styleImage: File | null;
  setStyleImage: (file: File | null) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  appState: AppState;
  isQuotaExhausted: boolean;
  loadingMessage: string;
  extractedColors: string[];
  isExtractingColors: boolean;
  stagedChanges: StagedChanges;
  setStagedChanges: (changes: StagedChanges) => void;
  activeResultIndex: number;
  setActiveResultIndex: (index: number) => void;
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  
  // Computed values
  canGenerate: boolean;
  baseImagePreview: string | null;
  styleImagePreview: string | null;
  baseImageUploaderTitle: string;
  styleImageUploaderTitle: string;
  baseImageUploaderDescription: string;
  styleImageUploaderDescription: string;
  
  // Functions
  handleInitialGenerate: () => void;
  handleApplyStagedChanges: () => void;
  onTagsChange: (newTags: string[]) => void;
  onSaveTags: () => void;
  tags: string[];
  isGeneratingTags: boolean;
  isDirty: boolean;
  isSavingTags: boolean;
  saveError: string | null;
}

const GeneratorView: React.FC<GeneratorViewProps> = ({
  baseImage,
  setBaseImage,
  styleImage,
  setStyleImage,
  prompt,
  setPrompt,
  appState,
  isQuotaExhausted,
  loadingMessage,
  extractedColors,
  isExtractingColors,
  stagedChanges,
  setStagedChanges,
  activeResultIndex,
  setActiveResultIndex,
  generationMode,
  setGenerationMode,
  canGenerate,
  baseImagePreview,
  styleImagePreview,
  baseImageUploaderTitle,
  styleImageUploaderTitle,
  baseImageUploaderDescription,
  styleImageUploaderDescription,
  handleInitialGenerate,
  handleApplyStagedChanges,
  onTagsChange,
  onSaveTags,
  tags,
  isGeneratingTags,
  isDirty,
  isSavingTags,
  saveError,
}) => {
  const { t } = useTranslations();

  return (
    <div className="pb-24">
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm md:p-10">
          <InspirationCarousel />

          <div className="mb-8">
            <h2 className="mb-3 block text-center text-base font-medium text-gray-700">{t('generationMode')}</h2>
            <div className="mx-auto flex max-w-xs justify-center rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setGenerationMode('inspiration')}
                disabled={isQuotaExhausted}
                className={`w-1/2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                  generationMode === 'inspiration' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('inspirationMode')}
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode('tryon')}
                disabled={isQuotaExhausted}
                className={`w-1/2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                  generationMode === 'tryon' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('tryonMode')}
              </button>
            </div>
            <p className="mt-3 px-4 text-center text-xs text-gray-500">
              {generationMode === 'inspiration' ? t('inspirationModeDesc') : t('tryonModeDesc')}
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
            <ImageUploader
              title={baseImageUploaderTitle}
              description={baseImageUploaderDescription}
              onFileSelect={setBaseImage}
              previewUrl={baseImagePreview}
              disabled={isQuotaExhausted}
            />
            <ImageUploader
              title={styleImageUploaderTitle}
              description={styleImageUploaderDescription}
              onFileSelect={setStyleImage}
              previewUrl={styleImagePreview}
              disabled={isQuotaExhausted}
            />
          </div>

          {generationMode === 'inspiration' && (
            <div className="mb-8">
              <label htmlFor="prompt" className="mb-2 block text-base font-medium text-gray-700">
                {t('promptLabel')}
              </label>
              <input
                id="prompt"
                type="text"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={t('promptPlaceholder')}
                className="w-full rounded-md border border-slate-300 bg-slate-50 px-4 py-2 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-200"
                disabled={isQuotaExhausted}
              />
            </div>
          )}

          <div className="mb-8 text-center">
            <button
              type="button"
              onClick={handleInitialGenerate}
              disabled={!canGenerate}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 font-semibold text-white transition ${
                canGenerate ? 'bg-gray-900 hover:bg-gray-700' : 'cursor-not-allowed bg-gray-400'
              }`}
            >
              <SparklesIcon />
              {appState.status === 'loading' ? t('generatingButton') : t('generateButton')}
            </button>
          </div>

          {appState.status === 'error' && (
            <div className="mb-6 rounded-lg border border-red-400 bg-red-100 p-3 text-center text-red-600">
              {appState.error}
            </div>
          )}

          <ResultDisplay
            appState={appState}
            isQuotaExhausted={isQuotaExhausted}
            loadingMessage={loadingMessage}
            extractedColors={extractedColors}
            isExtractingColors={isExtractingColors}
            stagedChanges={stagedChanges}
            setStagedChanges={setStagedChanges}
            onApplyChanges={handleApplyStagedChanges}
            activeResultIndex={activeResultIndex}
            onSelectResult={setActiveResultIndex}
            tags={tags}
            isGeneratingTags={isGeneratingTags}
            isDirty={isDirty}
            isSavingTags={isSavingTags}
            saveError={saveError}
            onTagsChange={onTagsChange}
            onSaveTags={onSaveTags}
          />
        </div>
      </main>
    </div>
  );
};

export default GeneratorView;
