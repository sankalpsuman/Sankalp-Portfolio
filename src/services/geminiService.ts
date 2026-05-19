import { GoogleGenAI } from "@google/genai";

export async function generateAIResponse(prompt: string, userInput: string) {
  // 1. Try the server-side proxy first (Preferred for security)
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, userInput }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.text || "";
    }
    
    // If we get here, the proxy returned an error (e.g. 500 or 404).
    // We'll proceed to client-side fallback if possible.
    const errorData = await response.json().catch(() => ({}));
    console.warn('Proxy call failed, checking for client-side key...', errorData);
  } catch (error) {
    console.warn('Proxy unreachable, checking for client-side key...');
  }

  // 2. Client-side Fallback (For static deployments like Vercel)
  // WARNING: Using API keys in the client exposes them to anyone visiting the site.
  // This is only used if the server-side proxy is unavailable.
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (clientKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey: clientKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await (ai as any).models.generateContent({
        model: "gemini-1.5-flash",
        contents: `${prompt}\n\nUser Input: ${userInput}`,
        config: {
          systemInstruction: `You are Sankalp's Advanced Quality Engineering AI Agent. Use EXTREME PRECISION and MINIMALISM.

STRICT OPERATIONAL RULES:
1. ONLY provide the internal content requested. NO introductions, NO "Here is...", NO "Certainly!", NO polite closing.
2. If the user asks for a SPECIFIC field (e.g., "URL", "Repo", "Status"), respond with ONLY that string and nothing else.
3. If providing a broader report, use professional Markdown (Tables for test cases).
4. Do NOT hallucinate conversational context. 
5. TONE: 100% technical and target-oriented.
6. FORMATTING: Use remark-gfm enhanced tables but keep them dense.`
        }
      });
      
      return response.text || "";
    } catch (error) {
      console.error('Client-side Gemini Error:', error);
      throw new Error('AI Generation failed. Ensure VITE_GEMINI_API_KEY is valid.');
    }
  }

  throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY on the server or VITE_GEMINI_API_KEY in the client.');
}

export async function suggestImageKeywords(title: string, excerpt: string) {
  // 1. Try server-side proxy
  try {
    const response = await fetch('/api/ai/suggest-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, excerpt }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.keywords || "technology,software,business";
    }
  } catch (error) {
    console.warn('Proxy unreachable for keywords, checking client fallback...');
  }

  // 2. Client-side fallback
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (clientKey) {
    try {
      const ai = new GoogleGenAI({ 
        apiKey: clientKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const response = await (ai as any).models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Provide exactly 3 keywords separated by commas that describe a professional, high-quality technical or business-related image for this blog post.
        Title: ${title}
        Excerpt: ${excerpt}
        Keywords:`,
        config: {
          systemInstruction: "You are an expert editor for a high-end tech portfolio blog. You specialize in picking perfect stock photo keywords for software engineering, QA, and AI content. Output ONLY the 3 keywords, nothing else.",
        }
      });
      return response.text?.trim().replace(/\.$/, '') || "technology,software,business";
    } catch (error) {
      console.error('Client-side Keyword Suggestion Error:', error);
    }
  }

  return "technology,software,business";
}

