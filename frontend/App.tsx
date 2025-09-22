import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import { SparklesIcon } from './components/icons/SparklesIcon';
import LandingPage from './components/LandingPage';
import { fileToBase64 } from './utils/fileUtils';
import { generateNailArt, extractDominantColors } from './services/geminiService';
import type { AppState, GenerationMode, StagedChanges } from './types';
import { AppStatus } from './types';
import InspirationCarousel from './components/InspirationCarousel';
import ErrorModal from './components/ErrorModal';
import Footer from './components/Footer';
import { useTranslations } from './hooks/useTranslations';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const AppContent: React.FC = () => {
  const { t } = useTranslations();
  const { user, loading } = useAuth();
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [styleImage, setStyleImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [appState, setAppState] = useState<AppState>({ status: AppStatus.IDLE });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const loadingIntervalRef = useRef<number | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('inspiration');
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [stagedChanges, setStagedChanges] = useState<StagedChanges>({
    colorSwap: null,
    styleModifier: null,
    textPrompt: '',
  });
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, []);

  const handleColorExtraction = useCallback(async (resultImage: string) => {
    setIsExtractingColors(true);
    setExtractedColors([]);
    try {
      const parts = resultImage.split(',');
      const meta = parts[0].split(':')[1].split(';')[0];
      const base64Data = parts[1];
      const colors = await extractDominantColors({ data: base64Data, mimeType: meta });
      setExtractedColors(colors);
    } catch (error) {
      console.error('Failed to extract colors:', error);
    } finally {
      setIsExtractingColors(false);
    }
  }, []);

  useEffect(() => {
    if (appState.status === AppStatus.SUCCESS && appState.results[activeResultIndex]) {
      handleColorExtraction(appState.results[activeResultIndex]);
    } else {
      setExtractedColors([]);
      setIsExtractingColors(false);
    }
  }, [appState, activeResultIndex, handleColorExtraction]);

  const handleInitialGenerate = useCallback(async () => {
    if (!baseImage || !styleImage) {
      setAppState({ status: AppStatus.ERROR, error: t('errorUpload') });
      return;
    }

    setAppState({ status: AppStatus.LOADING });
    setExtractedColors([]);
    const messages = [
      t('loading1'),
      t('loading2'),
      t('loading3'),
      t('loading4'),
    ];
    let messageIndex = 0;
    setLoadingMessage(messages[messageIndex]);
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    loadingIntervalRef.current = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2500);

    try {
      const { data: baseImageBase64, mimeType: baseImageMimeType } = await fileToBase64(baseImage);
      const { data: styleImageBase64, mimeType: styleImageMimeType } = await fileToBase64(styleImage);

      const generatedImageBase64 = await generateNailArt(
        { data: baseImageBase64, mimeType: baseImageMimeType },
        { data: styleImageBase64, mimeType: styleImageMimeType },
        prompt,
        false,
        generationMode
      );

      const resultUrl = `data:image/png;base64,${generatedImageBase64}`;
      setAppState({ status: AppStatus.SUCCESS, results: [resultUrl] });
      setActiveResultIndex(0);
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message === 'QUOTA_EXHAUSTED') {
        setModalMessage(t('errorQuota'));
        setIsModalOpen(true);
        setIsQuotaExhausted(true);
        setAppState({ status: AppStatus.IDLE });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setAppState({ status: AppStatus.ERROR, error: `${t('errorGeneric')} ${errorMessage}` });
      }
    } finally {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    }
  }, [baseImage, styleImage, prompt, generationMode, t]);

  const performRegeneration = useCallback(async (regenerationPrompt: string) => {
    const currentResults = appState.status === AppStatus.SUCCESS ? appState.results : [];
    if (currentResults.length === 0) {
      setAppState({ status: AppStatus.ERROR, error: t('errorNoImageToRegen') });
      return;
    }
    const baseImageToRegen = currentResults[activeResultIndex];

    setAppState({ status: AppStatus.LOADING });
    setExtractedColors([]);
    const messages = [
      t('regenLoading1'),
      t('regenLoading2'),
      t('regenLoading3'),
    ];
    let messageIndex = 0;
    setLoadingMessage(messages[messageIndex]);
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    loadingIntervalRef.current = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2500);

    try {
      const parts = baseImageToRegen.split(',');
      const meta = parts[0].split(':')[1].split(';')[0];
      const base64Data = parts[1];

      const generatedImageBase64 = await generateNailArt(
        { data: base64Data, mimeType: meta },
        null,
        regenerationPrompt,
        true
      );

      const resultUrl = `data:image/png;base64,${generatedImageBase64}`;
      const newResults = [...currentResults, resultUrl];
      setAppState({ status: AppStatus.SUCCESS, results: newResults });
      setActiveResultIndex(newResults.length - 1);
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message === 'QUOTA_EXHAUSTED') {
        setModalMessage(t('errorQuota'));
        setIsModalOpen(true);
        setIsQuotaExhausted(true);
        setAppState({ status: AppStatus.SUCCESS, results: currentResults });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setAppState({ status: AppStatus.ERROR, error: `${t('errorRegenerate')} ${errorMessage}` });
      }
    } finally {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    }
  }, [appState, activeResultIndex, t]);

  const handleApplyStagedChanges = useCallback(() => {
    const { colorSwap, styleModifier, textPrompt } = stagedChanges;

    const promptParts: string[] = [];
    if (colorSwap) {
      promptParts.push(`Change the color '${colorSwap.from}' to '${colorSwap.to}'.`);
    }
    if (styleModifier) {
      promptParts.push(`Apply this style effect: '${styleModifier}'.`);
    }
    if (textPrompt.trim()) {
      promptParts.push(`Additionally, incorporate this request: "${textPrompt.trim()}".`);
    }

    if (promptParts.length === 0) {
      console.warn('No changes staged to apply.');
      return;
    }

    const combinedPrompt =
      'Apply the following changes to the nail art, keeping the overall design integrity: ' +
      promptParts.join(' ');

    performRegeneration(combinedPrompt);
    setStagedChanges({ colorSwap: null, styleModifier: null, textPrompt: '' });
  }, [stagedChanges, performRegeneration]);

  const handleModeChange = (newMode: GenerationMode) => {
    if (newMode === generationMode) {
      return;
    }

    setGenerationMode(newMode);

    setStyleImage(null);
    setAppState({ status: AppStatus.IDLE });
    setPrompt('');
    setStagedChanges({
      colorSwap: null,
      styleModifier: null,
      textPrompt: '',
    });
    setActiveResultIndex(0);
  };

  const canGenerate = baseImage && styleImage && appState.status !== AppStatus.LOADING && !isQuotaExhausted;
  const baseImagePreview = baseImage ? URL.createObjectURL(baseImage) : null;
  const styleImagePreview = styleImage ? URL.createObjectURL(styleImage) : null;

  const baseImageUploaderTitle = generationMode === 'tryon' ? t('handPhotoTitleTryon') : t('handPhotoTitleInspiration');
  const styleImageUploaderTitle =
    generationMode === 'inspiration' ? t('styleImageTitleInspiration') : t('styleImageTitleTryon');

  const baseImageUploaderDescription = t('handPhotoDesc');
  const styleImageUploaderDescription =
    generationMode === 'inspiration' ? t('styleImageDescInspiration') : t('styleImageDescTryon');

  if (!user) {
    return (
      <div className="min-h-screen font-sans text-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <LandingPage />
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen font-sans text-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center text-gray-600">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-10 border border-gray-200/80">
          <InspirationCarousel />

          <div className="mb-8">
            <h2 className="block text-base font-medium text-gray-700 mb-3 text-center">{t('generationMode')}</h2>
            <div className="flex justify-center p-1 bg-gray-100 rounded-full max-w-xs mx-auto">
              <button
                onClick={() => handleModeChange('inspiration')}
                disabled={isQuotaExhausted}
                className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out disabled:cursor-not-allowed
                  ${generationMode === 'inspiration' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                {t('inspirationMode')}
              </button>
              <button
                onClick={() => handleModeChange('tryon')}
                disabled={isQuotaExhausted}
                className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out disabled:cursor-not-allowed
                  ${generationMode === 'tryon' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                {t('tryonMode')}
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3 px-4">
              {generationMode === 'inspiration' ? t('inspirationModeDesc') : t('tryonModeDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 md:items-start">
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
              <label htmlFor="prompt" className="block text-base font-medium text-gray-700 mb-2">
                {t('promptLabel')}
              </label>
              <input
                id="prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('promptPlaceholder')}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-200 disabled:cursor-not-allowed"
                disabled={isQuotaExhausted}
              />
            </div>
          )}

          <div className="text-center mb-8">
            <button
              onClick={handleInitialGenerate}
              disabled={!canGenerate}
              className={`inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white rounded-full shadow-sm transition-all duration-300 ease-in-out
                ${canGenerate ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              <SparklesIcon />
              {appState.status === AppStatus.LOADING ? t('generatingButton') : t('generateButton')}
            </button>
          </div>

          {appState.status === AppStatus.ERROR && (
            <div className="text-center text-red-600 bg-red-100 border border-red-400 p-3 rounded-lg mb-6">
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
          />
        </div>
      </main>
      <Footer />
      <ErrorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} message={modalMessage} />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
