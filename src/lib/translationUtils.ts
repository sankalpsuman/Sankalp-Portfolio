import { GoogleGenAI } from "@google/genai";
import { generateContentWithFallback } from "../services/geminiClientFallback";

interface TranslatableFlat {
  [key: string]: string;
}

/**
 * Flattens all eligible string fields of an object into a key-value record of strings.
 * Excludes identifiers, URLs, images, dates, order, etc.
 */
export function flattenTranslatable(obj: any, prefix = ''): TranslatableFlat {
  const result: TranslatableFlat = {};
  if (!obj || typeof obj !== 'object') return result;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;

    // Skip fields that don't need translations
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('id') ||
      lowerKey.includes('url') ||
      lowerKey.includes('link') ||
      lowerKey.includes('image') ||
      lowerKey.includes('email') ||
      lowerKey.includes('phone') ||
      lowerKey.includes('color') ||
      lowerKey.includes('icon') ||
      lowerKey.includes('date') ||
      lowerKey.includes('techstack') ||
      lowerKey.includes('logo') ||
      lowerKey === 'order' ||
      lowerKey === 'publishedat' ||
      lowerKey === 'createdat' ||
      lowerKey === 'translations' ||
      lowerKey === 'password' ||
      lowerKey === 'username' ||
      lowerKey === 'role' && (val === 'admin' || val === 'user')
    ) {
      continue;
    }

    if (typeof val === 'string' && val.trim().length > 1) {
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        result[path] = val;
      }
    } else if (Array.isArray(val)) {
      val.forEach((item, index) => {
        if (typeof item === 'string' && item.trim().length > 1) {
          result[`${path}.${index}`] = item;
        }
      });
    } else if (typeof val === 'object' && val !== null) {
      Object.assign(result, flattenTranslatable(val, path));
    }
  }

  return result;
}

/**
 * Reconstructs a nested object from flat key-value paths of a specific language.
 */
export function unflattenTranslatable(flatObj: Record<string, string>): any {
  const result: any = {};
  for (const path of Object.keys(flatObj)) {
    const val = flatObj[path];
    const parts = path.split('.');
    let current = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      const isNextArray = nextPart !== undefined && !isNaN(Number(nextPart));

      if (i === parts.length - 1) {
        current[part] = val;
      } else {
        if (current[part] === undefined) {
          current[part] = isNextArray ? [] : {};
        }
        current = current[part];
      }
    }
  }
  return result;
}

/**
 * Automatically translates flat key-value text maps into Hindi, French, and German.
 */
export async function translateContent(flatContent: Record<string, string>): Promise<{ [lang: string]: any }> {
  if (Object.keys(flatContent).length === 0) {
    return { hi: {}, fr: {}, de: {} };
  }

  // 1. Try secure backend first
  try {
    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: flatContent }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.hi && data.fr && data.de) {
        // Unflatten each language
        return {
          hi: unflattenTranslatable(data.hi),
          fr: unflattenTranslatable(data.fr),
          de: unflattenTranslatable(data.de),
        };
      }
    }
  } catch (error) {
    console.warn('[Translation Client] Backend translator failed or unreachable, trying client fallback...', error);
  }

  // 2. Client fallback
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!clientKey) {
    console.warn('[Translation Client] No Gemini API Key configured for client translations.');
    return { hi: {}, fr: {}, de: {} };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: clientKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const systemPrompt = `You are a professional, high-end translation agent for a software QA & AI Engineering portfolio.
Translate the provided key-value pairs into Hindi (hi), French (fr), and German (de).
Return ONLY valid JSON.
Input: ${JSON.stringify(flatContent, null, 2)}`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT" as any,
          properties: {
            hi: { type: "OBJECT" as any },
            fr: { type: "OBJECT" as any },
            de: { type: "OBJECT" as any }
          },
          required: ["hi", "fr", "de"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      hi: unflattenTranslatable(data.hi || {}),
      fr: unflattenTranslatable(data.fr || {}),
      de: unflattenTranslatable(data.de || {}),
    };
  } catch (error) {
    console.error('[Translation Client] Client-side translation generation failed:', error);
    return { hi: {}, fr: {}, de: {} };
  }
}

/**
 * Efficiently translates multiple documents in a single batched API call to minimize quota exhaustion.
 */
export async function bulkAutoTranslateDocuments<T extends object>(documents: T[]): Promise<(T & { translations?: Record<string, any> })[]> {
  if (!documents || documents.length === 0) return [];
  
  try {
    const batchedFlat: TranslatableFlat = {};
    
    // 1. Accumulate all translatable fields from all documents with a unique prefix
    documents.forEach((doc, idx) => {
      const flat = flattenTranslatable(doc);
      Object.keys(flat).forEach(key => {
        batchedFlat[`doc_${idx}_${key}`] = flat[key];
      });
    });

    if (Object.keys(batchedFlat).length === 0) {
      return documents;
    }

    console.log(`[Translation utility] Bulk auto-translating ${documents.length} documents (${Object.keys(batchedFlat).length} fields total).`);
    
    // 2. Perform ONE request for everything
    const translatedNests = await translateContent(batchedFlat);
    
    // 3. Re-map the results back to the original documents
    return documents.map((doc, idx) => {
      const prefix = `doc_${idx}_`;
      const translations: Record<string, any> = { ...((doc as any).translations || {}) };
      
      ['hi', 'fr', 'de'].forEach(lang => {
        const langData = translatedNests[lang] || {};
        const docLangData = langData[`doc_${idx}`] || {};
        translations[lang] = {
          ...(translations[lang] || {}),
          ...docLangData
        };
      });

      return {
        ...doc,
        translations
      };
    });
  } catch (error) {
    console.error('[Translation utility] Bulk auto-translation failed:', error);
    return documents;
  }
}

/**
 * Automates document translation generation.
 * Generates translations flag-set content and updates the translations dictionary.
 */
export async function autoTranslateDocument<T extends object>(data: T): Promise<T & { translations?: Record<string, any> }> {
  try {
    const flat = flattenTranslatable(data);
    if (Object.keys(flat).length === 0) {
      return data;
    }

    console.log('[Translation utility] Auto-translating active database fields:', Object.keys(flat));
    const translatedNests = await translateContent(flat);
    
    return {
      ...data,
      translations: {
        ...( (data as any).translations || {} ),
        hi: translatedNests.hi || {},
        fr: translatedNests.fr || {},
        de: translatedNests.de || {}
      }
    };
  } catch (error) {
    console.error('[Translation utility] Document auto-translation failed:', error);
    return data;
  }
}
