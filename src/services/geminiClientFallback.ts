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
  const requestedModel = params.model || "gemini-1.5-flash";
  
  // Stable, high-quota, production-ready models to prioritize on free tiers
  const primaryStableModels = [
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash",
  ];

  // If requested model is high quota risk, try more generous production-grade models first.
  const isHighQuotaRisk = requestedModel.includes("pro");

  let modelsToTry: string[] = [];
  if (isHighQuotaRisk) {
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

  // Robust candidate pool of other active models
  const fallbackPool = [
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
  ];

  for (const m of fallbackPool) {
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

  console.log(`[Gemini Client Fallback] Scheduled model retry sequence: ${JSON.stringify(modelsToTry)}`);

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
