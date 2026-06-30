import React, { useState, useEffect } from 'react';
import { useLanguage, Language } from '../../hooks/useLanguage';
import { translateText, SupportedLanguage } from '../../services/translationService';

/**
 * Reusable hook providing standard translation helpers.
 */
export function useTranslation() {
  const { language, setLanguage, t, tArray } = useLanguage();
  return { language, setLanguage, t, tArray };
}

/**
 * Custom hook to translate any arbitrary English text dynamically.
 * Uses the underlying translation service with full caching and batching.
 */
export function useAutoTranslate(text: string) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<string>(text);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const trimmed = text?.trim() || '';
    if (!trimmed) {
      setTranslated('');
      setLoading(false);
      return;
    }

    if (language === 'en') {
      setTranslated(trimmed);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    translateText(trimmed, language as SupportedLanguage)
      .then((res) => {
        if (isMounted) {
          setTranslated(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('[useAutoTranslate] Dynamic translation failed for:', trimmed, err);
        if (isMounted) {
          setTranslated(trimmed);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [text, language]);

  return { translated, loading };
}

interface AutoTranslateProps {
  text: string;
  className?: string;
}

/**
 * Component to render dynamic admin/English text with automatic translations on-the-fly.
 * Shows a subtle inline pulse effect while translation is loading.
 */
export function AutoTranslate({ text, className = '' }: AutoTranslateProps) {
  const { translated, loading } = useAutoTranslate(text);

  if (loading) {
    return (
      <span className={`inline-block animate-pulse bg-white/10 rounded px-1.5 py-0.5 text-transparent select-none ${className}`}>
        {text}
      </span>
    );
  }

  return <span className={className}>{translated}</span>;
}

interface TranslatedTextProps {
  children: string;
  defaultOrReplacers?: string | Record<string, string | number>;
  className?: string;
}

/**
 * Component accepting static translation keys (e.g. "nav.about") and rendering
 * the translated value cleanly, with fallback to key or english.
 */
export function TranslatedText({ children, defaultOrReplacers, className = '' }: TranslatedTextProps) {
  const { t } = useLanguage();
  return <span className={className}>{t(children, defaultOrReplacers)}</span>;
}
