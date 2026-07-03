import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel p-8 w-full max-w-md relative overflow-hidden transition-all duration-300 hover:border-white/15 hover:shadow-[0_8px_32px_rgba(124,58,237,0.15)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
