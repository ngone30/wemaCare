/*
IMPORTANT NOTICE: DO NOT REMOVE
./src/api/chat-service.ts
If the user wants to use AI to generate text, answer questions, or analyze images you can use the functions defined in this file to communicate with the OpenAI, Anthropic, and Grok APIs.
*/
import { AIMessage, AIRequestOptions, AIResponse } from "../types/ai";
import { getAnthropicClient } from "./anthropic";
import { getOpenAIClient } from "./openai";
import { getGrokClient } from "./grok";
import { SymptomInput } from "../types/healthcare";

/**
 * Get a text response from Anthropic
 * @param messages - The messages to send to the AI
 * @param options - The options for the request
 * @returns The response from the AI
 */
export const getAnthropicTextResponse = async (
  messages: AIMessage[],
  options?: AIRequestOptions,
): Promise<AIResponse> => {
  try {
    const client = getAnthropicClient();
    const defaultModel = "claude-3-5-sonnet-20240620";

    const response = await client.messages.create({
      model: options?.model || defaultModel,
      messages: messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      max_tokens: options?.maxTokens || 2048,
      temperature: options?.temperature || 0.7,
    });

    // Handle content blocks from the response
    const content = response.content.reduce((acc, block) => {
      if ("text" in block) {
        return acc + block.text;
      }
      return acc;
    }, "");

    return {
      content,
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      },
    };
  } catch (error) {
    console.error("Anthropic API Error:", error);
    throw error;
  }
};

/**
 * Get a simple chat response from Anthropic
 * @param prompt - The prompt to send to the AI
 * @returns The response from the AI
 */
export const getAnthropicChatResponse = async (prompt: string): Promise<AIResponse> => {
  return await getAnthropicTextResponse([{ role: "user", content: prompt }]);
};

/**
 * Get a text response from OpenAI
 * @param messages - The messages to send to the AI
 * @param options - The options for the request
 * @returns The response from the AI
 */
export const getOpenAITextResponse = async (messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> => {
  try {
    const client = getOpenAIClient();
    const defaultModel = "gpt-4o"; //accepts images as well, use this for image analysis

    const response = await client.chat.completions.create({
      model: options?.model || defaultModel,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 2048,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

/**
 * Get a simple chat response from OpenAI
 * @param prompt - The prompt to send to the AI
 * @returns The response from the AI
 */
export const getOpenAIChatResponse = async (prompt: string): Promise<AIResponse> => {
  return await getOpenAITextResponse([{ role: "user", content: prompt }]);
};

/**
 * Get a text response from Grok
 * @param messages - The messages to send to the AI
 * @param options - The options for the request
 * @returns The response from the AI
 */
export const getGrokTextResponse = async (messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> => {
  try {
    const client = getGrokClient();
    const defaultModel = "grok-3-beta";

    const response = await client.chat.completions.create({
      model: options?.model || defaultModel,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 2048,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error("Grok API Error:", error);
    throw error;
  }
};

/**
 * Get a simple chat response from Grok
 * @param prompt - The prompt to send to the AI
 * @returns The response from the AI
 */
export const getGrokChatResponse = async (prompt: string): Promise<AIResponse> => {
  return await getGrokTextResponse([{ role: "user", content: prompt }]);
};

/**
 * Get enhanced healthcare recommendations considering medical history
 */
export const getEnhancedHealthcareRecommendations = async (
  symptoms: SymptomInput[],
  analysis: string,
  medicalHistory?: any,
  language: string = 'en'
): Promise<{
  doctors: any[];
  hospitals: any[];
  mentalHealthSupport: boolean;
  recommendations: string[];
}> => {
  try {
    const symptomTexts = symptoms.map(s => s.content).join('. ');
    
    const prompt = `As an advanced AI healthcare assistant for African healthcare systems, analyze these symptoms and medical history to provide comprehensive recommendations:

CURRENT SYMPTOMS: ${symptomTexts}

MEDICAL HISTORY:
- Previous conditions: ${medicalHistory?.medicalConditions?.join(', ') || 'None listed'}
- Current medications: ${medicalHistory?.medications?.join(', ') || 'None listed'}
- Allergies: ${medicalHistory?.allergies?.join(', ') || 'None listed'}
- Age: ${medicalHistory?.dateOfBirth ? new Date().getFullYear() - new Date(medicalHistory.dateOfBirth).getFullYear() : 'Not provided'}
- Blood type: ${medicalHistory?.bloodType || 'Not provided'}

ANALYSIS: ${analysis}

TARGET LANGUAGE: ${language}

Please provide recommendations in JSON format:
{
  "mentalHealthSupport": boolean (true if symptoms suggest mental health concerns),
  "recommendedSpecialties": ["list of medical specialties needed"],
  "urgencyLevel": "low|moderate|high|critical",
  "culturalConsiderations": ["considerations for African healthcare context"],
  "languageSpecificAdvice": "advice in target language if not English",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ]
}

Consider:
1. Mental health indicators (depression, anxiety, trauma, stress)
2. Chronic disease management common in Africa
3. Cultural sensitivity and traditional medicine integration
4. Accessibility of healthcare in African contexts
5. Language barriers and communication needs
6. Economic considerations for treatment options
7. Infectious disease patterns in Africa
8. Nutritional and environmental factors`;

    const response = await getOpenAITextResponse([{ role: "user", content: prompt }]);
    
    try {
      const analysis = JSON.parse(response);
      
      // Mock enhanced recommendations based on analysis
      return {
        doctors: [],
        hospitals: [],
        mentalHealthSupport: analysis.mentalHealthSupport || false,
        recommendations: analysis.recommendations || []
      };
    } catch {
      return {
        doctors: [],
        hospitals: [],
        mentalHealthSupport: false,
        recommendations: ['Consult with a healthcare professional for proper evaluation']
      };
    }
  } catch (error) {
    console.error('Enhanced healthcare recommendations error:', error);
    return {
      doctors: [],
      hospitals: [],
      mentalHealthSupport: false,
      recommendations: ['Unable to provide recommendations at this time']
    };
  }
};
