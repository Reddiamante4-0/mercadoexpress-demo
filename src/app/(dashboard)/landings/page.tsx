'use client';

import React from 'react';
import {
  Layers,
  ExternalLink,
  MousePointerClick,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  Smile,
  Settings
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';

export default function LandingsPage() {
  const { language } = useTranslation();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/* ── HEADER ── */}
      <div className="space-y-2 text-left">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            {language === 'en' ? 'Funnel System' : 'Sistema de Embudos'}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm leading-tight">
          {language === 'en' ? 'Direct Cloning Catalog (Systeme.io)' : 'Catálogo de Clonación Directa (Systeme.io)'}
        </h1>
        <p className="text-sm text-white/45 font-medium max-w-3xl">
          {language === 'en'
            ? 'Clone premium pre-built high-converting funnels directly into your Systeme.io account and configure them for your personal campaigns.'
            : 'Clona embudos premium pre-construidos de alta conversión directamente en tu cuenta de Systeme.io y configúralos para tus campañas personales.'}
        </p>
      </div>

      {/* ── STEP-BY-STEP INSTRUCTIONS ── */}
      <GlassCard className="p-6 md:p-8 max-w-none items-stretch justify-start w-full text-left flex flex-col space-y-6 border-white/10 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 border-b border-white/6 pb-3">
          <Sparkles className="w-4 h-4 text-accent-blue" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {language === 'en' ? 'How to Clone Your Funnel in 3 Simple Steps' : 'Cómo Clonar Tu Embudo en 3 Pasos Rápidos'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="flex flex-col justify-between space-y-3 p-4 rounded-xl bg-white/3 border border-white/5 relative">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">
                {language === 'en' ? 'Step 1' : 'Paso 1'}
              </span>
              <h3 className="text-xs font-bold text-white">
                {language === 'en' ? 'Prepare Your Account' : 'Prepara Tu Cuenta'}
              </h3>
              <p className="text-[11px] text-white/45 leading-relaxed font-sans font-medium">
                {language === 'en'
                  ? 'Click the button below to register a free account or log in to your official Systeme.io dashboard in a new window.'
                  : 'Haz clic en el siguiente botón para crear una cuenta gratuita o iniciar sesión en tu panel oficial de Systeme.io.'}
              </p>
            </div>
            <div className="pt-2">
              <a
                href="https://systeme.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-[10px] font-bold bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 shadow-[0_0_12px_rgba(124,58,237,0.1)] hover:scale-102 transition-all duration-200 cursor-pointer"
              >
                <span>{language === 'en' ? 'Access Systeme.io' : 'Abrir/Crear Cuenta Systeme.io'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col justify-between space-y-3 p-4 rounded-xl bg-white/3 border border-white/5">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-accent-pink uppercase tracking-widest">
                {language === 'en' ? 'Step 2' : 'Paso 2'}
              </span>
              <h3 className="text-xs font-bold text-white">
                {language === 'en' ? 'Clone the Template' : 'Clona la Plantilla'}
              </h3>
              <p className="text-[11px] text-white/45 leading-relaxed font-sans font-medium">
                {language === 'en'
                  ? 'Choose the template from the catalog below and click the golden clone button. A exact replica is saved to your account in 3 seconds.'
                  : 'Elige la plantilla del catálogo de abajo y haz clic en el botón dorado de clonar. Se guardará una réplica exacta del embudo en tu cuenta en 3 segundos.'}
              </p>
            </div>
            <div className="flex items-center justify-center p-2 bg-white/2 rounded-lg border border-dashed border-white/10 text-white/30 text-[10px] font-medium font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-pink mr-1.5 shrink-0" />
              {language === 'en' ? 'Instant Copy Activated' : 'Copia Instantánea Activa'}
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col justify-between space-y-3 p-4 rounded-xl bg-white/3 border border-white/5">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-accent-warm uppercase tracking-widest">
                {language === 'en' ? 'Step 3' : 'Paso 3'}
              </span>
              <h3 className="text-xs font-bold text-white">
                {language === 'en' ? 'Customize & Launch' : 'Personaliza y Lanza'}
              </h3>
              <p className="text-[11px] text-white/45 leading-relaxed font-sans font-medium">
                {language === 'en'
                  ? 'Open the editable page inside your Systeme.io dashboard and change the CTA buttons to your personal WhatsApp link. Ready to run ads!'
                  : 'Abre la página editable dentro de tu panel de Systeme.io y cambia el enlace del botón de acción por tu link de WhatsApp personal. ¡Listo para lanzar tus campañas independientes!'}
              </p>
            </div>
            <div className="flex items-center justify-center p-2 bg-white/2 rounded-lg border border-dashed border-white/10 text-white/30 text-[10px] font-medium font-sans">
              <LinkIcon className="w-3.5 h-3.5 text-accent-warm mr-1.5 shrink-0" />
              {language === 'en' ? 'Ready to launch' : 'Listo para lanzar'}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── PREMIUM TEMPLATE CATALOG CARD ── */}
      <div className="space-y-4 text-left">
        <h2 className="text-sm font-bold text-white pl-1 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-warm" />
          {language === 'en' ? 'Available Premium Templates' : 'Plantillas Premium de Clonación'}
        </h2>

        {/* LiveGood Template Card */}
        <div className="w-full relative group">
          {/* Glowing border background effect */}
          <div className="absolute -inset-0.5 bg-linear-to-r from-amber-500 to-amber-600 rounded-2xl opacity-10 group-hover:opacity-25 transition-all duration-300 blur-sm" />
          
          <GlassCard className="relative p-6 md:p-8 max-w-none items-stretch justify-between text-left flex flex-col md:flex-row gap-6 border-amber-500/20 hover:border-amber-500/40 bg-black/45 backdrop-blur-md transition-all duration-300">
            <div className="flex gap-5 items-start">
              {/* Template Icon */}
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <MousePointerClick className="w-9 h-9 text-amber-400" />
              </div>
              
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-white">
                    Landing Page de Prospección Oficial - LiveGood
                  </h3>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    {language === 'en' ? 'Official / Best Seller' : 'Oficial / Recomendado'}
                  </span>
                </div>
                
                <p className="text-xs text-white/50 leading-relaxed font-sans font-medium max-w-3xl">
                  {language === 'en'
                    ? 'High-conversion funnel structure optimized for the team. When cloned, it will be saved directly into your Systeme.io account so you can capture and manage your own leads 100% independently.'
                    : 'Estructura de embudo de alta conversión optimizada para el equipo. Al clonarla, se guardará directamente en tu cuenta de Systeme.io para que captes y manejes tus propios leads de forma 100% independiente.'}
                </p>

                {/* Additional metadata features list */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-[10px] text-white/30 font-semibold uppercase tracking-wider font-mono">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> 100% Responsive / Mobile Ready
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> WhatsApp Integration
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> Pre-built Video Block
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Clone Button */}
            <div className="flex items-center justify-end md:justify-center shrink-0">
              <a
                href="https://systeme.io/dashboard/share?hash=6372224dae1f222c1284235835992f0270029ce&type=funnel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-xs font-black bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-104 active:scale-98 transition-all duration-300 cursor-pointer whitespace-nowrap uppercase tracking-wider"
              >
                <span>🔗 {language === 'en' ? 'Clone Template in my Systeme.io' : 'Clonar Plantilla en mi Systeme.io'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
