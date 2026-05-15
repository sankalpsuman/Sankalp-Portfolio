import { GoogleGenAI } from "@google/genai";

export async function generateAIResponse(prompt: string, userInput: string) {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Please add it in Settings > Secrets.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nUser Input: ${userInput}` }] }],
      config: {
        systemInstruction: "You are a professional Quality Engineering AI Assistant. Your task is to provide EXACTLY what is requested. No conversational filler, no introductions, no 'Here is your result', no pleasantries. If asked for test cases, provide only test cases. If asked for a bug report, provide only the bug report. Be concise, technical, and accurate.",
      }
    });

    return response.text || "";
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
