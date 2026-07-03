import React from 'react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-base-100 flex items-center justify-center overflow-hidden px-4 py-12">
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-accent-pink/15 blur-3xl pointer-events-none animate-float" />
      <div className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full bg-accent-blue/15 blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      {/* Auth Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
