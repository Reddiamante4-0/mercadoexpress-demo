'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Target,
  FileText,
  Copy,
  Check,
  History,
  ArrowLeft,
  Loader2,
  Calendar
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import { crearCopyPersuasivoAction, obtenerHistorialCopysAction } from './actions';

interface CopyHistoryItem {
  id: string;
  tema: string;
  copy_texto: string;
  creado_el: string;
}

function GeneradorCopysPageContent() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tema, setTema] = useState('');
  const [publico, setPublico] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [history, setHistory] = useState<CopyHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load history from Supabase
  const loadHistory = async () => {
    try {
      const res = await obtenerHistorialCopysAction();
      if (res.success && res.data) {
        setHistory(res.data as CopyHistoryItem[]);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const queryTema = searchParams.get('tema');
    const queryPublico = searchParams.get('publico');
    if (queryTema) setTema(queryTema);
    if (queryPublico) setPublico(queryPublico);
  }, [searchParams]);

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
    try {
      const result = await crearCopyPersuasivoAction(tema, publico);
      if (result.success && result.text) {
        setGeneratedCopy(result.text);
        toast({
          title: language === 'en' ? 'Copy generated successfully!' : '¡Copy generado con éxito!',
          type: 'success',
        });
        // Reload history to show the newly generated copy
        loadHistory();
      } else {
        toast({
          title: result.error || (language === 'en' ? 'Failed to generate copy.' : 'Error al generar el copy.'),
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
        title: language === 'en' ? 'Copied to clipboard!' : '¡Copiado al portapapeles!',
        type: 'success',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: language === 'en' ? 'Failed to copy.' : 'No se pudo copiar.',
        type: 'error',
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── HEADER NAVIGATION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                Red Diamante 4.0
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm leading-tight">
              {language === 'en' ? 'AI Copywriting Generator' : 'Generador de Copys con IA'}
            </h1>
            <p className="text-sm text-white/45 mt-1 font-medium">
              {language === 'en'
                ? 'Generate disruptive, persuasive, and high-impact marketing texts using Gemini AI.'
                : 'Crea textos comerciales persuasivos, directos y rompedores impulsados por Gemini 2.5.'}
            </p>
          </div>
        </div>

        {/* ── MAIN TOOL LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Input Panel (Col span 2) */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6 max-w-none items-start">
              <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-pink" />
                {language === 'en' ? 'Create New Campaign' : 'Nueva Campaña'}
              </h2>

              <form onSubmit={handleGenerate} className="w-full space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-base-content/75 uppercase tracking-wider pl-1">
                    {language === 'en' ? 'Negocio / Tema' : 'Tema del Negocio / Producto'}
                  </label>
                  <Input
                    type="text"
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. LiveGood Membership' : 'Ej. Membresía de LiveGood'}
                    icon={<FileText className="w-4 h-4" />}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-base-content/75 uppercase tracking-wider pl-1">
                    {language === 'en' ? 'Target Audience' : 'Público Objetivo'}
                  </label>
                  <Input
                    type="text"
                    value={publico}
                    onChange={(e) => setPublico(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Digital Entrepreneurs' : 'Ej. Emprendedores digitales'}
                    icon={<Target className="w-4 h-4" />}
                    required
                  />
                </div>

                <GlowButton
                  type="submit"
                  disabled={isGenerating}
                  className="w-full mt-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'en' ? 'Generating Copy...' : 'Generando Copy...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{language === 'en' ? 'Generate Copy' : 'Generar Copy'}</span>
                    </>
                  )}
                </GlowButton>
              </form>
            </GlassCard>
          </div>

          {/* Results Panel (Col span 3) */}
          <div className="lg:col-span-3 h-full">
            <GlassCard className="p-6 max-w-none items-stretch justify-start h-full min-h-[340px]">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent-blue" />
                  {language === 'en' ? 'Generated Copy' : 'Copy Generado'}
                </h2>
                {generatedCopy && (
                  <button
                    onClick={() => copyToClipboard(generatedCopy, 'main-result')}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  >
                    {copiedId === 'main-result' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">{language === 'en' ? 'Copied' : 'Copiado'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Copy Text' : 'Copiar Texto'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {generatedCopy ? (
                <div className="relative flex-1 rounded-2xl bg-base-200/40 border border-white/5 p-5 overflow-y-auto max-h-[300px]">
                  <p className="text-sm text-white/95 whitespace-pre-wrap leading-relaxed select-text font-sans font-medium">
                    {generatedCopy}
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-white/10 bg-white/1">
                  <Sparkles className="w-10 h-10 text-white/20 mb-3 animate-pulse" />
                  <p className="text-sm text-white/50 font-medium">
                    {language === 'en' 
                      ? 'Fill in the fields on the left and click Generate.' 
                      : 'Completa los campos a la izquierda y presiona Generar.'}
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* ── HISTORY SECTION ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/6 pb-2">
            <History className="w-4.5 h-4.5 text-white/40" />
            <h2 className="text-base font-bold text-white">
              {language === 'en' ? 'Campaign History' : 'Historial de Campañas'}
            </h2>
          </div>

          {isLoadingHistory ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item) => (
                <GlassCard key={item.id} className="p-5 max-w-none items-stretch justify-between text-left group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                          {item.tema}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-white/30 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.creado_el).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-white/70 line-clamp-4 leading-relaxed font-sans select-text">
                      {item.copy_texto}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => copyToClipboard(item.copy_texto, item.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white flex items-center gap-1.5 text-[10px] font-semibold cursor-pointer"
                    >
                      {copiedId === item.id ? (
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
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/1">
              <p className="text-sm text-white/40 font-medium">
                {language === 'en' ? 'No campaigns generated yet.' : 'Aún no has generado ninguna campaña.'}
              </p>
            </div>
          )}
        </div>
    </div>
  );
}

export default function GeneradorCopysPage() {
  return (
    <Suspense fallback={<div className="w-full flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
      <GeneradorCopysPageContent />
    </Suspense>
  );
}
