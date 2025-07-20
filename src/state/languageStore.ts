import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translateBulkText, SUPPORTED_LANGUAGES } from '../api/translation-service';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageState {
  currentLanguage: Language;
  translations: Record<string, Record<string, string>>; // languageCode -> { originalText -> translatedText }
  isTranslating: boolean;
  
  // Actions
  setLanguage: (language: Language) => Promise<void>;
  translateTexts: (texts: string[]) => Promise<void>;
  getTranslation: (text: string) => string;
  clearTranslations: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: SUPPORTED_LANGUAGES[0], // Default to English
      translations: {},
      isTranslating: false,

      setLanguage: async (language: Language) => {
        set({ currentLanguage: language, isTranslating: true });
        
        // If switching to English, no need to translate
        if (language.code === 'en') {
          set({ isTranslating: false });
          return;
        }

        // Get all unique texts that need translation from the current app state
        const textsToTranslate = getCommonAppTexts();
        
        try {
          const existingTranslations = get().translations[language.code] || {};
          const newTexts = textsToTranslate.filter(text => !existingTranslations[text]);
          
          if (newTexts.length > 0) {
            const newTranslations = await translateBulkText(newTexts, language.name);
            
            set(state => ({
              translations: {
                ...state.translations,
                [language.code]: {
                  ...existingTranslations,
                  ...newTranslations
                }
              }
            }));
          }
        } catch (error) {
          console.error('Error translating texts:', error);
        } finally {
          set({ isTranslating: false });
        }
      },

      translateTexts: async (texts: string[]) => {
        const { currentLanguage } = get();
        
        if (currentLanguage.code === 'en') return;
        
        try {
          const existingTranslations = get().translations[currentLanguage.code] || {};
          const newTexts = texts.filter(text => !existingTranslations[text]);
          
          if (newTexts.length > 0) {
            const newTranslations = await translateBulkText(newTexts, currentLanguage.name);
            
            set(state => ({
              translations: {
                ...state.translations,
                [currentLanguage.code]: {
                  ...existingTranslations,
                  ...newTranslations
                }
              }
            }));
          }
        } catch (error) {
          console.error('Error translating texts:', error);
        }
      },

      getTranslation: (text: string): string => {
        const { currentLanguage, translations } = get();
        
        if (currentLanguage.code === 'en') return text;
        
        const languageTranslations = translations[currentLanguage.code];
        return languageTranslations?.[text] || text;
      },

      clearTranslations: () => {
        set({ translations: {} });
      }
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Common app texts that should be pre-translated
const getCommonAppTexts = (): string[] => [
  // Navigation
  'Home',
  'Symptoms',
  'Appointments',
  'Messages',
  'Profile',
  'Settings',
  
  // Common Actions
  'Back',
  'Save',
  'Cancel',
  'Edit',
  'Delete',
  'Share',
  'Send',
  'Call',
  'Video Call',
  
  // Home Screen
  'Welcome back',
  'How are you feeling today?',
  'Check Symptoms',
  'Get AI recommendations',
  'Medical QR Code',
  'Show QR',
  'Hide QR',
  'Share Card',
  'Quick Actions',
  'Upcoming Appointments',
  'Recent Messages',
  'Health Tips',
  'Stay Hydrated',
  
  // Symptoms
  'Describe Your Symptoms',
  'Add your symptoms using text, voice, or images',
  'Gallery',
  'Camera',
  'Voice',
  'Type your symptoms here...',
  'Get AI Recommendations',
  'Analyzing...',
  
  // Appointments
  'total appointments',
  'Upcoming',
  'Past',
  'All',
  'Confirmed',
  'Pending',
  'Completed',
  'Cancelled',
  
  // Messages
  'conversations',
  'Start a conversation',
  'Type a message...',
  'Send a message to',
  'about your appointment or health concerns',
  
  // Profile
  'Medical Profile',
  'Your health information',
  'Full Name',
  'Email',
  'Date of Birth',
  'Blood Type',
  'Allergies',
  'Medications',
  'Medical Conditions',
  'Emergency Contact',
  'Insurance',
  
  // Settings
  'Account',
  'View Profile',
  'Edit Profile',
  'Privacy & Security',
  'Notifications',
  'Push Notifications',
  'Email Notifications',
  'Security',
  'Biometric Authentication',
  'Change Password',
  'Data & Privacy',
  'Export My Data',
  'Data Sharing',
  'Support',
  'Help & FAQ',
  'Contact Support',
  'About WemaCARE',
  'Sign Out',
  'Delete Account',
  
  // Auth
  'Sign In',
  'Sign Up',
  'Create Account',
  'Enter your email',
  'Enter your password',
  'Enter your full name',
  'Loading...',
  'Welcome back',
  'Create your account to get started',
  
  // Common phrases
  'Health Status: Good',
  'Emergency: Call 911',
  'All rights reserved',
  'Your AI-powered healthcare companion',
  'Secure',
  '24/7 Health',
  'Expert Care',
  'AI Insights'
];