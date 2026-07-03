'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

// Static activity feed — no Date.now / Math.random in render
const ACTIVITIES = [
  {
    id: '1',
    initials: 'AS',
    nameEn: 'Ana Sofía',
    nameEs: 'Ana Sofía',
    actionEn: 'completed onboarding and activated their account',
    actionEs: 'completó el onboarding y activó su cuenta',
    timeEn: '2 min ago',
    timeEs: 'hace 2 min',
    dotColor: 'bg-green-400',
    avatarGradient: 'from-green-500 to-accent-blue',
  },
  {
    id: '2',
    initials: 'MR',
    nameEn: 'Miguel Reyes',
    nameEs: 'Miguel Reyes',
    actionEn: 'upgraded to the Pro plan',
    actionEs: 'actualizó al plan Pro',
    timeEn: '14 min ago',
    timeEs: 'hace 14 min',
    dotColor: 'bg-primary',
    avatarGradient: 'from-primary to-accent-pink',
  },
  {
    id: '3',
    initials: 'LG',
    nameEn: 'Laura González',
    nameEs: 'Laura González',
    actionEn: 'submitted a support ticket (#4821)',
    actionEs: 'envió un ticket de soporte (#4821)',
    timeEn: '33 min ago',
    timeEs: 'hace 33 min',
    dotColor: 'bg-accent-warm',
    avatarGradient: 'from-accent-warm to-accent-pink',
  },
  {
    id: '4',
    initials: 'DM',
    nameEn: 'Diego Morales',
    nameEs: 'Diego Morales',
    actionEn: 'exported the Q2 revenue report',
    actionEs: 'exportó el informe de ingresos Q2',
    timeEn: '1 hr ago',
    timeEs: 'hace 1 hr',
    dotColor: 'bg-accent-blue',
    avatarGradient: 'from-accent-blue to-primary',
  },
  {
    id: '5',
    initials: 'VL',
    nameEn: 'Valeria López',
    nameEs: 'Valeria López',
    actionEn: 'invited 3 new team members',
    actionEs: 'invitó a 3 nuevos miembros del equipo',
    timeEn: '2 hr ago',
    timeEs: 'hace 2 hr',
    dotColor: 'bg-accent-pink',
    avatarGradient: 'from-accent-pink to-accent-warm',
  },
];

export function ActivityFeed() {
  const { language } = useTranslation();

  return (
    <GlassCard className="p-5 max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-base-content">
            {language === 'en' ? 'Recent Activity' : 'Actividad Reciente'}
          </h3>
          <p className="text-xs text-white/40 mt-0.5">
            {language === 'en' ? 'Latest events across the platform' : 'Últimos eventos en la plataforma'}
          </p>
        </div>
        <button className="text-xs text-accent-blue hover:text-accent-blue/80 font-medium transition-colors">
          {language === 'en' ? 'View All' : 'Ver Todo'}
        </button>
      </div>

      {/* Timeline */}
      <ol className="relative space-y-0">
        {ACTIVITIES.map((item, index) => (
          <li key={item.id} className="flex gap-4 group">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full mt-1 shrink-0 ring-2 ring-black/30 shadow-md transition-transform duration-200 group-hover:scale-125',
                  item.dotColor
                )}
              />
              {index < ACTIVITIES.length - 1 && (
                <div className="w-px flex-1 bg-white/8 my-1.5" />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-4 flex-1 min-w-0', index === ACTIVITIES.length - 1 ? 'pb-0' : '')}>
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full bg-linear-to-tr flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-lg',
                    item.avatarGradient
                  )}
                >
                  {item.initials}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-base-content/85 leading-snug">
                    <span className="font-semibold text-base-content">
                      {language === 'en' ? item.nameEn : item.nameEs}
                    </span>{' '}
                    <span className="text-base-content/60">
                      {language === 'en' ? item.actionEn : item.actionEs}
                    </span>
                  </p>
                  <p className="text-[10px] text-white/35 mt-1 font-medium">
                    {language === 'en' ? item.timeEn : item.timeEs}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </GlassCard>
  );
}
