'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Target,
  Users,
  Award,
  ShieldCheck,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import { generarAnuncioCompletoAction } from './actions';

interface AdData {
  copys: {
    aida: string;
    pas: string;
    gancho: string;
  };
  imagePrompt?: string;
}

export default function EstudioCreativoPage() {
  const { language } = useTranslation();
  const { toast } = useToast();

  const [producto, setProducto] = useState('');
  const [audiencia, setAudiencia] = useState('');
  const [objetivo, setObjetivo] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [result, setResult] = useState<AdData | null>(null);

  // Copy tab state: 'aida' | 'pas' | 'gancho'
  const [activeTab, setActiveTab] = useState<'aida' | 'pas' | 'gancho'>('aida');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producto.trim() || !audiencia.trim() || !objetivo.trim()) {
      toast({
        title: language === 'en' ? 'Please fill in all fields.' : 'Por favor completa todos los campos.',
        type: 'error',
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    try {
      const res = await generarAnuncioCompletoAction(producto, audiencia, objetivo);
      if (res.success && res.data) {
        setResult(res.data as AdData);
        toast({
          title: language === 'en' ? 'Ad creatives generated successfully!' : '¡Anuncio creativo generado con éxito!',
          type: 'success',
        });
      } else {
        const is503 = res.error === '503_UNAVAILABLE' || res.error?.includes('503') || res.error?.includes('UNAVAILABLE');
        const is429 = res.error?.includes('429') || res.error?.includes('exhausted') || res.error?.includes('Procesando solicitud');
        const friendlyError = is503
          ? 'El estudio creativo está procesando alta demanda en este instante. Regresa en un momento para continuar creando magia.'
          : is429 
            ? (language === 'en' ? 'Processing request, please wait a few seconds...' : 'Procesando solicitud, por favor espera unos segundos...')
            : (res.error || (language === 'en' ? 'Failed to generate ad.' : 'Error al generar el anuncio.'));
        toast({
          title: friendlyError,
          type: 'error',
        });
      }
    } catch (err) {
      toast({
        title: language === 'en' ? 'An unexpected error occurred.' : 'Ocurrió un error inesperado.',
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateAd = async () => {
    if (!producto.trim() || !audiencia.trim() || !objetivo.trim()) return;
    setIsRegenerating(true);
    try {
      const res = await generarAnuncioCompletoAction(producto, audiencia, objetivo);
      if (res.success && res.data) {
        setResult(res.data as AdData);
        toast({
          title: language === 'en' ? 'Ad regenerated successfully!' : '¡Anuncio regenerado con éxito!',
          type: 'success',
        });
      } else {
        const is503 = res.error === '503_UNAVAILABLE' || res.error?.includes('503') || res.error?.includes('UNAVAILABLE');
        const is429 = res.error?.includes('429') || res.error?.includes('exhausted') || res.error?.includes('Procesando solicitud');
        const friendlyError = is503
          ? 'El estudio creativo está procesando alta demanda en este instante. Regresa en un momento para continuar creando magia.'
          : is429 
            ? (language === 'en' ? 'Processing request, please wait a few seconds...' : 'Procesando solicitud, por favor espera unos segundos...')
            : (res.error || (language === 'en' ? 'Failed to regenerate ad.' : 'Error al regenerar el anuncio.'));
        toast({
          title: friendlyError,
          type: 'error',
        });
      }
    } catch {
      toast({
        title: language === 'en' ? 'Error regenerating ad.' : 'Error al regenerar el anuncio.',
        type: 'error',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: language === 'en' ? 'Copied to clipboard!' : '¡Copiado al portapapeles!',
        type: 'success',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: language === 'en' ? 'Failed to copy.' : 'No se pudo copiar.',
        type: 'error',
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── HEADER ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            Suite de IA
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm leading-tight">
          {language === 'en' ? 'Creative Studio (AI Ads)' : 'Estudio Creativo (Anuncios con IA)'}
        </h1>
        <p className="text-sm text-white/45 font-medium max-w-3xl">
          {language === 'en'
            ? 'Generate high-converting advertising copies and master image prompts in one click. Anti-ban shield is automatically active.'
            : 'Genera copys de alto impacto y prompts maestros para tus creativos en un solo clic. El escudo anti-baneos está activo por defecto.'}
        </p>
      </div>

      {/* ── MAIN TWO COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* Left Column: Form & Campaigns Variables (Col span 2) */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <GlassCard className="p-6 max-w-none items-stretch justify-start w-full text-left h-full flex flex-col">
            <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-blue" />
              {language === 'en' ? 'Campaign Variables' : 'Variables de Campaña'}
            </h2>

            <form onSubmit={handleGenerate} className="w-full space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-white/60 uppercase tracking-wider pl-1">
                    {language === 'en' ? 'Product / Service' : 'Producto o Servicio'}
                  </label>
                  <Input
                    type="text"
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. VIP Crypto Trading course' : 'Ej. Curso VIP de Trading Crypto'}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-white/60 uppercase tracking-wider pl-1">
                    {language === 'en' ? 'Target Audience' : 'Audiencia'}
                  </label>
                  <Input
                    type="text"
                    value={audiencia}
                    onChange={(e) => setAudiencia(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Young professionals 25-35' : 'Ej. Jóvenes profesionales 25-35'}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-white/60 uppercase tracking-wider pl-1">
                    {language === 'en' ? 'Ad Objective' : 'Objetivo de Campaña'}
                  </label>
                  <Input
                    type="text"
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Sales, Lead Generation' : 'Ej. Ventas, Conversiones'}
                    required
                  />
                </div>
              </div>

              <GlowButton type="submit" disabled={isGenerating} className="w-full mt-6">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'en' ? 'Generating Ad...' : 'Generando Anuncio...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'en' ? 'Generate Ad Creative' : 'Generar Anuncio Creativo'}</span>
                  </>
                )}
              </GlowButton>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: AI Mockup Social Post & Prompt Maestro (Col span 3) */}
        <div className="lg:col-span-3 flex flex-col space-y-6">
          {result ? (
            <div className="flex flex-col space-y-6">
              {/* Mockup Card representing a Social Media Post (NO Image container) */}
              <div className="w-full bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/2">
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-accent-blue/40 to-primary/40 flex items-center justify-center border border-white/10 shrink-0">
                    <Users className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-bold text-white leading-tight">Tu Negocio / Marca</div>
                    <div className="text-[10px] text-white/40 flex items-center gap-1">
                      <span>{language === 'en' ? 'Just now' : 'Justo ahora'}</span>
                      <span>•</span>
                      <span className="text-[9px]">🌐</span>
                    </div>
                  </div>
                </div>

                {/* Copy selection tabs */}
                <div className="flex border-b border-white/5 bg-white/1 p-1">
                  {(['aida', 'pas', 'gancho'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        activeTab === tab
                          ? 'bg-linear-to-tr from-primary to-accent-pink text-white shadow-md'
                          : 'text-white/40 hover:text-white/80'
                      }`}
                    >
                      {tab === 'aida' ? 'Fórmula AIDA' : tab === 'pas' ? 'Fórmula PAS' : 'Gancho Directo'}
                    </button>
                  ))}
                </div>

                {/* Post Body (Copy text area) */}
                <div className="p-5 text-left bg-black/10 min-h-[160px] max-h-[300px] overflow-y-auto custom-scrollbar">
                  <p className="text-xs text-white/90 whitespace-pre-wrap font-sans font-medium leading-relaxed select-text">
                    {activeTab === 'aida' && result.copys.aida}
                    {activeTab === 'pas' && result.copys.pas}
                    {activeTab === 'gancho' && result.copys.gancho}
                  </p>
                </div>

                {/* Bottom simulated Meta Ads CTA card */}
                <div className="bg-white/3 p-4 text-left border-t border-white/5 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] text-white/50 uppercase tracking-wider leading-none">Tu Negocio / Marca</div>
                    <div className="text-xs font-bold text-white truncate mt-1.5">{producto || 'Nombre del Producto'}</div>
                    <div className="text-[10px] text-white/45 truncate mt-0.5">{objetivo || 'Llamado a la acción'}</div>
                  </div>
                  <button className="px-4 py-2 bg-white/10 border border-white/10 text-[10px] font-bold text-white rounded-md shrink-0 cursor-default">
                    {language === 'en' ? 'Learn More' : 'Más información'}
                  </button>
                </div>
              </div>

              {/* Quick copy buttons for copies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => copyToClipboard(result.copys.aida, 'aida')}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/75 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer border border-white/5"
                >
                  {copiedId === 'aida' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">{language === 'en' ? 'AIDA Copied' : 'AIDA Copiado'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-primary" />
                      <span>{language === 'en' ? 'Copy Copy (AIDA Formula)' : 'Copiar Copy (Fórmula AIDA)'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => copyToClipboard(result.copys.pas, 'pas')}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/75 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer border border-white/5"
                >
                  {copiedId === 'pas' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">{language === 'en' ? 'PAS Copied' : 'PAS Copiado'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-accent-pink" />
                      <span>{language === 'en' ? 'Copy Copy (PAS Formula)' : 'Copiar Copy (Fórmula PAS)'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Prompt Maestro para tu Imagen Publicitaria Block */}
              {result.imagePrompt && (
                <GlassCard className="p-5 max-w-none items-stretch justify-start w-full text-left flex flex-col space-y-3">
                  <div className="flex items-center gap-2 border-b border-white/6 pb-2">
                    <Sparkles className="w-4 h-4 text-accent-warm" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {language === 'en' ? 'Image Design: Master Prompt for AI' : 'Diseño de Imagen: Prompt Maestro para IA'}
                    </h3>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 min-h-[80px] text-left">
                    <p className="text-xs text-white/80 font-mono whitespace-pre-wrap leading-relaxed select-text">
                      {result.imagePrompt}
                    </p>
                  </div>
                  <GlowButton
                    onClick={() => copyToClipboard(result.imagePrompt || '', 'prompt')}
                    className="w-full gap-2 py-2.5 justify-center font-bold"
                  >
                    {copiedId === 'prompt' ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span>{language === 'en' ? 'Prompt Copied!' : '¡Prompt Copiado!'}</span>
                      </>
                    ) : (
                      <>
                        <span>📋 {language === 'en' ? 'Copy Image Prompt' : 'Copiar Prompt de Imagen'}</span>
                      </>
                    )}
                  </GlowButton>
                </GlassCard>
              )}

              {/* Main action: Regenerar Anuncio */}
              <div className="pt-2">
                <GlowButton
                  onClick={handleRegenerateAd}
                  variant="ghost"
                  disabled={isRegenerating}
                  className="w-full gap-2 py-3 justify-center"
                >
                  <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{language === 'en' ? 'Regenerate Ad (AI)' : 'Regenerar Anuncio (IA)'}</span>
                </GlowButton>
              </div>
            </div>
          ) : (
            <GlassCard className="p-8 justify-center items-center text-center h-full min-h-[360px] flex flex-col">
              {isGenerating ? (
                <div className="space-y-4 my-auto">
                  <Loader2 className="w-10 h-10 text-accent-pink animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-white/70">
                    {language === 'en' ? 'Gemini is creating your ad copies...' : 'Gemini está redactando tus copys...'}
                  </p>
                  <p className="text-xs text-white/40 max-w-xs mx-auto">
                    {language === 'en' ? 'Generating compliance copy and master image prompt in the background.' : 'Generando copys seguros para pauta y prompt maestro de imagen en segundo plano.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 my-auto">
                  <ImageIcon className="w-10 h-10 text-white/20 mx-auto animate-pulse" />
                  <p className="text-sm text-white/50 font-medium">
                    {language === 'en'
                      ? 'Fill in the campaign details and generate your ad copies.'
                      : 'Completa los detalles de campaña para generar los copys y prompts.'}
                  </p>
                </div>
              )}
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
}
