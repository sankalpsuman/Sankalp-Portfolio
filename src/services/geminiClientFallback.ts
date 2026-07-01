import { GoogleGenAI } from "@google/genai";

// Track exhausted or rate-limited models in the user session to bypass redundant slow calls
const exhaustedClientModels = new Set<string>();

/**
 * Shared client-side fallback model sequence.
 * Leverages the same rate-limiting detection and model-skipping mechanics as the backend
 * to provide maximum resilience in static hosting/fallback situations.
 */
export async function generateContentWithFallback(
  aiInstance: GoogleGenAI,
  params: any
): Promise<any> {
  const requestedModel = params.model || "gemini-3.5-flash";
  
  // Defined list of all the latest models in use from top (highest quality/pro) to low (lightest/flash)
  const latestModels = [
    "gemini-3.5-pro",
    "gemini-3.5-flash",
    "gemini-3.1-pro",
    "gemini-3.1-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash-image",
    "gemini-nano"
  ];

  let modelsToTry: string[] = [];
  
  // Always start with the requested model first if specified, to honor caller intent
  if (requestedModel && !latestModels.includes(requestedModel)) {
    modelsToTry.push(requestedModel);
  }
  
  // Add the latest models in strict descending order of capacity (top to low)
  for (const m of latestModels) {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  }

  // Filter out models that have already failed during the active user session
  modelsToTry = modelsToTry.filter((m) => {
    if (exhaustedClientModels.has(m)) {
      console.log(`[Gemini Client Fallback] Skipping previously exhausted model: ${m}`);
      return false;
    }
    return true;
  });

  // Fallback to trying everything if all are exhausted
  for (const m of Array.from(exhaustedClientModels)) {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  }

  console.log(`[Gemini Client Fallback] Scheduled model retry sequence (top to low): ${JSON.stringify(modelsToTry)}`);

  let lastError: any = null;

  for (const model of modelsToTry) {
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini Client Fallback] Inquiring model ${model} (attempt ${attempt}/${maxRetries})...`);
        const response = await aiInstance.models.generateContent({
          ...params,
          model,
        });
        console.log(`[Gemini Client Fallback] Success on model: ${model}`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const errStatus = err?.status || err?.statusCode;

        // Detect quota limits (429) or transient server errors (503)
        const isQuotaOrOverload =
          errStatus === 1014 || // some websocket or sandbox restrictions
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
        // This keeps developer tools and telemetry logs quiet and clean.
        console.log(
          `[Gemini Client Fallback Info] Model ${model} is currently rate-limited or busy (status: ${errStatus || "transient"}). Progressing to candidate fallback.`
        );

        if (isQuotaOrOverload) {
          console.log(`[Gemini Client Fallback] Quota/overload detected on ${model}. Adding to exhaustion list.`);
          exhaustedClientModels.add(model);
          break; // Exit retry loop and switch directly to next fallback model
        }

        const isTransient =
          isQuotaOrOverload ||
          errStatus === 504 ||
          errMsg.toLowerCase().includes("timeout") ||
          errMsg.toLowerCase().includes("gateway");

        if (!isTransient) {
          break; // Exit attempt loop for non-transient model configuration errors (e.g. invalid parameter)
        }

        // Delay retry
        if (attempt < maxRetries) {
          const delay = attempt * 1200;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content using all fallback candidates.");
}
