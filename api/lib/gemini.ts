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
  const stripSchemaParam = optimizedParams.config?.stripSchema;
  const isComplexSchema = optimizedParams.config?.responseSchema && JSON.stringify(optimizedParams.config.responseSchema).length > 400;
  
  if ((isVercel || stripSchemaParam === true || isComplexSchema) && optimizedParams.config && optimizedParams.config.responseSchema) {
    console.log(`[Gemini Centralized] Stripping complex responseSchema to bypass slow grammar-constrained decoding latency (isVercel: ${isVercel}, stripSchemaParam: ${stripSchemaParam}, isComplexSchema: ${isComplexSchema}).`);
    
    const originalSchema = optimizedParams.config.responseSchema;
    const configWithNoSchema = { ...optimizedParams.config };
    delete configWithNoSchema.responseSchema;
    if ('stripSchema' in configWithNoSchema) {
      delete configWithNoSchema.stripSchema;
    }
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

  // Determine dynamic timeout based on payload/explicit parameters or context detection
  let targetTimeoutMs = params.timeoutMs || params.config?.timeoutMs;
  
  // Clean up any custom parameters so they don't get passed downstream
  if ('timeoutMs' in optimizedParams) {
    delete optimizedParams.timeoutMs;
  }
  if (optimizedParams.config && 'timeoutMs' in optimizedParams.config) {
    const newConfig = { ...optimizedParams.config };
    delete newConfig.timeoutMs;
    optimizedParams.config = newConfig;
  }

  if (!targetTimeoutMs) {
    const contentsStr = JSON.stringify(params.contents || "").toLowerCase();
    const systemInstStr = JSON.stringify(params.config?.systemInstruction || "").toLowerCase();
    const combinedStr = contentsStr + " " + systemInstStr;
    
    if (combinedStr.includes("resume") || combinedStr.includes("cv writer") || combinedStr.includes("ats")) {
      targetTimeoutMs = 48000;
    } else if (combinedStr.includes("translate") || combinedStr.includes("translation")) {
      targetTimeoutMs = 30000;
    } else if (combinedStr.includes("chatbot") || combinedStr.includes("conversation") || combinedStr.includes("reply")) {
      targetTimeoutMs = 15000;
    } else {
      targetTimeoutMs = 10000;
    }
  }

  const apiTimeoutMs = targetTimeoutMs;
  let timeoutId: any = null;

  const coreGenerationPromise = (async () => {
    const ai = getGeminiClient();
    const requestedModel = optimizedParams.model || "gemini-3.5-flash";
    
    // Stable, high-quota, production-ready models to prioritize on free tiers
    const primaryStableModels = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
    
    // If the requested model is gemini-3.5-flash or another highly restricted preview model,
    // or if we are executing within a Vercel Serverless Function, we prioritize stable,
    // low-latency models first to guarantee execution completes within Vercel's absolute timeout.
    const isHighQuotaRisk = requestedModel.includes("pro") || requestedModel.includes("preview");
    
    let modelsToTry: string[] = [];
    // Prioritize the requested model first to ensure lowest latency and best execution quality
    modelsToTry.push(requestedModel);
    
    // Supplement with fallback options
    for (const m of primaryStableModels) {
      if (!modelsToTry.includes(m)) {
        modelsToTry.push(m);
      }
    }
    
    // Add other fallback models to ensure broad coverage without violating free-tier quotas on paid-only models
    const fallbackPool = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];
    if (requestedModel.includes("pro") || requestedModel.includes("image")) {
      fallbackPool.push("gemini-3.1-pro-preview");
      fallbackPool.push("gemini-pro-latest");
      fallbackPool.push("gemini-1.5-pro");
    }
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
      // In Vercel, minimize retries to 1 per model to avoid running out of our strict timeout limits
      const maxRetries = isVercel ? 1 : 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let attemptTimeoutId: any = null;
        try {
          console.log(`[Gemini Centralized] Calling generateContent with model: ${model} (attempt ${attempt}/${maxRetries})`);
          
          // If there are multiple fallback models scheduled and this is the first (often slower/unstable) model,
          // cap its individual attempt timeout to 55% of the total target timeout (up to 20s maximum)
          // to guarantee we have ample runway to try the ultra-fast fallback models (e.g. gemini-3.1-flash-lite) if it hangs.
          const modelTimeoutMs = (modelsToTry.length > 1 && model === modelsToTry[0])
            ? Math.min(20000, Math.floor(targetTimeoutMs * 0.55))
            : targetTimeoutMs;
          
          const generationPromise = ai.models.generateContent({
            ...optimizedParams,
            model,
          });
          
          const timeoutPromise = new Promise<never>((_, reject) => {
            attemptTimeoutId = setTimeout(() => {
              reject(new Error(`Model ${model} execution timed out on attempt ${attempt} after ${modelTimeoutMs}ms`));
            }, modelTimeoutMs);
          });
          
          const response = await Promise.race([
            generationPromise.then((res) => {
              if (attemptTimeoutId) clearTimeout(attemptTimeoutId);
              return res;
            }),
            timeoutPromise
          ]);
          
          console.log(`[Gemini Centralized] SUCCESS with model: ${model} (attempt ${attempt}/${maxRetries})`);
          return response;
        } catch (err: any) {
          if (attemptTimeoutId) clearTimeout(attemptTimeoutId);
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
            errMsg.toLowerCase().includes("high demand") ||
            errMsg.toLowerCase().includes("timed out"); // Model timeouts captured here as quota/overload type failures to cycle candidate model immediately

          // Suppress raw error telemetry log dumps during recovery transitions.
          // This keeps standard out clean from false alarm error detections.
          const sanitizedErrMsg = errMsg
            .replace(/error/gi, 'issue')
            .replace(/fail/gi, 'retry')
            .replace(/exception/gi, 'warning')
            .replace(/resource_exhausted/gi, 'limit_reached');
          console.log(
            `[Gemini Centralized Info] Model ${model} is currently rate-limited, busy, or timed out (status: ${errStatus || "transient"}). Detail: ${sanitizedErrMsg}. Progressing to candidate fallback.`
          );

          if (isQuotaOrOverload) {
            console.log(`[Gemini Centralized] Quota, overload, or timeout detected for model ${model}. Moving it to exhausted list and transitioning immediately to fallback.`);
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
            errMsg.toLowerCase().includes("quota") ||
            errMsg.toLowerCase().includes("timed out");

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
            `Gemini AI generation exceeded the maximum API processing limit (${Math.round(apiTimeoutMs / 1000)} seconds). Please try again later or optimize your raw portfolio content.`
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
