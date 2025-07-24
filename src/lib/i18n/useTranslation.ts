'use client';

import { useLanguage } from './context';
import { en } from './translations/en';
import { pt } from './translations/pt';
import { Translations } from './types';

const translations: Record<string, Translations> = {
  en,
  pt,
};

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];
    
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" not found for language "${language}"`);
      return key; // Return key as fallback
    }
    
    // Simple variable interpolation
    if (variables) {
      let result = value;
      Object.entries(variables).forEach(([varKey, varValue]) => {
        result = result.replace(new RegExp(`{${varKey}}`, 'g'), String(varValue));
      });
      return result;
    }
    
    return value;
  };
  
  return { t, language };
}
