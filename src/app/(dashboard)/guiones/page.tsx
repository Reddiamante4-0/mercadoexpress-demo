'use client';

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Video,
  Eye,
  Film,
  Target,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import { generarGuionVideoAction } from './actions';

interface ScriptData {
  ganchos: string[];
  cuerpo: {
    tiempo: string;
    texto: string;
    visual: string;
  }[];
  ctas: string[];
}

export default function GuionesPage() {
  const { language } = useTranslation();
  const { toast } = useToast();

  const [tema, setTema] = useState('');
  const [publico, setPublico] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ScriptData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tema.trim() || !publico.trim()) {
      toast({
        title: language === 'en' ? 'Please fill in all fields.' : 'Por favor completa todos los campos.',
        type: 'error',
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    try {
      const res = await generarGuionVideoAction(tema, publico);
      if (res.success && res.data) {
        setResult(res.data as ScriptData);
        toast({
          title: language === 'en' ? 'Script generated successfully!' : '¡Guión generado con éxito!',
          type: 'success',
        });
      } else {
        toast({
          title: res.error || (language === 'en' ? 'Failed to generate script.' : 'Error al generar el guión.'),
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

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: language === 'en' ? 'Copied!' : '¡Copiado!',
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
          <FileText className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            Red Diamante 4.0
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm leading-tight">
          {language === 'en' ? 'Script Factory (Short Videos)' : 'Fábrica de Guiones (Videos Cortos)'}
        </h1>
        <p className="text-sm text-white/45 font-medium max-w-3xl">
          {language === 'en'
            ? 'Structure high-converting video scripts for TikTok, Reels, and Shorts. Fill the inputs to get viral hooks, editing transitions, and CTAs.'
            : 'Estructura guiones de video de alto impacto para TikTok, Reels y Shorts. Completa los campos para recibir ganchos virales, notas de edición y llamados a la acción.'}
        </p>
      </div>

      {/* ── FORM SECTION ── */}
      <GlassCard className="p-6 max-w-none items-stretch justify-start w-full text-left">
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-white/60 uppercase tracking-wider pl-1">
              {language === 'en' ? 'Video Topic / Hook Concept' : 'Tema del Video o Concepto'}
            </label>
            <Input
              type="text"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder={language === 'en' ? 'e.g. 3 tools to automate your Instagram DM sales' : 'Ej. 3 herramientas para automatizar ventas por DM de Instagram'}
              required
            />
          </div>

          <div className="flex-1 w-full flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-white/60 uppercase tracking-wider pl-1">
              {language === 'en' ? 'Target Audience' : 'Público Objetivo'}
            </label>
            <Input
              type="text"
              value={publico}
              onChange={(e) => setPublico(e.target.value)}
              placeholder={language === 'en' ? 'e.g. Affiliate Marketers' : 'Ej. Afiliados digitales'}
              required
            />
          </div>

          <GlowButton type="submit" disabled={isGenerating} className="w-full md:w-auto mt-2 shrink-0 py-3 px-6">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'en' ? 'Creating Script...' : 'Creando Guión...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{language === 'en' ? 'Generate Script' : 'Generar Guión'}</span>
              </>
            )}
          </GlowButton>
        </form>
      </GlassCard>

      {/* ── SCRIPT OUTPUT TABLE ── */}
      {result ? (
        <GlassCard className="p-6 max-w-none items-stretch justify-start w-full text-left overflow-x-auto border-purple-500/10">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/6">
            <Film className="w-5 h-5 text-accent-pink" />
            <h2 className="text-base font-bold text-white">
              {language === 'en' ? 'Viral Script Structure' : 'Estructura de Guión Viral'}
            </h2>
          </div>

          {/* Desktop Table View */}
          <table className="w-full border-collapse text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-accent-blue w-1/4">
                  {language === 'en' ? 'Hook (0-3 sec)' : 'Gancho (0-3 seg)'}
                </th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-primary w-2/4">
                  {language === 'en' ? 'Body (4-30 sec)' : 'Cuerpo (4-30 seg)'}
                </th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-accent-pink w-1/4">
                  {language === 'en' ? 'Call to Action (CTA)' : 'Llamado a la Acción (CTA)'}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="align-top">
                {/* Column 1: Hooks */}
                <td className="py-4 px-4 border-r border-white/5 space-y-3">
                  <span className="inline-block text-[9px] font-bold text-accent-blue bg-accent-blue/15 border border-accent-blue/20 px-2 py-0.5 rounded-full mb-1 uppercase tracking-wider">
                    {language === 'en' ? 'Choose 1 hook' : 'Elige 1 gancho'}
                  </span>
                  {result.ganchos.map((hook, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-2 group">
                      <p className="text-[11px] text-white/90 leading-relaxed font-sans font-medium">
                        "{hook}"
                      </p>
                      <button
                        onClick={() => copyToClipboard(hook, `hook-${idx}`)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white flex items-center gap-1 text-[9px] font-semibold cursor-pointer"
                      >
                        {copiedId === `hook-${idx}` ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">{language === 'en' ? 'Copied' : 'Copiado'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{language === 'en' ? 'Copy' : 'Copiar'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </td>

                {/* Column 2: Body steps */}
                <td className="py-4 px-4 border-r border-white/5 space-y-4">
                  <span className="inline-block text-[9px] font-bold text-primary bg-primary/15 border border-primary/20 px-2 py-0.5 rounded-full mb-1 uppercase tracking-wider">
                    {language === 'en' ? 'Video timeline sequence' : 'Secuencia de tiempo'}
                  </span>
                  <div className="space-y-3">
                    {result.cuerpo.map((step, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white/1 border border-white/5 flex gap-3.5 items-start">
                        {/* Time stamp */}
                        <div className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary shrink-0">
                          {step.tiempo}
                        </div>
                        {/* Content */}
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <p className="text-[11px] text-white font-sans leading-relaxed select-text font-medium">
                            {step.texto}
                          </p>
                          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-black/30 border border-white/5">
                            <Eye className="w-3.5 h-3.5 text-accent-blue shrink-0 mt-0.5" />
                            <p className="text-[9px] text-white/40 leading-relaxed font-sans select-text">
                              {step.visual}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>

                {/* Column 3: CTAs */}
                <td className="py-4 px-4 space-y-3">
                  <span className="inline-block text-[9px] font-bold text-accent-pink bg-accent-pink/15 border border-accent-pink/20 px-2 py-0.5 rounded-full mb-1 uppercase tracking-wider">
                    {language === 'en' ? 'Closing Options' : 'Opciones de cierre'}
                  </span>
                  {result.ctas.map((cta, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-2 group">
                      <p className="text-[11px] text-white/90 leading-relaxed font-sans font-medium">
                        "{cta}"
                      </p>
                      <button
                        onClick={() => copyToClipboard(cta, `cta-${idx}`)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white flex items-center gap-1 text-[9px] font-semibold cursor-pointer"
                      >
                        {copiedId === `cta-${idx}` ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">{language === 'en' ? 'Copied' : 'Copiado'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{language === 'en' ? 'Copy' : 'Copiar'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </GlassCard>
      ) : (
        <GlassCard className="p-8 justify-center items-center text-center min-h-[300px]">
          {isGenerating ? (
            <div className="space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
              <p className="text-sm font-semibold text-white/70">
                {language === 'en' ? 'Gemini is drafting the script...' : 'Gemini está redactando el guión...'}
              </p>
              <p className="text-xs text-white/40 max-w-xs mx-auto">
                {language === 'en' ? 'Structuring segments, spoken text, and visual transitions.' : 'Estructurando segmentos, diálogos y notas de edición visual.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Video className="w-10 h-10 text-white/20 mx-auto animate-pulse" />
              <p className="text-sm text-white/50 font-medium">
                {language === 'en'
                  ? 'Input your video details to generate a structured 3-column script.'
                  : 'Rellena los detalles de tu video para generar el guión estructurado en 3 columnas.'}
              </p>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
