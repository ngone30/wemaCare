import { useLanguageStore } from '../state/languageStore';

export const useTranslation = () => {
  const { getTranslation, currentLanguage, isTranslating, setLanguage, translateTexts } = useLanguageStore();

  const t = (text: string): string => {
    return getTranslation(text);
  };

  return {
    t,
    currentLanguage,
    isTranslating,
    setLanguage,
    translateTexts
  };
};