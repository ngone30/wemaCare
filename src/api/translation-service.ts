import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY || '');

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  context?: string;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  targetLanguage: string;
}

export const translateText = async ({
  text,
  targetLanguage,
  context = "healthcare mobile app"
}: TranslationRequest): Promise<TranslationResponse> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `Translate the following text to ${targetLanguage}. 
Context: This is for a ${context}.
Keep medical terminology accurate and maintain the same tone and formatting.
Only return the translated text, nothing else.

Text to translate: "${text}"`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.text().trim();
    
    return {
      originalText: text,
      translatedText,
      targetLanguage
    };
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback to original text if translation fails
    return {
      originalText: text,
      translatedText: text,
      targetLanguage
    };
  }
};

export const translateBulkText = async (
  texts: string[],
  targetLanguage: string,
  context?: string
): Promise<Record<string, string>> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const textsToTranslate = texts.join('\n---SEPARATOR---\n');
    
    const prompt = `Translate the following texts to ${targetLanguage}. 
Context: This is for a healthcare mobile app.
Keep medical terminology accurate and maintain the same tone and formatting.
Return the translations in the same order, separated by ---SEPARATOR---.
Only return the translated texts, nothing else.

Texts to translate:
${textsToTranslate}`;

    const result = await model.generateContent(prompt);
    const translatedTexts = result.response.text().trim().split('---SEPARATOR---');
    
    const translations: Record<string, string> = {};
    texts.forEach((originalText, index) => {
      translations[originalText] = translatedTexts[index]?.trim() || originalText;
    });
    
    return translations;
  } catch (error) {
    console.error('Bulk translation error:', error);
    // Fallback to original texts if translation fails
    const fallback: Record<string, string> = {};
    texts.forEach(text => {
      fallback[text] = text;
    });
    return fallback;
  }
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' }
];