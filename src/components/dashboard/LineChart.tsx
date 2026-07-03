'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTranslation } from '@/hooks/useTranslation';

// Static data — no Math.random / Date.now in render path
const DATA_POINTS = [38, 52, 44, 67, 58, 73, 62, 85, 78, 91, 84, 97];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const WIDTH = 560;
const HEIGHT = 160;
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 12;
const PAD_B = 4;

function toCoords(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = WIDTH - PAD_L - PAD_R;
  const h = HEIGHT - PAD_T - PAD_B;
  return values.map((v, i) => ({
    x: PAD_L + (i / (values.length - 1)) * w,
    y: PAD_T + h - ((v - min) / range) * h,
  }));
}

export function LineChart() {
  const { language } = useTranslation();
  const coords = toCoords(DATA_POINTS);
  const polyline = coords.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = [
    `M ${coords[0].x},${coords[0].y}`,
    ...coords.slice(1).map((p) => `L ${p.x},${p.y}`),
    `L ${coords[coords.length - 1].x},${HEIGHT - PAD_B}`,
    `L ${coords[0].x},${HEIGHT - PAD_B}`,
    'Z',
  ].join(' ');

  return (
    <GlassCard className="p-5 max-w-none">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-base-content">
            {language === 'en' ? 'Revenue Trend' : 'Tendencia de Ingresos'}
          </h3>
          <p className="text-xs text-white/40 mt-0.5">
            {language === 'en' ? 'Monthly overview — current year' : 'Resumen mensual — año actual'}
          </p>
        </div>
        <span className="text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
          +27.4%
        </span>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          style={{ height: 160 }}
          aria-label={language === 'en' ? 'Revenue trend chart' : 'Gráfico de tendencia de ingresos'}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => {
            const y = PAD_T + (HEIGHT - PAD_T - PAD_B) * frac;
            return (
              <line
                key={frac}
                x1={PAD_L}
                y1={y}
                x2={WIDTH - PAD_R}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <polyline
            points={polyline}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Data point dots */}
          {coords.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === coords.length - 1 ? 5 : 3}
              fill={i === coords.length - 1 ? '#7C3AED' : 'rgba(124,58,237,0.6)'}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={i === coords.length - 1 ? 2 : 1}
            />
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1 px-1">
        {(language === 'en' ? MONTHS_EN : MONTHS_ES).map((m) => (
          <span key={m} className="text-[10px] text-white/30 font-medium">
            {m}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}
