import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { useTranslations } from '../hooks/useTranslations';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
  const { t } = useTranslations();
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full"
          aria-label={t('modalCloseAria')}
        >
          <CloseIcon />
        </button>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('modalTitle')}</h3>
        <p className="text-gray-600 text-sm">{message}</p>
        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 bg-gray-900 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-gray-700 transition"
        >
          {t('modalOkButton')}
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;