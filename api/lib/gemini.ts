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
  
  // Set up optimized parameters to work with Vercel's strict timeout limits
  let optimizedParams = { ...params };
  if (isVercel && optimizedParams.config && optimizedParams.config.responseSchema) {
    console.log("[Gemini Centralized] Vercel environment detected. Stripping complex responseSchema to bypass slow grammar-constrained decoding latency.");
    
    const originalSchema = optimizedParams.config.responseSchema;
    const configWithNoSchema = { ...optimizedParams.config };
    delete configWithNoSchema.responseSchema;
    optimizedParams.config = configWithNoSchema;
    
    const schemaInstructions = `\n\nCRITICAL OUTLINE FOR OUTPUT JSON:
You MUST output standard JSON matching this exact key structure. Ensure NO keys are missing from the primary root properties, fields are populated cleanly without placeholder tags, and values conform to the following schema definition:
${JSON.stringify(originalSchema, null, 2)}

Respond with standard JSON matching this schema format. Return ONLY raw JSON starting with "{" and ending with "}". No markdown formatting, no comments, and no conversational prefixes or suffixes.`;

    if (typeof optimizedParams.contents === "string") {
      optimizedParams.contents = optimizedParams.contents + "\n" + schemaInstructions;
    } else if (optimizedParams.contents && Array.isArray(optimizedParams.contents)) {
      optimizedParams.contents = [...optimizedParams.contents, { text: schemaInstructions }];
    } else if (optimizedParams.contents && typeof optimizedParams.contents === "object") {
      if (optimizedParams.contents.parts && Array.isArray(optimizedParams.contents.parts)) {
        optimizedParams.contents.parts = [...optimizedParams.contents.parts, { text: schemaInstructions }];
      } else {
        optimizedParams.contents = { parts: [{ text: JSON.stringify(optimizedParams.contents) }, { text: schemaInstructions }] };
      }
    }
  }

  // Active timeout threshold. Vercel Hobby limits serverless functions to 10 seconds.
  // We set a dynamic 8.2-second limit on Vercel so that our Promise.race rejects gracefully
  // before Vercel terminates the container, allowing us to return a nice custom JSON error.
  const apiTimeoutMs = isVercel ? 8200 : 55000;
  let timeoutId: any = null;

  const coreGenerationPromise = (async () => {
    const ai = getGeminiClient();
    const requestedModel = optimizedParams.model || "gemini-3.5-flash";
    
    // Stable, high-quota, production-ready models to prioritize on free tiers
    const primaryStableModels = ["gemini-3.1-flash-lite", "gemini-flash-latest"];
    
    // If the requested model is gemini-3.5-flash or another highly restricted preview model,
    // or if we are executing within a Vercel Serverless Function, we prioritize stable,
    // low-latency models first to guarantee execution completes within Vercel's absolute timeout.
    const isHighQuotaRisk = requestedModel.includes("gemini-3.5");
    
    let modelsToTry: string[] = [];
    if (isHighQuotaRisk || isVercel) {
      modelsToTry = [...primaryStableModels];
      if (!modelsToTry.includes(requestedModel)) {
        modelsToTry.push(requestedModel);
      }
    } else {
      modelsToTry = [requestedModel];
      for (const m of primaryStableModels) {
        if (!modelsToTry.includes(m)) {
          modelsToTry.push(m);
        }
      }
    }
    
    // Add other fallback models to ensure broad coverage
    const fallbackPool = ["gemini-flash-latest", "gemini-3.1-pro-preview"];
    for (const m of fallbackPool) {
      if (!modelsToTry.includes(m)) {
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
      // In Vercel, minimize retries to 1 per model to avoid running out of our strict 10s timeout
      const maxRetries = isVercel ? 1 : 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[Gemini Centralized] Calling generateContent with model: ${model} (attempt ${attempt}/${maxRetries})`);
          const response = await ai.models.generateContent({
            ...optimizedParams,
            model,
          });
          console.log(`[Gemini Centralized] SUCCESS with model: ${model} (attempt ${attempt}/${maxRetries})`);
          return response;
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          const errStatus = err?.status || err?.statusCode;
          
          // Detect quota limits (429) or transient server errors (503)
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

          // Suppress raw error telemetry log dumps during recovery transitions.
          // This keeps standard out clean from false alarm error detections.
          console.log(
            `[Gemini Centralized Info] Model ${model} is currently rate-limited or busy (status: ${errStatus || "transient"}). Progressing to candidate fallback.`
          );

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
            const delay = isVercel ? 100 : attempt * 1200;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    }

    throw lastError || new Error("Failed to generate content after attempting models and retries");
  })();

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () =>
        reject(
          new Error(
            "Gemini AI generation exceeded the maximum API processing limit (55 seconds). Please try again later or optimize your raw portfolio content."
          )
        ),
      apiTimeoutMs
    );
  });

  // Attach a catch handler to the core promise to prevent unhandled rejection crashes if it fails after timeout
  coreGenerationPromise.catch((err) => {
    console.warn("[Gemini Background Guard] Silent catch triggered for a promise that lost the race:", err?.message || err);
  });

  try {
    const result = await Promise.race([coreGenerationPromise, timeoutPromise]);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    return result;
  } catch (err) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    throw err;
  }
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
