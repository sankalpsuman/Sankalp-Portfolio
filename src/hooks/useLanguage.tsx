import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import { getCachedTranslationSync, registerTranslationCallback, translateText } from '../services/translationService';

export type Language = 'en' | 'hi' | 'fr' | 'de';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultOrReplacers?: string | Record<string, string | number>) => string;
  tArray: (key: string) => string[];
  resolveTranslation: <T>(obj: T | null | undefined, field: keyof T) => any;
}

const translations: Record<Language, any> = {
  en,
  hi,
  fr,
  de
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    // Automatically trigger re-renders of the language context when dynamic translations complete
    const unsubscribe = registerTranslationCallback(() => {
      setRevision(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const getBrowserLanguage = (): Language => {
    const defaultLanguage: Language = 'en';
    if (typeof window !== 'undefined' && window.navigator) {
      const locales = window.navigator.languages || [window.navigator.language];
      for (const locale of locales) {
        const base = locale.split('-')[0].toLowerCase();
        if (base === 'en' || base === 'hi' || base === 'fr' || base === 'de') {
          return base as Language;
        }
      }
    }
    return defaultLanguage;
  };

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('portfolio-language');
    if (saved === 'en' || saved === 'hi' || saved === 'fr' || saved === 'de') {
      return saved as Language;
    }
    // Correctly fallback to a detected browser language when no user preference is stored
    const detected = getBrowserLanguage();
    return detected;
  });

  // Keep language state in sync with URL prefix on route change
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const firstPart = pathParts[0];
    const isAdminPath = location.pathname.startsWith('/admin');

    if (!isAdminPath) {
      if (firstPart === 'hi' || firstPart === 'fr' || firstPart === 'de') {
        if (language !== firstPart) {
          setLanguageState(firstPart as Language);
          localStorage.setItem('portfolio-language', firstPart);
        }
      } else if (firstPart === 'en') {
        if (language !== 'en') {
          setLanguageState('en');
          localStorage.setItem('portfolio-language', 'en');
        }
      } else {
        // If there's no language prefix, but we have a non-English language state,
        // redirect to prefix to keep URLs consistent.
        if (language !== 'en') {
          const remainingPath = location.pathname;
          navigate(`/${language}${remainingPath === '/' ? '' : remainingPath}`, { replace: true });
        }
      }
    }
  }, [location.pathname]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('portfolio-language', lang);

    const isAdminPath = location.pathname.startsWith('/admin');
    if (!isAdminPath) {
      const pathParts = location.pathname.split('/').filter(Boolean);
      const firstPart = pathParts[0];
      const isLangPrefix = firstPart === 'hi' || firstPart === 'fr' || firstPart === 'de' || firstPart === 'en';
      
      let remainingPath = isLangPrefix ? '/' + pathParts.slice(1).join('/') : '/' + pathParts.join('/');
      if (remainingPath === '//') remainingPath = '/';
      
      if (lang === 'en') {
        navigate(remainingPath);
      } else {
        navigate(`/${lang}${remainingPath === '/' ? '' : remainingPath}`);
      }
    }
  };

  const t = React.useCallback((path: string, defaultOrReplacers?: string | Record<string, string | number>): string => {
    const parts = path.split('.');
    let current = translations[language];
    
    for (const part of parts) {
      if (current == null) {
        // Fallback to English if key missing in current language
        let enFallback = translations['en'];
        for (const enPart of parts) {
          if (enFallback == null) {
            if (typeof defaultOrReplacers === 'string') {
              return defaultOrReplacers;
            }
            return path;
          }
          enFallback = enFallback[enPart];
        }
        current = enFallback;
        break;
      }
      current = current[part];
    }

    if (typeof current !== 'string') {
      if (typeof defaultOrReplacers === 'string') {
        return defaultOrReplacers;
      }
      return path;
    }

    let value = current;
    if (defaultOrReplacers && typeof defaultOrReplacers === 'object') {
      Object.entries(defaultOrReplacers).forEach(([key, val]) => {
        value = value.replace(new RegExp(`{${key}}`, 'g'), String(val));
      });
    }

    return value;
  }, [language]);

  const tArray = React.useCallback((path: string): string[] => {
    const parts = path.split('.');
    let current = translations[language];
    
    for (const part of parts) {
      if (current == null) {
        let enFallback = translations['en'];
        for (const enPart of parts) {
          if (enFallback == null) return [];
          enFallback = enFallback[enPart];
        }
        current = enFallback;
        break;
      }
      current = current[part];
    }

    return Array.isArray(current) ? current : [];
  }, [language]);

  const resolveTranslation = React.useCallback(<T,>(obj: T | null | undefined, field: keyof T): any => {
    if (!obj) return '';
    const englishValue = obj[field];
    if (language === 'en' || typeof englishValue !== 'string') {
      return englishValue ?? '';
    }

    // 1. Check if the object has hardcoded or pre-translated field
    const translationsField = (obj as any).translations;
    if (
      translationsField &&
      translationsField[language] &&
      translationsField[language][field as string] !== undefined &&
      translationsField[language][field as string] !== null &&
      translationsField[language][field as string] !== ''
    ) {
      return translationsField[language][field as string];
    }

    // 2. Try to get it from TranslationService caches synchronously
    const trimmed = englishValue.trim();
    if (!trimmed) return englishValue;

    const cached = getCachedTranslationSync(trimmed, language);
    if (cached !== null) {
      return cached;
    }

    // 3. Trigger dynamic translation in the background and return original English text while loading
    translateText(trimmed, language as any).catch((err) => {
      console.warn('[resolveTranslation] Background auto-translation failed:', err);
    });

    return englishValue;
  }, [language]);

  const contextValue = React.useMemo(() => ({ 
    language, 
    setLanguage, 
    t, 
    tArray, 
    resolveTranslation 
  }), [language, setLanguage, t, tArray, resolveTranslation]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
