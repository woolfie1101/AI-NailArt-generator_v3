import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/i18n/translations';

export const useTranslations = () => {
    const { language, setLanguage } = useLanguage();

    const t = (key: string, replacements?: { [key: string]: string | number }): string => {
        const keys = key.split('.');
        let text: any = translations[language];
        
        for (const k of keys) {
            text = text?.[k];
            if (text === undefined) {
                // Fallback to English if translation is missing in the current language
                let fallbackText: any = translations.en;
                for (const fk of keys) {
                    fallbackText = fallbackText?.[fk];
                }
                text = fallbackText || key;
                break; 
            }
        }

        if (typeof text !== 'string') {
            console.warn(`Translation for key '${key}' is not a string.`);
            return key;
        }

        if (replacements) {
            return Object.entries(replacements).reduce((acc, [k, v]) => {
                return acc.replace(new RegExp(`{${k}}`, 'g'), String(v));
            }, text);
        }

        return text;
    };

    return { t, setLanguage, language };
};
