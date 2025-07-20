import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ar' | 'pt' | 'ru' | 'ja' | 'ko';

export interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
  availableLanguages: { code: Language; name: string; nativeName: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@wemacare_language';

export const availableLanguages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Language, name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de' as Language, name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh' as Language, name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar' as Language, name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'pt' as Language, name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru' as Language, name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja' as Language, name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko' as Language, name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && availableLanguages.find(lang => lang.code === savedLanguage)) {
        setCurrentLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.log('Error loading saved language:', error);
    }
  };

  const loadTranslations = async (language: Language) => {
    try {
      let translationData;
      switch (language) {
        case 'es':
          translationData = await import('../translations/es.json');
          break;
        case 'fr':
          translationData = await import('../translations/fr.json');
          break;
        case 'de':
          translationData = await import('../translations/de.json');
          break;
        case 'zh':
          translationData = await import('../translations/zh.json');
          break;
        case 'ar':
          translationData = await import('../translations/ar.json');
          break;
        case 'pt':
          translationData = await import('../translations/pt.json');
          break;
        case 'ru':
          translationData = await import('../translations/ru.json');
          break;
        case 'ja':
          translationData = await import('../translations/ja.json');
          break;
        case 'ko':
          translationData = await import('../translations/ko.json');
          break;
        default:
          translationData = await import('../translations/en.json');
      }
      setTranslations(translationData.default || translationData);
    } catch (error) {
      console.log('Error loading translations:', error);
      // Fallback to English
      const englishTranslations = await import('../translations/en.json');
      setTranslations(englishTranslations.default || englishTranslations);    }
  };

  const setLanguage = async (language: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      setCurrentLanguage(language);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    let result = typeof value === 'string' ? value : key;
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
      });
    }
    
    return result;
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}