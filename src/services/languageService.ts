export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇪🇬' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'so', name: 'Somali', nativeName: 'Af-Soomaali', flag: '🇸🇴' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼' },
  { code: 'rn', name: 'Kirundi', nativeName: 'Kirundi', flag: '🇧🇮' },
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof', flag: '🇸🇳' },
  { code: 'bm', name: 'Bambara', nativeName: 'Bamanankan', flag: '🇲🇱' },
  { code: 'ff', name: 'Fulfulde', nativeName: 'Fulfulde', flag: '🇳🇪' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇷' }
];

export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

export const translateText = async (text: string, targetLanguage: string, sourceLanguage: string = 'en'): Promise<string> => {
  try {
    // This would integrate with a translation service like Google Translate or OpenAI
    // For now, we'll simulate translation for demo purposes
    if (targetLanguage === sourceLanguage) {
      return text;
    }

    // Simulate common medical translations for demonstration
    const commonTranslations: Record<string, Record<string, string>> = {
      sw: { // Swahili
        'Symptoms': 'Dalili',
        'Doctor': 'Daktari',
        'Hospital': 'Hospitali',
        'Medicine': 'Dawa',
        'Pain': 'Maumivu',
        'Fever': 'Homa',
        'Headache': 'Maumivu ya kichwa',
        'Appointment': 'Miadi',
        'Health': 'Afya',
        'Mental Health': 'Afya ya Akili'
      },
      ar: { // Arabic
        'Symptoms': 'أعراض',
        'Doctor': 'طبيب',
        'Hospital': 'مستشفى',
        'Medicine': 'دواء',
        'Pain': 'ألم',
        'Fever': 'حمى',
        'Headache': 'صداع',
        'Appointment': 'موعد',
        'Health': 'صحة',
        'Mental Health': 'الصحة النفسية'
      },
      ha: { // Hausa
        'Symptoms': 'Alamun',
        'Doctor': 'Likita',
        'Hospital': 'Asibiti',
        'Medicine': 'Magani',
        'Pain': 'Ciwo',
        'Fever': 'Zazzabi',
        'Headache': 'Ciwon kai',
        'Appointment': 'Alkawalin ganawar',
        'Health': 'Lafiya',
        'Mental Health': 'Lafiyar hankali'
      },
      yo: { // Yoruba
        'Symptoms': 'Àmì àìsàn',
        'Doctor': 'Dókítà',
        'Hospital': 'Ilé ìwòsàn',
        'Medicine': 'Òògùn',
        'Pain': 'Ìrora',
        'Fever': 'Ibà',
        'Headache': 'Orí róra',
        'Appointment': 'Ìpàdé',
        'Health': 'Ìlera',
        'Mental Health': 'Ìlera ọkàn'
      },
      fr: { // French
        'Symptoms': 'Symptômes',
        'Doctor': 'Médecin',
        'Hospital': 'Hôpital',
        'Medicine': 'Médicament',
        'Pain': 'Douleur',
        'Fever': 'Fièvre',
        'Headache': 'Mal de tête',
        'Appointment': 'Rendez-vous',
        'Health': 'Santé',
        'Mental Health': 'Santé mentale'
      }
    };

    const translations = commonTranslations[targetLanguage];
    if (translations && translations[text]) {
      return translations[text];
    }

    // For demonstration, return original text with language indicator
    return `[${targetLanguage.toUpperCase()}] ${text}`;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

export const detectLanguage = async (text: string): Promise<string> => {
  // Simple language detection based on common patterns
  // In a real app, this would use a proper language detection service
  
  if (/[أعراضطبيبمستشفى]/.test(text)) return 'ar';
  if (/[àáâãäåæçèéêëìíîïðñòóôõö]/.test(text)) return 'fr';
  if (/[dalili|daktari|hospitali]/.test(text.toLowerCase())) return 'sw';
  if (/[alamun|likita|asibiti]/.test(text.toLowerCase())) return 'ha';
  
  return 'en'; // Default to English
};

// Medical terminology translations
export const MEDICAL_TERMS = {
  en: {
    symptoms: 'Symptoms',
    diagnosis: 'Diagnosis',
    treatment: 'Treatment',
    medication: 'Medication',
    appointment: 'Appointment',
    emergency: 'Emergency',
    mentalHealth: 'Mental Health',
    therapy: 'Therapy',
    psychiatrist: 'Psychiatrist',
    psychologist: 'Psychologist',
    counseling: 'Counseling',
    depression: 'Depression',
    anxiety: 'Anxiety',
    stress: 'Stress'
  },
  sw: {
    symptoms: 'Dalili',
    diagnosis: 'Utambuzi',
    treatment: 'Matibabu',
    medication: 'Dawa',
    appointment: 'Miadi',
    emergency: 'Dharura',
    mentalHealth: 'Afya ya Akili',
    therapy: 'Tiba',
    psychiatrist: 'Daktari wa Akili',
    psychologist: 'Mtaalam wa Akili',
    counseling: 'Ushauri',
    depression: 'Unyogovu',
    anxiety: 'Wasiwasi',
    stress: 'Mkazo'
  },
  ar: {
    symptoms: 'أعراض',
    diagnosis: 'تشخيص',
    treatment: 'علاج',
    medication: 'دواء',
    appointment: 'موعد',
    emergency: 'طوارئ',
    mentalHealth: 'الصحة النفسية',
    therapy: 'علاج نفسي',
    psychiatrist: 'طبيب نفسي',
    psychologist: 'أخصائي نفسي',
    counseling: 'استشارة',
    depression: 'اكتئاب',
    anxiety: 'قلق',
    stress: 'ضغط نفسي'
  },
  ha: {
    symptoms: 'Alamun',
    diagnosis: 'Bincike',
    treatment: 'Magani',
    medication: 'Magani',
    appointment: 'Alkawalin ganawar',
    emergency: 'Gaggawa',
    mentalHealth: 'Lafiyar Hankali',
    therapy: 'Magani',
    psychiatrist: 'Likitan Hankali',
    psychologist: 'Masanin Hankali',
    counseling: 'Shawara',
    depression: 'Damuwa',
    anxiety: 'Damuwa',
    stress: 'Matsanancin hali'
  },
  yo: {
    symptoms: 'Àmì àìsàn',
    diagnosis: 'Ìwádìí àìsàn',
    treatment: 'Ìtọ́jú',
    medication: 'Òògùn',
    appointment: 'Ìpàdé',
    emergency: 'Ìpayà',
    mentalHealth: 'Ìlera Ọkàn',
    therapy: 'Ìtọ́jú ọkàn',
    psychiatrist: 'Dókítà ọkàn',
    psychologist: 'Amóye ọkàn',
    counseling: 'Ìmọ̀ràn',
    depression: 'Ìbànújẹ́',
    anxiety: 'Àníyàn',
    stress: 'Ìpọ́njú'
  }
};

export const getMedicalTerm = (term: keyof typeof MEDICAL_TERMS.en, language: string): string => {
  const terms = MEDICAL_TERMS[language as keyof typeof MEDICAL_TERMS];
  return terms?.[term] || MEDICAL_TERMS.en[term];
};