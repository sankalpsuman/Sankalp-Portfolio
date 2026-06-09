import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';

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

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('portfolio-language', lang);
  };

  const t = (path: string, defaultOrReplacers?: string | Record<string, string | number>): string => {
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
  };

  const tArray = (path: string): string[] => {
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
  };

  const resolveTranslation = <T,>(obj: T | null | undefined, field: keyof T): any => {
    if (!obj) return '';
    if (language === 'en') {
      return obj[field] ?? '';
    }
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
    return obj[field] ?? '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tArray, resolveTranslation }}>
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
