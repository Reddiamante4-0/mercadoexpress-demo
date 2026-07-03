'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <button
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/8 bg-white/4 backdrop-blur-md hover:bg-white/8 hover:border-white/15 transition-all text-xs font-semibold text-base-content/85 hover:text-base-content hover:shadow-[0_0_12px_rgba(124,58,237,0.2)]"
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5 text-accent-blue" />
      <span>{language === 'es' ? 'EN' : 'ES'}</span>
    </button>
  );
}
