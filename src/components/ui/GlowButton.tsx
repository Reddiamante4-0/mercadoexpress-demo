import React from 'react';
import { cn } from '@/lib/utils';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
}

export function GlowButton({ variant = 'primary', children, className, ...props }: GlowButtonProps) {
  return (
    <button
      className={cn(
        "relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer w-full",
        variant === 'primary' && "bg-linear-to-r from-primary via-accent-pink to-accent-warm text-white hover:brightness-110 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] border border-primary/20",
        variant === 'ghost' && "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-base-content/85 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
