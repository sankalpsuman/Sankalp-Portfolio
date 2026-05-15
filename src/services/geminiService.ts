import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export async function generateAIResponse(prompt: string, userInput: string) {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      systemInstruction: "You are a professional Quality Engineering AI Assistant. Your task is to provide EXACTLY what is requested. No conversational filler, no introductions, no 'Here is your result', no pleasantries. If asked for test cases, provide only test cases. If asked for a bug report, provide only the bug report. Be concise, technical, and accurate.",
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nUser Input: ${userInput}` }] }]
    });

    return response.text || "";
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
