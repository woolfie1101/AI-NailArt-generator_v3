import React, { useState } from 'react';
import type { AppState, StagedChanges } from '../types';
import { AppStatus } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { useTranslations } from '../hooks/useTranslations';

interface ResultDisplayProps {
  appState: AppState;
  isQuotaExhausted: boolean;
  loadingMessage: string;
  extractedColors: string[];
  isExtractingColors: boolean;
  stagedChanges: StagedChanges;
  setStagedChanges: React.Dispatch<React.SetStateAction<StagedChanges>>;
  onApplyChanges: () => void;
  activeResultIndex: number;
  onSelectResult: (index: number) => void;
  tags: string[];
  isGeneratingTags: boolean;
  onTagsChange: (newTags: string[]) => void;
  onSaveTags: () => void;
  isDirty: boolean;
  isSavingTags: boolean;
  saveError?: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  appState, 
  isQuotaExhausted, 
  loadingMessage,
  extractedColors,
  isExtractingColors,
  stagedChanges,
  setStagedChanges,
  onApplyChanges,
  activeResultIndex,
  onSelectResult,
  tags,
  isGeneratingTags,
  onTagsChange,
  onSaveTags,
  isDirty,
  isSavingTags,
  saveError,
}) => {
  const [selectedFromColor, setSelectedFromColor] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<{ index: number; value: string } | null>(null);
  const { t } = useTranslations();

  const TARGET_COLORS = [
    { key: 'burgundy', name: t('colors.burgundy'), hex: '#800020' },
    { key: 'navyBlue', name: t('colors.navyBlue'), hex: '#000080' },
    { key: 'dustyRose', name: t('colors.dustyRose'), hex: '#DCAE96' },
    { key: 'emeraldGreen', name: t('colors.emeraldGreen'), hex: '#50C878' },
    { key: 'lavender', name: t('colors.lavender'), hex: '#E6E6FA' },
    { key: 'mustardYellow', name: t('colors.mustardYellow'), hex: '#FFDB58' },
    { key: 'charcoalGray', name: t('colors.charcoalGray'), hex: '#36454F' },
    { key: 'teal', name: t('colors.teal'), hex: '#008080' },
  ];
  
  const STYLE_MODIFIERS = [
    { key: 'addGlitter', value: t('styleModifiers.addGlitter') },
    { key: 'magneticGel', value: t('styleModifiers.magneticGel') },
    { key: 'matteFinish', value: t('styleModifiers.matteFinish') },
    { key: 'chromePowder', value: t('styleModifiers.chromePowder') }
  ];

  if (appState.status === AppStatus.IDLE) {
    return null;
  }
  
  if (appState.status === AppStatus.LOADING) {
    return (
      <div className="text-center p-8 bg-slate-50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">{loadingMessage}</p>
      </div>
    );
  }

  if (appState.status === AppStatus.SUCCESS) {
    const activeResult = appState.results[activeResultIndex];
    if (!activeResult) return null;

    const previewUrl = activeResult.previewUrl;

    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = activeResult.asset.imageUrl || previewUrl;
      link.download = `nail-art-design-${activeResultIndex + 1}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    const handleSelectFromColor = (color: string) => {
        setSelectedFromColor(prev => prev === color ? null : color);
    }
    
    const handleSelectToColor = (targetColorName: string) => {
      if (selectedFromColor) {
        setStagedChanges(prev => ({
          ...prev,
          colorSwap: { from: selectedFromColor, to: targetColorName }
        }));
        setSelectedFromColor(null);
      }
    };
    
    const handleStyleToggle = (modifier: string) => {
      setStagedChanges(prev => ({
        ...prev,
        styleModifier: prev.styleModifier === modifier ? null : modifier,
      }));
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setStagedChanges(prev => ({ ...prev, textPrompt: e.target.value }));
    };

    const hasStagedChanges = Object.values(stagedChanges).some(val => 
        val !== null && (typeof val !== 'string' || val.trim() !== '')
    );
    
    const handleAddTag = () => {
      const trimmedTag = newTag.trim();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        onTagsChange([...tags, trimmedTag]);
        setNewTag('');
      }
    };

    const handleRemoveTag = (indexToRemove: number) => {
      onTagsChange(tags.filter((_, index) => index !== indexToRemove));
    };

    const handleEditClick = (index: number) => {
      setEditingTag({ index, value: tags[index] });
    };

    const handleUpdateTag = () => {
      if (editingTag) {
        const trimmedValue = editingTag.value.trim();
        if (trimmedValue) {
          const updatedTags = [...tags];
          updatedTags[editingTag.index] = trimmedValue;
          onTagsChange(updatedTags);
        } else {
          handleRemoveTag(editingTag.index);
        }
        setEditingTag(null);
      }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, isEditing: boolean) => {
      if ((e.nativeEvent as KeyboardEvent).isComposing) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (isEditing) {
          handleUpdateTag();
        } else {
          handleAddTag();
        }
      }
      if (e.key === 'Escape' && isEditing) {
        setEditingTag(null);
      }
    };

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-center mb-6">{t('resultTitle')}</h2>
        <div className="relative group w-full max-w-lg mx-auto rounded-lg overflow-hidden shadow-lg border">
          <img src={previewUrl} alt="Generated nail art" className="w-full h-auto" />
          <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDownload}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-800 hover:bg-white shadow"
              aria-label={t('downloadAriaLabel')}
            >
              <DownloadIcon />
            </button>
          </div>
        </div>

        {appState.results.length > 1 && (
            <div className="mt-8">
                <h3 className="text-base font-semibold text-center mb-4 text-gray-700">{t('historyTitle')}</h3>
                <div className="flex justify-center items-center gap-3 p-2 overflow-x-auto">
                    {appState.results.map((res, index) => (
                    <button 
                        key={index} 
                        onClick={() => onSelectResult(index)}
                        className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-4 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                        ${activeResultIndex === index ? 'border-indigo-500 shadow-md' : 'border-transparent hover:border-gray-300'}
                        `}
                        aria-label={`${t('historyAriaLabel')} ${index + 1}`}
                    >
                        <img src={res.previewUrl} alt={`${t('historyAriaLabel')} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                    ))}
                </div>
            </div>
        )}

        <div className="mt-10 max-w-lg mx-auto bg-slate-50/70 p-6 rounded-lg border border-slate-200">
           <h3 className="font-bold text-lg text-gray-800 mb-4 text-center">{t('studioTitle')}</h3>

           {/* 1. Smart Color Changer */}
           <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">{t('colorChangerTitle')}</h4>
              <p className="text-sm text-gray-500 mb-3">{t('colorChangerDesc')}</p>
              
              {isExtractingColors && <div className="text-sm text-gray-500 animate-pulse">{t('analyzingColors')}</div>}

              {!isExtractingColors && extractedColors.length > 0 && (
                 <div className="mb-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">{t('colorsInYourDesign')}</p>
                    <div className="flex flex-wrap gap-2">
                      {extractedColors.map(color => (
                        <button 
                            key={color} 
                            onClick={() => handleSelectFromColor(color)}
                            className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${selectedFromColor === color ? 'border-indigo-500 bg-indigo-100 font-semibold' : 'border-gray-300 bg-white'}`}
                            aria-pressed={selectedFromColor === color}
                        >
                            {color}
                        </button>
                      ))}
                    </div>
                 </div>
              )}

              {selectedFromColor && (
                 <div>
                    <p className="text-xs font-medium text-gray-600 mb-2 mt-4">{t('replaceWith', { color: selectedFromColor })}</p>
                    <div className="flex flex-wrap gap-2">
                        {TARGET_COLORS.map(target => (
                            <button 
                                key={target.key}
                                onClick={() => handleSelectToColor(target.name)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition"
                            >
                                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: target.hex }}></span>
                                {target.name}
                            </button>
                        ))}
                    </div>
                 </div>
              )}
           </div>

           {/* 2. One-Click Style Effects */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">{t('styleEffectsTitle')}</h4>
              <div className="flex flex-wrap gap-2">
                {STYLE_MODIFIERS.map(modifier => (
                  <button 
                    key={modifier.key}
                    onClick={() => handleStyleToggle(modifier.value)}
                    disabled={isQuotaExhausted}
                    className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${stagedChanges.styleModifier === modifier.value ? 'border-indigo-500 bg-indigo-100 font-semibold' : 'border-gray-300 bg-white hover:bg-gray-100'} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    aria-pressed={stagedChanges.styleModifier === modifier.value}
                  >
                    {modifier.value}
                  </button>
                ))}
              </div>
            </div>

           {/* 3. Refine with Text */}
           <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">{t('refineTextTitle')}</h4>
              <input
                type="text"
                value={stagedChanges.textPrompt}
                onChange={handleTextChange}
                placeholder={t('refineTextPlaceholder')}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-200 disabled:cursor-not-allowed"
                disabled={isQuotaExhausted}
              />
            </div>

            {/* 4. AI Generated Tags */}
           <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">{t('aiTagsTitle')}</h4>
              <p className="text-sm text-gray-500 mb-3">{t('aiTagsDesc')}</p>
              {isGeneratingTags ? (
                <div className="text-sm text-gray-500 animate-pulse">{t('generatingTags')}</div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {tags.map((tag, index) => (
                      <div key={`${tag}-${index}`} className="flex items-center gap-1 bg-gray-200 text-gray-800 text-sm rounded-full transition-all">
                        {editingTag?.index === index ? (
                           <input
                            type="text"
                            value={editingTag.value}
                            onChange={(e) => setEditingTag({ index, value: e.target.value })}
                            onBlur={handleUpdateTag}
                            onKeyDown={(e) => handleInputKeyDown(e, true)}
                            className="bg-transparent px-3 py-1 text-sm outline-none w-auto min-w-0"
                            style={{ width: `${editingTag.value.length + 4}ch` }}
                            autoFocus
                          />
                        ) : (
                          <>
                            <span
                              onClick={() => handleEditClick(index)}
                              className="px-3 py-1 cursor-pointer"
                              role="button"
                              tabIndex={0}
                            >
                              {tag}
                            </span>
                            <button
                              onClick={() => handleRemoveTag(index)}
                              disabled={isSavingTags}
                              className={`mr-2 text-lg leading-none transition-colors ${
                                isSavingTags ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900'
                              }`}
                              aria-label={`Remove tag ${tag}`}
                            >
                              &times;
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => handleInputKeyDown(e, false)}
                      placeholder={t('addTagPlaceholder')}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-200"
                      disabled={isQuotaExhausted || isSavingTags}
                    />
                    <button
                      onClick={handleAddTag}
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        isQuotaExhausted || isSavingTags
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                      disabled={isQuotaExhausted || isSavingTags}
                      aria-label={t('addTagButton')}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={onSaveTags}
                      disabled={!isDirty || isSavingTags}
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        isDirty
                          ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                          : 'bg-gray-300 text-gray-500'
                      } ${isSavingTags ? 'cursor-wait opacity-75' : ''}`}
                      aria-label="태그 저장"
                    >
                      💾
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {isDirty && !isSavingTags && (
                      <span className="text-xs text-gray-500">태그를 저장해야 라이브러리에 반영됩니다.</span>
                    )}
                    {saveError && (
                      <span className="text-xs text-rose-600">{saveError}</span>
                    )}
                  </div>
                </>
              )}
           </div>
            
            {/* Staged Changes Summary & Apply Button */}
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 text-sm mb-2">{t('stagedChangesTitle')}</h4>
                {!hasStagedChanges && <p className="text-indigo-700 text-xs">{t('stagedChangesPlaceholder')}</p>}
                <ul className="space-y-1 text-xs text-indigo-800">
                    {stagedChanges.colorSwap && <li dangerouslySetInnerHTML={{ __html: t('stagedChangeColor', { from: stagedChanges.colorSwap.from, to: stagedChanges.colorSwap.to }) }} />}
                    {stagedChanges.styleModifier && <li dangerouslySetInnerHTML={{ __html: t('stagedChangeStyle', { style: stagedChanges.styleModifier }) }} />}
                    {stagedChanges.textPrompt && <li dangerouslySetInnerHTML={{ __html: t('stagedChangeText', { text: stagedChanges.textPrompt }) }} />}
                </ul>
                 <button
                    onClick={onApplyChanges}
                    disabled={isQuotaExhausted || !hasStagedChanges}
                    className="w-full mt-4 inline-flex items-center justify-center gap-2 px-6 py-2.5 font-semibold text-white rounded-full shadow-sm transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed bg-gray-900 hover:bg-gray-700"
                >
                    <SparklesIcon />
                    {t('applyChangesButton')}
                </button>
            </div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default ResultDisplay;
