'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Target,
  FileText,
  Copy,
  Check,
  History,
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

type Opcion = { value: string; es: string; en: string };

const OPCIONES_GANCHO: Opcion[] = [
  { value: 'auto', es: 'Que la IA elija el mejor', en: 'Let the AI pick the best' },
  { value: 'pregunta', es: 'Una pregunta', en: 'A question' },
  { value: 'problema', es: 'Un problema que el cliente reconoce', en: 'A problem the customer recognizes' },
  { value: 'curiosidad', es: 'Curiosidad', en: 'Curiosity' },
  { value: 'dato', es: 'Un dato sorprendente', en: 'A surprising fact' },
  { value: 'beneficio', es: 'Beneficio directo', en: 'Direct benefit' },
  { value: 'historia', es: 'Una mini historia', en: 'A short story' },
];

const OPCIONES_OBJETIVO: Opcion[] = [
  { value: '', es: 'Sin preferencia', en: 'No preference' },
  { value: 'vender', es: 'Vender ya', en: 'Sell now' },
  { value: 'whatsapp', es: 'Recibir mensajes por WhatsApp', en: 'Get WhatsApp messages' },
  { value: 'conocer', es: 'Dar a conocer mi negocio', en: 'Raise awareness' },
];

const OPCIONES_PLATAFORMA: Opcion[] = [
  { value: '', es: 'Sin preferencia', en: 'No preference' },
  { value: 'meta', es: 'Facebook / Instagram', en: 'Facebook / Instagram' },
  { value: 'tiktok', es: 'TikTok', en: 'TikTok' },
  { value: 'whatsapp', es: 'WhatsApp', en: 'WhatsApp' },
];

const OPCIONES_TONO: Opcion[] = [
  { value: '', es: 'Sin preferencia', en: 'No preference' },
  { value: 'cercano', es: 'Cercano y amigable', en: 'Friendly' },
  { value: 'urgente', es: 'Con urgencia', en: 'Urgent' },
  { value: 'elegante', es: 'Elegante', en: 'Elegant' },
  { value: 'divertido', es: 'Divertido', en: 'Fun' },
];

const LABEL_CLASS = 'text-xs font-semibold text-base-content/75 uppercase tracking-wider pl-1';
const FIELD_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

function GeneradorCopysPageContent() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const t = (es: string, en: string) => (language === 'en' ? en : es);

  const [tema, setTema] = useState('');
  const [publico, setPublico] = useState('');
  const [beneficio, setBeneficio] = useState('');
  const [datosReales, setDatosReales] = useState('');
  const [tipoGancho, setTipoGancho] = useState('auto');
  const [objetivo, setObjetivo] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const [tono, setTono] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [ganchos, setGanchos] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [history, setHistory] = useState<CopyHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

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
        title: t('Por favor completa los dos primeros campos.', 'Please fill in the first two fields.'),
        type: 'error',
      });
      return;
    }

    setIsGenerating(true);
    setGanchos([]);
    try {
      const result = await crearCopyPersuasivoAction(tema, publico, {
        beneficio,
        datosReales,
        tipoGancho,
        objetivo,
        plataforma,
        tono,
      });
      if (result.success && result.text) {
        setGeneratedCopy(result.text);
        setGanchos(result.ganchos ?? []);
        toast({
          title: t('¡Copy generado con éxito!', 'Copy generated successfully!'),
          type: 'success',
        });
        // Reload history to show the newly generated copy
        loadHistory();
      } else {
        toast({
          title: result.error || t('Error al generar el copy.', 'Failed to generate copy.'),
          type: 'error',
        });
      }
    } catch (err) {
      toast({
        title: t('Ocurrió un error inesperado.', 'An unexpected error occurred.'),
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
        title: t('¡Copiado al portapapeles!', 'Copied to clipboard!'),
        type: 'success',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: t('No se pudo copiar.', 'Failed to copy.'),
        type: 'error',
      });
    }
  };

  const renderSelect = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opciones: Opcion[]
  ) => (
    <div className="flex flex-col gap-2">
      <label className={LABEL_CLASS}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={FIELD_CLASS}>
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {language === 'en' ? o.en : o.es}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            Crisalap Impulsa
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm leading-tight">
          {t('Generador de Copys con IA', 'AI Copywriting Generator')}
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          {t(
            'Cuéntanos de tu producto o servicio y crea textos comerciales persuasivos y directos con inteligencia artificial.',
            'Tell us about your product or service and create persuasive, direct marketing texts with artificial intelligence.'
          )}
        </p>
      </div>

      {/* ── MAIN TOOL LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Input Panel (Col span 2) */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 max-w-none items-start">
            <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-pink" />
              {t('Nueva Campaña', 'Create New Campaign')}
            </h2>

            <form onSubmit={handleGenerate} className="w-full space-y-5">
              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>
                  {t('¿Qué vendes? (producto o servicio)', 'What do you sell? (product or service)')}
                </label>
                <Input
                  type="text"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder={t('Ej. Zapatos deportivos para universitarios', 'e.g. Sports shoes for college students')}
                  icon={<FileText className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>
                  {t('¿A quién le vendes?', 'Who do you sell to?')}
                </label>
                <Input
                  type="text"
                  value={publico}
                  onChange={(e) => setPublico(e.target.value)}
                  placeholder={t('Ej. Jóvenes de 18 a 25 años', 'e.g. Young adults aged 18 to 25')}
                  icon={<Target className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="pt-1 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-4">
                  {t('Mejora tu copy (opcional)', 'Improve your copy (optional)')}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {t(
                    'Mientras más nos cuentes, más preciso y propio saldrá el texto.',
                    'The more you tell us, the more accurate and personal the text will be.'
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>
                  {t('¿Qué gana el cliente?', 'What does the customer gain?')}
                </label>
                <textarea
                  value={beneficio}
                  onChange={(e) => setBeneficio(e.target.value)}
                  rows={2}
                  maxLength={300}
                  placeholder={t(
                    'Ej. Son cómodos para caminar todo el día y combinan con todo',
                    'e.g. Comfortable for walking all day and match everything'
                  )}
                  className={FIELD_CLASS}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>
                  {t('Datos y ventajas reales de tu negocio', 'Real facts and strengths of your business')}
                </label>
                <textarea
                  value={datosReales}
                  onChange={(e) => setDatosReales(e.target.value)}
                  rows={3}
                  maxLength={400}
                  placeholder={t(
                    'Ej. Envío gratis en Bogotá, desde $89.000, hechos a mano, atiendo por WhatsApp hasta las 8 pm',
                    'e.g. Free shipping in Bogotá, from $89,000, handmade, I answer on WhatsApp until 8 pm'
                  )}
                  className={FIELD_CLASS}
                />
                <p className="text-[11px] text-slate-500 pl-1 leading-snug">
                  {t(
                    'Escribe solo lo que sea cierto: precio, oferta, envío, horarios, ciudad, años de experiencia. El copy solo afirmará estos datos.',
                    'Only write what is true: price, offer, shipping, hours, city, years of experience. The copy will only state these facts.'
                  )}
                </p>
              </div>

              {renderSelect(t('Tipo de gancho', 'Hook style'), tipoGancho, setTipoGancho, OPCIONES_GANCHO)}
              {renderSelect(t('Objetivo del anuncio', 'Ad goal'), objetivo, setObjetivo, OPCIONES_OBJETIVO)}
              {renderSelect(t('Dónde lo vas a publicar', 'Where will you publish it'), plataforma, setPlataforma, OPCIONES_PLATAFORMA)}
              {renderSelect(t('Tono', 'Tone'), tono, setTono, OPCIONES_TONO)}

              <GlowButton
                type="submit"
                disabled={isGenerating}
                className="w-full mt-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('Generando Copy...', 'Generating Copy...')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t('Generar Copy', 'Generate Copy')}</span>
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
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-blue" />
                {t('Copy Generado', 'Generated Copy')}
              </h2>
              {generatedCopy && (
                <button
                  onClick={() => copyToClipboard(generatedCopy, 'main-result')}
                  className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  {copiedId === 'main-result' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">{t('Copiado', 'Copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('Copiar Texto', 'Copy Text')}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {generatedCopy ? (
              <>
                <div className="relative rounded-2xl bg-slate-50 border border-slate-200 p-5 overflow-y-auto max-h-[300px]">
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed select-text font-sans font-medium">
                    {generatedCopy}
                  </p>
                </div>

                {ganchos.length > 0 && (
                  <div className="mt-5 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        {t('Ganchos alternativos', 'Alternative hooks')}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {t(
                          'Puedes cambiar la primera línea de tu copy por cualquiera de estas.',
                          'You can replace the first line of your copy with any of these.'
                        )}
                      </p>
                    </div>
                    {ganchos.map((g, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-3 rounded-xl bg-white border border-slate-200 p-3"
                      >
                        <p className="text-sm text-slate-700 leading-snug select-text">{g}</p>
                        <button
                          onClick={() => copyToClipboard(g, `gancho-${i}`)}
                          className="shrink-0 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-800 flex items-center gap-1.5 text-[10px] font-semibold cursor-pointer"
                        >
                          {copiedId === `gancho-${i}` ? (
                            <>
                              <Check className="w-3 h-3 text-green-600" />
                              <span className="text-green-600">{t('Copiado', 'Copied')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{t('Copiar', 'Copy')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
                <Sparkles className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
                <p className="text-sm text-slate-400 font-medium">
                  {t(
                    'Completa los campos a la izquierda y presiona Generar.',
                    'Fill in the fields on the left and click Generate.'
                  )}
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* ── HISTORY SECTION ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <History className="w-4.5 h-4.5 text-slate-400" />
          <h2 className="text-base font-bold text-slate-800">
            {t('Historial de Campañas', 'Campaign History')}
          </h2>
        </div>

        {isLoadingHistory ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.filter((item) => item.copy_texto !== generatedCopy).map((item) => (
              <GlassCard key={item.id} className="p-5 max-w-none items-stretch justify-between text-left group">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                        {item.tema}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.creado_el).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed font-sans select-text">
                    {item.copy_texto}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => copyToClipboard(item.copy_texto, item.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-800 flex items-center gap-1.5 text-[10px] font-semibold cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">{t('Copiado', 'Copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{t('Copiar', 'Copy')}</span>
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
            <p className="text-sm text-slate-400 font-medium">
              {t('Aún no has generado ninguna campaña.', 'No campaigns generated yet.')}
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
