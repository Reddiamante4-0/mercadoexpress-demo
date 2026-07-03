'use client';

import React, { createContext, useState, useEffect, useTransition } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');
  const [, startTransition] = useTransition();

  useEffect(() => {
    const stored = localStorage.getItem('language');
    if (stored === 'en' || stored === 'es') {
      startTransition(() => {
        setLanguageState(stored);
      });
    }
  }, [startTransition]);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
