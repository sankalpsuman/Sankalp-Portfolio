import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type SupportedLanguage = 'en' | 'hi' | 'fr' | 'de';

// Cache in memory: Map of 'originalText_targetLang' -> 'translatedText'
const memoryCache = new Map<string, string>();

/**
 * Synchronously checks memory and localStorage caches.
 * Returns the translation if cached, or null if a fetch is required.
 */
export function getCachedTranslationSync(text: string, targetLang: string): string | null {
  const trimmed = text?.trim() || '';
  if (!trimmed) return '';
  if (targetLang === 'en') return trimmed;

  const cacheKey = `${trimmed}_${targetLang}`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  const localCached = getLocalStorageCache(trimmed, targetLang);
  if (localCached !== null) {
    memoryCache.set(cacheKey, localCached);
    return localCached;
  }

  return null;
}

let translationCallbacks: (() => void)[] = [];

/**
 * Register a listener to be notified when a translation resolves.
 */
export function registerTranslationCallback(cb: () => void) {
  translationCallbacks.push(cb);
  return () => {
    translationCallbacks = translationCallbacks.filter(c => c !== cb);
  };
}

function notifyTranslationResolved() {
  translationCallbacks.forEach(cb => {
    try {
      cb();
    } catch (e) {
      // Safely ignore callback errors
    }
  });
}

/**
 * Generate a short, safe, unique alphanumeric ID for Firestore document keys.
 */
function getCacheKey(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'tx_' + Math.abs(hash).toString(36) + '_' + text.length;
}

/**
 * Check if localStorage has the cached translation.
 */
function getLocalStorageCache(text: string, targetLang: string): string | null {
  try {
    const cacheKey = `tr_cache_${targetLang}_${getCacheKey(text)}`;
    return localStorage.getItem(cacheKey);
  } catch (e) {
    return null;
  }
}

/**
 * Save translation to localStorage.
 */
function setLocalStorageCache(text: string, targetLang: string, translated: string): void {
  try {
    const cacheKey = `tr_cache_${targetLang}_${getCacheKey(text)}`;
    localStorage.setItem(cacheKey, translated);
  } catch (e) {
    // Avoid throwing quota exceeded errors
  }
}

interface QueuedTranslation {
  text: string;
  targetLang: SupportedLanguage;
  resolve: (value: string) => void;
  reject: (err: any) => void;
}

// Global batch queue for translation requests
let pendingQueue: QueuedTranslation[] = [];
let batchTimeoutId: NodeJS.Timeout | null = null;

/**
 * Main translation engine entry-point.
 * Checks memory, localStorage, and triggers batched server/Firestore lookup if missing.
 */
export function translateText(text: string, targetLang: SupportedLanguage): Promise<string> {
  const trimmed = text?.trim() || '';
  if (!trimmed) {
    return Promise.resolve('');
  }

  if (targetLang === 'en') {
    return Promise.resolve(trimmed);
  }

  const cacheKey = `${trimmed}_${targetLang}`;

  // 1. Memory Cache lookup
  if (memoryCache.has(cacheKey)) {
    return Promise.resolve(memoryCache.get(cacheKey)!);
  }

  // 2. LocalStorage Cache lookup
  const localCached = getLocalStorageCache(trimmed, targetLang);
  if (localCached !== null) {
    memoryCache.set(cacheKey, localCached);
    return Promise.resolve(localCached);
  }

  // 3. Queue for batched background retrieval
  return new Promise<string>((resolve, reject) => {
    pendingQueue.push({ text: trimmed, targetLang, resolve, reject });
    scheduleBatch();
  });
}

function scheduleBatch() {
  if (batchTimeoutId) return;
  batchTimeoutId = setTimeout(() => {
    batchTimeoutId = null;
    processBatch();
  }, 50); // 50ms aggregation window
}

async function processBatch() {
  const queueToProcess = [...pendingQueue];
  pendingQueue = [];

  if (queueToProcess.length === 0) return;

  // Split texts into those that can be resolved via Firestore and those that need AI translation
  const uniqueTexts = Array.from(new Set(queueToProcess.map((item) => item.text)));

  // We can process groups of target languages
  const targetLangs = Array.from(new Set(queueToProcess.map((item) => item.targetLang)));

  for (const lang of targetLangs) {
    const itemsForLang = queueToProcess.filter((item) => item.targetLang === lang);
    const uniqueTextsForLang = Array.from(new Set(itemsForLang.map((item) => item.text)));

    // Try resolving from Firestore first
    const firestoreResults: Record<string, string> = {};
    const textsNeedingApi: string[] = [];

    await Promise.all(
      uniqueTextsForLang.map(async (text) => {
        try {
          const docId = `${getCacheKey(text)}_${lang}`;
          const docRef = doc(db, 'translations', docId);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const data = snap.data();
            if (data && data.translatedText) {
              firestoreResults[text] = data.translatedText;
              return;
            }
          }
        } catch (e) {
          console.warn('[TranslationService] Firestore read failed for key:', text, e);
        }
        textsNeedingApi.push(text);
      })
    );

    // Resolve items found in Firestore
    Object.entries(firestoreResults).forEach(([text, translated]) => {
      // Update memory and localStorage cache
      memoryCache.set(`${text}_${lang}`, translated);
      setLocalStorageCache(text, lang, translated);

      // Resolve all matching queue requests
      itemsForLang
        .filter((item) => item.text === text)
        .forEach((item) => item.resolve(translated));
    });

    if (Object.keys(firestoreResults).length > 0) {
      notifyTranslationResolved();
    }

    // Translate any remaining texts via the API endpoint
    if (textsNeedingApi.length > 0) {
      try {
        // Construct the content payload for the API: { "key_0": "text 0", "key_1": "text 1" }
        const apiContent: Record<string, string> = {};
        textsNeedingApi.forEach((text, idx) => {
          apiContent[`key_${idx}`] = text;
        });

        console.log('[TranslationService] Requesting batch translation for', textsNeedingApi.length, 'items:', textsNeedingApi);
        const response = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: apiContent }),
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        // data structure: { hi: { "key_0": "...", ... }, fr: { ... }, de: { ... } }

        // Save translations for ALL languages to Firestore cache and memory
        const langsToSave: SupportedLanguage[] = ['hi', 'fr', 'de'];

        await Promise.all(
          textsNeedingApi.map(async (text, idx) => {
            const apiFieldKey = `key_${idx}`;

            for (const l of langsToSave) {
              const translatedText = data[l]?.[apiFieldKey];
              if (translatedText) {
                // Cache locally
                memoryCache.set(`${text}_${l}`, translatedText);
                setLocalStorageCache(text, l, translatedText);

                // Persist globally in Firestore so other users can load this instantly
                try {
                  const docId = `${getCacheKey(text)}_${l}`;
                  const docRef = doc(db, 'translations', docId);
                  await setDoc(docRef, {
                    originalText: text,
                    language: l,
                    translatedText,
                    createdAt: new Date().toISOString(),
                  });
                } catch (err) {
                  console.warn('[TranslationService] Failed to cache translation in Firestore:', err);
                }
              }
            }
          })
        );

        // Resolve pending items
        itemsForLang.forEach((item) => {
          if (textsNeedingApi.includes(item.text)) {
            const idx = textsNeedingApi.indexOf(item.text);
            const translatedText = data[item.targetLang]?.[`key_${idx}`];
            if (translatedText) {
              item.resolve(translatedText);
            } else {
              // Fallback to original text if translation failed
              item.resolve(item.text);
            }
          }
        });

        notifyTranslationResolved();
      } catch (err) {
        console.error('[TranslationService] Batch API translation failed:', err);
        // Fallback to original texts on failure so the UI is never blank
        itemsForLang.forEach((item) => {
          if (textsNeedingApi.includes(item.text)) {
            item.resolve(item.text);
          }
        });
      }
    }
  }
}
