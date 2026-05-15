import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export async function generateAIResponse(prompt: string, userInput: string) {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const fullPrompt = `${prompt}\n\nUser Input: ${userInput}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: fullPrompt
    });

    return response.text || "";
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
