import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { en } from './en';
import { bn } from './bn';
import { PROTECTED_ENTITIES, protectValue } from './protected';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'niramoy_language';

// Nested key retriever: resolves 'nav.doctors' from dictionary object
function getNestedValue(obj, keyPath) {
  if (!obj || !keyPath) return undefined;
  const parts = keyPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function LanguageProvider({ children }) {
  // Read saved preference or default to 'en'
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'bn' || stored === 'en') return stored;
    } catch {
      // localStorage may be disabled in restricted environments
    }
    return 'en';
  });

  // Sync to localStorage and HTML attribute
  const setLanguage = useCallback((newLang) => {
    if (newLang !== 'en' && newLang !== 'bn') return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('[i18n] Failed to persist language to localStorage:', e);
    }
  }, []);

  // Update HTML tag lang attribute and body class for typography
  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'bn') {
      document.body.classList.add('lang-bn');
      document.body.classList.remove('lang-en');
    } else {
      document.body.classList.add('lang-en');
      document.body.classList.remove('lang-bn');
    }
  }, [language]);

  /**
   * Safe Translation Function:
   * 1. Try currently selected language dictionary.
   * 2. If missing, fall back to English dictionary.
   * 3. If still missing, return fallback string or key itself.
   * 4. Enforce protected brand invariants (Niramoy is never transformed).
   */
  const t = useCallback((key, fallback) => {
    if (!key) return '';

    const activeDict = language === 'bn' ? bn : en;
    let val = getNestedValue(activeDict, key);

    // Fallback to English if missing in Bengali
    if (val === undefined && language !== 'en') {
      val = getNestedValue(en, key);
    }

    // Fallback to provided fallback or last segment of key
    if (val === undefined) {
      if (fallback !== undefined) {
        val = fallback;
      } else {
        const lastPart = key.split('.').pop();
        val = lastPart;
      }
    }

    return protectValue(val);
  }, [language]);

  /**
   * Protected entity wrapper: guarantees value remains untouched.
   */
  const protectedEntity = useCallback((val) => {
    return protectValue(val);
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    isBangla: language === 'bn',
    isEnglish: language === 'en',
    protectedEntity,
    brandName: PROTECTED_ENTITIES.BRAND_NAME
  }), [language, setLanguage, t, protectedEntity]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Failsafe fallback if used outside Provider: defaults to English without crashing
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, fallback) => fallback || key,
      isBangla: false,
      isEnglish: true,
      protectedEntity: (v) => v,
      brandName: PROTECTED_ENTITIES.BRAND_NAME
    };
  }
  return ctx;
}
