'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

// Static data — no Math.random / Date.now in render
const BARS = [
  { labelEn: 'Mon', labelEs: 'Lun', value: 68 },
  { labelEn: 'Tue', labelEs: 'Mar', value: 84 },
  { labelEn: 'Wed', labelEs: 'Mié', value: 57 },
  { labelEn: 'Thu', labelEs: 'Jue', value: 92 },
  { labelEn: 'Fri', labelEs: 'Vie', value: 76 },
  { labelEn: 'Sat', labelEs: 'Sáb', value: 43 },
  { labelEn: 'Sun', labelEs: 'Dom', value: 31 },
];

const MAX_VALUE = Math.max(...BARS.map((b) => b.value));

export function BarChart() {
  const { language } = useTranslation();

  return (
    <GlassCard className="p-5 max-w-none">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-base-content">
            {language === 'en' ? 'Active Sessions' : 'Sesiones Activas'}
          </h3>
          <p className="text-xs text-white/40 mt-0.5">
            {language === 'en' ? 'Last 7 days — daily breakdown' : 'Últimos 7 días — desglose diario'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-accent-blue">451</p>
          <p className="text-[10px] text-white/35">{language === 'en' ? 'total' : 'total'}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-2 h-36" aria-label={language === 'en' ? 'Active sessions bar chart' : 'Gráfico de barras de sesiones activas'}>
        {BARS.map((bar, i) => {
          const heightPct = (bar.value / MAX_VALUE) * 100;
          const isMax = bar.value === MAX_VALUE;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              {/* Value label on hover */}
              <span className="text-[10px] font-semibold text-white/0 group-hover:text-white/70 transition-colors duration-200 tabular-nums">
                {bar.value}
              </span>
              {/* Bar */}
              <div
                className={cn(
                  'w-full rounded-t-lg transition-all duration-500 relative overflow-hidden',
                  isMax
                    ? 'bg-linear-to-t from-primary via-accent-pink to-accent-warm shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                    : 'bg-linear-to-t from-primary/60 to-accent-pink/40 group-hover:from-primary/80 group-hover:to-accent-pink/60'
                )}
                style={{ height: `${heightPct}%`, minHeight: 8 }}
                role="img"
                aria-label={`${language === 'en' ? bar.labelEn : bar.labelEs}: ${bar.value}`}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              {/* Day label */}
              <span className="text-[10px] text-white/35 font-medium shrink-0">
                {language === 'en' ? bar.labelEn : bar.labelEs}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-linear-to-r from-primary to-accent-pink" />
          <span className="text-[10px] text-white/40">
            {language === 'en' ? 'Unique sessions' : 'Sesiones únicas'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-2 h-2 rounded-full bg-accent-warm shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
          <span className="text-[10px] text-white/40">
            {language === 'en' ? 'Peak day' : 'Día pico'}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
