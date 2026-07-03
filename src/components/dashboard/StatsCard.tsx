'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTranslation } from '@/hooks/useTranslation';

interface StatsCardProps {
  icon: React.ReactNode;
  iconBg: string;
  labelEn: string;
  labelEs: string;
  value: string;
  trendValue: string;
  trendUp: boolean;
  trendLabelEn: string;
  trendLabelEs: string;
  accentColor: string;
}

export function StatsCard({
  icon,
  iconBg,
  labelEn,
  labelEs,
  value,
  trendValue,
  trendUp,
  trendLabelEn,
  trendLabelEs,
  accentColor,
}: StatsCardProps) {
  const { language } = useTranslation();

  return (
    <GlassCard className="p-5 max-w-none group hover:border-white/15 hover:shadow-[0_8px_32px_rgba(124,58,237,0.15)] transition-all duration-300">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg',
            iconBg
          )}
        >
          {icon}
        </div>
        {/* Trend badge */}
        <div
          className={cn(
            'flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border',
            trendUp
              ? 'text-green-400 bg-green-500/10 border-green-500/20'
              : 'text-red-400 bg-red-500/10 border-red-500/20'
          )}
        >
          <span>{trendUp ? '↑' : '↓'}</span>
          <span>{trendValue}</span>
        </div>
      </div>

      {/* Value */}
      <p
        className={cn(
          'text-2xl font-extrabold tracking-tight mb-1 transition-all duration-300',
          accentColor
        )}
      >
        {value}
      </p>

      {/* Label */}
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">
        {language === 'en' ? labelEn : labelEs}
      </p>

      {/* Trend description */}
      <p className="text-[11px] text-white/35">
        {language === 'en' ? trendLabelEn : trendLabelEs}
      </p>

      {/* Bottom accent line */}
      <div
        className={cn(
          'absolute bottom-0 left-0 w-full h-[2px] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          iconBg
        )}
      />
    </GlassCard>
  );
}
