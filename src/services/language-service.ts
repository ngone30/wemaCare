import { getOpenAITextResponse } from '../api/chat-service';
import { AIMessage } from '../types/ai';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Universal' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', region: 'East Africa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', region: 'Ethiopia' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬', region: 'West Africa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬', region: 'Nigeria' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬', region: 'Nigeria' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', region: 'South Africa' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦', region: 'South Africa' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', region: 'South Africa' },
  { code: 'st', name: 'Sotho', nativeName: 'Sesotho', flag: '🇱🇸', region: 'Southern Africa' },
  { code: 'tn', name: 'Tswana', nativeName: 'Setswana', flag: '🇧🇼', region: 'Botswana' },
  { code: 'or', name: 'Oromo', nativeName: 'Afaan Oromoo', flag: '🇪🇹', region: 'Ethiopia' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇷', region: 'Eritrea/Ethiopia' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼', region: 'Rwanda' },
  { code: 'lg', name: 'Luganda', nativeName: 'Luganda', flag: '🇺🇬', region: 'Uganda' },
  { code: 'ak', name: 'Akan/Twi', nativeName: 'Akan', flag: '🇬🇭', region: 'Ghana' },
  { code: 'ff', name: 'Fulfulde', nativeName: 'Fulfulde', flag: '🇳🇪', region: 'West Africa' },
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof', flag: '🇸🇳', region: 'Senegal' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇪🇬', region: 'North Africa' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'Francophone Africa' }
];

interface TranslationCache {
  [key: string]: { [language: string]: string };
}

class LanguageService {
  private currentLanguage: string = 'en';
  private translationCache: TranslationCache = {};

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setCurrentLanguage(languageCode: string): void {
    if (SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode)) {
      this.currentLanguage = languageCode;
    }
  }

  getLanguageByCode(code: string): LanguageOption | undefined {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    // Return original text if target is English or same as current
    if (targetLanguage === 'en' || targetLanguage === this.currentLanguage) {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}_${targetLanguage}`;
    if (this.translationCache[cacheKey]) {
      return this.translationCache[cacheKey][targetLanguage];
    }

    try {
      const targetLang = this.getLanguageByCode(targetLanguage);
      if (!targetLang) {
        throw new Error(`Unsupported language: ${targetLanguage}`);
      }

      const messages: AIMessage[] = [
        {
          role: "user",
          content: `Translate the following medical/healthcare text to ${targetLang.name} (${targetLang.nativeName}). 
          
Important guidelines:
- Maintain medical accuracy and terminology
- Use culturally appropriate expressions
- Keep formatting and structure intact
- For African languages, use respectful and clear language appropriate for healthcare communication
- Preserve any medical terms that are commonly used in their English form
- If the text contains symptoms or medical conditions, ensure accuracy in translation

Text to translate:
"${text}"

Provide only the translation without any additional explanation.`
        }
      ];

      const response = await getOpenAITextResponse(messages, {
        temperature: 0.1, // Low temperature for consistency
        maxTokens: 2000
      });

      const translation = response.content.trim();
      
      // Cache the translation
      if (!this.translationCache[cacheKey]) {
        this.translationCache[cacheKey] = {};
      }
      this.translationCache[cacheKey][targetLanguage] = translation;

      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  async translateMedicalTerms(terms: string[], targetLanguage: string): Promise<{ [key: string]: string }> {
    if (targetLanguage === 'en') {
      const result: { [key: string]: string } = {};
      terms.forEach(term => result[term] = term);
      return result;
    }

    try {
      const targetLang = this.getLanguageByCode(targetLanguage);
      if (!targetLang) {
        throw new Error(`Unsupported language: ${targetLanguage}`);
      }

      const messages: AIMessage[] = [
        {
          role: "user",
          content: `Translate these medical terms to ${targetLang.name} (${targetLang.nativeName}). 
          
Provide accurate medical translations that would be understood by healthcare professionals and patients in ${targetLang.region}.

Terms: ${terms.join(', ')}

Format the response as JSON:
{
  "term1": "translation1",
  "term2": "translation2"
}`
        }
      ];

      const response = await getOpenAITextResponse(messages, {
        temperature: 0.1,
        maxTokens: 1500
      });

      return JSON.parse(response.content);
    } catch (error) {
      console.error('Medical terms translation error:', error);
      const result: { [key: string]: string } = {};
      terms.forEach(term => result[term] = term);
      return result;
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const messages: AIMessage[] = [
        {
          role: "user",
          content: `Detect the language of this text. Choose from these African languages and return only the language code:

Supported codes: ${SUPPORTED_LANGUAGES.map(lang => `${lang.code} (${lang.name})`).join(', ')}

Text: "${text}"

Return only the language code (e.g., "sw", "ha", "yo", etc.). If unsure, return "en".`
        }
      ];

      const response = await getOpenAITextResponse(messages, {
        temperature: 0.1,
        maxTokens: 50
      });

      const detectedCode = response.content.trim().toLowerCase();
      
      // Validate the detected language code
      if (SUPPORTED_LANGUAGES.find(lang => lang.code === detectedCode)) {
        return detectedCode;
      }
      
      return 'en'; // Default to English if detection fails
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }

  getRegionalLanguages(region: string): LanguageOption[] {
    return SUPPORTED_LANGUAGES.filter(lang => 
      lang.region.toLowerCase().includes(region.toLowerCase()) || 
      lang.region === 'Universal'
    );
  }

  async getLocalizedMedicalAdvice(advice: string, languageCode: string, culturalContext?: string): Promise<string> {
    if (languageCode === 'en') {
      return advice;
    }

    try {
      const targetLang = this.getLanguageByCode(languageCode);
      if (!targetLang) {
        return advice;
      }

      const messages: AIMessage[] = [
        {
          role: "user",
          content: `Translate and culturally adapt this medical advice for ${targetLang.region} context in ${targetLang.name} (${targetLang.nativeName}).

Consider:
- Cultural sensitivities around health and medical treatment
- Traditional medicine integration where appropriate
- Family and community involvement in healthcare decisions
- Religious considerations if relevant
- Local healthcare system and accessibility

Original advice: "${advice}"

Additional context: ${culturalContext || 'General healthcare advice'}

Provide culturally appropriate translation that maintains medical accuracy while being sensitive to local customs and beliefs.`
        }
      ];

      const response = await getOpenAITextResponse(messages, {
        temperature: 0.3,
        maxTokens: 2000
      });

      return response.content.trim();
    } catch (error) {
      console.error('Localized medical advice error:', error);
      return advice;
    }
  }
}

export const languageService = new LanguageService();