import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

/**
 * Lazily retrieves the centralized GoogleGenAI client singleton.
 * Prevents crash on server startup if environment variables are not yet injected.
 */
export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required on the server but was not found.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Formats complex error objects (with non-enumerable fields like message, status, stack)
 * into highly descriptive strings to avoid empty 'Error {}' logs or cryptically failed operations.
 */
export function formatErrorForLog(error: any): string {
  if (!error) return "Unknown Error";
  const name = error.name || "Error";
  const message = error.message || String(error);
  const status = error.status || error.statusCode || error.code || "";
  const stack = error.stack || "";
  return `[Gemini Backend Error] ${name}${status ? ` (Status: ${status})` : ""}: ${message}${
    stack ? `\nStack trace:\n${stack}` : ""
  }`;
}

const exhaustedModels = new Set<string>();

/**
 * Shared fallback model sequence to ensure continuous availability even during high-traffic overload.
 * Automatically handles retry delays for common transient status codes (429, 503).
 */
export async function generateContentWithFallback(params: any): Promise<any> {
  const isVercel = !!process.env.VERCEL;
  
  // Active timeout threshold of 55 seconds (safe below the configured 60-second maxDuration in vercel.json)
  const apiTimeoutMs = 55000;

  const coreGenerationPromise = (async () => {
    const ai = getGeminiClient();
    const requestedModel = params.model || "gemini-3.5-flash";
    let modelsToTry = [requestedModel];
    
    const fallbackPool = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview", "gemini-flash-latest"];
    for (const m of fallbackPool) {
      if (m !== requestedModel && !modelsToTry.includes(m)) {
        modelsToTry.push(m);
      }
    }

    // Rearrange sequence so already exhausted models are demoted immediately 
    // to bypass slow, redundant API call attempts on spent quota buckets.
    modelsToTry = modelsToTry.filter(m => {
      if (exhaustedModels.has(m)) {
        console.log(`[Gemini Centralized] Skipping model ${m} as it was previously marked as exhausted or rate-limited.`);
        return false;
      }
      return true;
    });

    // Just in case everything else fails, we append exhausted models at the very end.
    for (const m of Array.from(exhaustedModels)) {
      if (!modelsToTry.includes(m)) {
        modelsToTry.push(m);
      }
    }

    console.log(`[Gemini Centralized] Scheduled models fallback sequence: ${JSON.stringify(modelsToTry)}`);

    let lastError: any = null;

    for (const model of modelsToTry) {
      const maxRetries = 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[Gemini Centralized] Calling generateContent with model: ${model} (attempt ${attempt}/${maxRetries})`);
          const response = await ai.models.generateContent({
            ...params,
            model,
          });
          console.log(`[Gemini Centralized] SUCCESS with model: ${model} (attempt ${attempt}/${maxRetries})`);
          return response;
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          const errStatus = err?.status || err?.statusCode;
          console.warn(
            `[Gemini Centralized Info] Model ${model} failed on attempt ${attempt}. Description: ${errMsg}. Code: ${errStatus || "none"}`
          );

          const isQuotaOrOverload = 
            errStatus === 429 ||
            errStatus === 503 ||
            errMsg.includes("429") ||
            errMsg.includes("503") ||
            errMsg.toLowerCase().includes("quota") ||
            errMsg.toLowerCase().includes("rate limit") ||
            errMsg.toLowerCase().includes("resource_exhausted") ||
            errMsg.toLowerCase().includes("overloaded") ||
            errMsg.toLowerCase().includes("unavailable") ||
            errMsg.toLowerCase().includes("high demand");

          if (isQuotaOrOverload) {
            console.log(`[Gemini Centralized] Quota or overload detected for model ${model}. Moving it to exhausted list and transitioning immediately to fallback.`);
            exhaustedModels.add(model);
            break; // Break the retry loop and try the next model
          }

          const isTransient =
            errStatus === 429 ||
            errStatus === 503 ||
            errMsg.includes("429") ||
            errMsg.includes("503") ||
            errMsg.toLowerCase().includes("unavailable") ||
            errMsg.toLowerCase().includes("high demand") ||
            errMsg.toLowerCase().includes("overloaded") ||
            errMsg.toLowerCase().includes("rate limit") ||
            errMsg.toLowerCase().includes("quota");

          // Do not perform retry-delay loops for non-transient errors
          if (!isTransient) {
            break;
          }

          if (attempt < maxRetries) {
            const delay = attempt * 1200;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    }

    throw lastError || new Error("Failed to generate content after attempting models and retries");
  })();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            "Gemini AI generation exceeded the maximum API processing limit (55 seconds). Please try again later or optimize your raw portfolio content."
          )
        ),
      apiTimeoutMs
    )
  );

  return Promise.race([coreGenerationPromise, timeoutPromise]);
}

/**
 * Standard utility to respond with structured JSON error payloads for Express API handlers.
 */
export function handleRouteError(res: any, error: any, context: string) {
  const logMessage = formatErrorForLog(error);
  console.error(`[Route Error] Exception occurred in '${context}':`, logMessage);
  
  const clientMessage = error?.message || "Internal server error during AI operations";
  return res.status(500).json({
    success: false,
    error: `API Call Failed during ${context}: ${clientMessage}`
  });
}
