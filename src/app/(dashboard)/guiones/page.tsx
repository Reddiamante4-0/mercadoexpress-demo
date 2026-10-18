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

type Opcion = { value: string; es: string; en: string };

const OPCIONES_DURACION: Opcion[] = [
  { value: '15', es: '15 segundos (muy corto)', en: '15 seconds (very short)' },
  { value: '30', es: '30 segundos (recomendado)', en: '30 seconds (recommended)' },
  { value: '60', es: '60 segundos (más detallado)', en: '60 seconds (more detailed)' },
];

const OPCIONES_OBJETIVO: Opcion[] = [
  { value: '', es: 'Sin preferencia', en: 'No preference' },
  { value: 'vender', es: 'Vender ya', en: 'Sell now' },
  { value: 'whatsapp', es: 'Recibir mensajes por WhatsApp', en: 'Get WhatsApp messages' },
  { value: 'conocer', es: 'Dar a conocer mi negocio', en: 'Raise awareness' },
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
const COPY_BTN_CLASS =
  'shrink-0 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-800 flex items-center gap-1.5 text-[10px] font-semibold cursor-pointer';

export default function GuionesPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const t = (es: string, en: string) => (language === 'en' ? en : es);

  const [tema, setTema] = useState('');
  const [publico, setPublico] = useState('');
  const [beneficio, setBeneficio] = useState('');
  const [datosReales, setDatosReales] = useState('');
  const [duracion, setDuracion] = useState('30');
  const [objetivo, setObjetivo] = useState('');
  const [tono, setTono] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ScriptData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    setResult(null);
    try {
      const res = await generarGuionVideoAction(tema, publico, {
        beneficio,
        datosReales,
        duracion,
        objetivo,
        tono,
      });
      if (res.success && res.data) {
        setResult(res.data as ScriptData);
        toast({
          title: t('¡Guión generado con éxito!', 'Script generated successfully!'),
          type: 'success',
        });
      } else {
        toast({
          title: res.error || t('Error al generar el guión.', 'Failed to generate script.'),
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
        title: t('¡Copiado!', 'Copied!'),
        type: 'success',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: t('No se pudo copiar.', 'Failed to copy.'),
        type: 'error',
      });
    }
  };

  // Arma el guión completo en texto plano para copiarlo de una vez (usa la primera opción de gancho y de cierre).
  const guionCompleto = (r: ScriptData) =>
    [
      `${t('GANCHO', 'HOOK')}: ${r.ganchos[0]}`,
      ...r.cuerpo.map((s) => `${s.tiempo}\n${s.texto}\n(${s.visual})`),
      `${t('CIERRE', 'CLOSING')}: ${r.ctas[0]}`,
    ].join('\n\n');

  const renderSelect = (label: string, value: string, onChange: (v: string) => void, opciones: Opcion[]) => (
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

  const renderCopyButton = (text: string, id: string) => (
    <button onClick={() => copyToClipboard(text, id)} className={COPY_BTN_CLASS}>
      {copiedId === id ? (
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
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Film className="w-4.5 h-4.5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Crisalap Impulsa</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm leading-tight">
          {t('Fábrica de Guiones (Videos Cortos)', 'Script Factory (Short Videos)')}
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium max-w-3xl">
          {t(
            'Cuéntanos de tu producto o servicio y recibe un guión listo para grabar con tu celular: qué decir, qué mostrar y cómo cerrar.',
            'Tell us about your product or service and get a script ready to film with your phone: what to say, what to show and how to close.'
          )}
        </p>
      </div>

      {/* ── MAIN TOOL LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 max-w-none items-start">
            <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-pink" />
              {t('Nuevo Guión', 'New Script')}
            </h2>

            <form onSubmit={handleGenerate} className="w-full space-y-5">
              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>
                  {t('¿Qué vendes o de qué trata el video?', 'What do you sell or what is the video about?')}
                </label>
                <Input
                  type="text"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder={t('Ej. Empanadas hechas en casa', 'e.g. Homemade empanadas')}
                  icon={<FileText className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>{t('¿A quién le vendes?', 'Who do you sell to?')}</label>
                <Input
                  type="text"
                  value={publico}
                  onChange={(e) => setPublico(e.target.value)}
                  placeholder={t('Ej. Familias del barrio', 'e.g. Neighborhood families')}
                  icon={<Target className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="pt-1 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-4">
                  {t('Mejora tu guión (opcional)', 'Improve your script (optional)')}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {t(
                    'Mientras más nos cuentes, más preciso y propio saldrá el guión.',
                    'The more you tell us, the more accurate and personal the script will be.'
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>
                  {t('¿Qué problema le resuelve o qué logra el cliente?', 'What problem does it solve or what does the customer achieve?')}
                </label>
                <textarea
                  value={beneficio}
                  onChange={(e) => setBeneficio(e.target.value)}
                  rows={2}
                  maxLength={300}
                  placeholder={t(
                    'Ej. Resuelven la comida de la tarde sin cocinar y se comen calientes',
                    'e.g. Solve the afternoon meal without cooking and are eaten hot'
                  )}
                  className={FIELD_CLASS}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>
                  {t('Ofertas, precios, garantías o datos que quieras que aparezcan', 'Offers, prices, guarantees or facts you want to include')}
                </label>
                <textarea
                  value={datosReales}
                  onChange={(e) => setDatosReales(e.target.value)}
                  rows={3}
                  maxLength={400}
                  placeholder={t(
                    'Ej. Domicilio gratis en Suba, 3 por $5.000, pedidos por WhatsApp hasta las 6 pm',
                    'e.g. Free delivery in Suba, 3 for $5,000, orders on WhatsApp until 6 pm'
                  )}
                  className={FIELD_CLASS}
                />
                <p className="text-[11px] text-slate-500 pl-1 leading-snug">
                  {t(
                    'Escribe solo lo que sea cierto. El guión solo afirmará estos datos.',
                    'Only write what is true. The script will only state these facts.'
                  )}
                </p>
              </div>

              {renderSelect(t('Duración del video', 'Video length'), duracion, setDuracion, OPCIONES_DURACION)}
              {renderSelect(t('Objetivo del video', 'Video goal'), objetivo, setObjetivo, OPCIONES_OBJETIVO)}
              {renderSelect(t('Tono', 'Tone'), tono, setTono, OPCIONES_TONO)}

              <GlowButton type="submit" disabled={isGenerating} className="w-full mt-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('Creando Guión...', 'Creating Script...')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t('Generar Guión', 'Generate Script')}</span>
                  </>
                )}
              </GlowButton>
            </form>
          </GlassCard>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          <GlassCard className="p-6 max-w-none items-stretch justify-start min-h-[340px]">
            <div className="flex justify-between items-center mb-5 gap-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Video className="w-4 h-4 text-accent-blue" />
                {t('Tu Guión', 'Your Script')}
              </h2>
              {result && (
                <button
                  onClick={() => copyToClipboard(guionCompleto(result), 'todo')}
                  className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  {copiedId === 'todo' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">{t('Copiado', 'Copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('Copiar guión completo', 'Copy full script')}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {result ? (
              <div className="space-y-6">
                {/* Ganchos */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{t('1. Gancho (0-3 seg)', '1. Hook (0-3 sec)')}</h3>
                    <p className="text-xs text-slate-500">{t('Elige uno para abrir tu video.', 'Pick one to open your video.')}</p>
                  </div>
                  {result.ganchos.map((hook, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-sm text-slate-700 leading-snug select-text">{hook}</p>
                      {renderCopyButton(hook, `hook-${idx}`)}
                    </div>
                  ))}
                </div>

                {/* Cuerpo */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{t('2. Cuerpo del video', '2. Video body')}</h3>
                    <p className="text-xs text-slate-500">
                      {t('Lo que dices y lo que muestras, en orden.', 'What you say and what you show, in order.')}
                    </p>
                  </div>
                  {result.cuerpo.map((step, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex gap-3.5 items-start">
                      <div className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary shrink-0">
                        {step.tiempo}
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <p className="text-sm text-slate-800 leading-relaxed select-text font-medium">{step.texto}</p>
                        {step.visual && (
                          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-white border border-slate-200">
                            <Eye className="w-3.5 h-3.5 text-accent-blue shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-500 leading-relaxed select-text">{step.visual}</p>
                          </div>
                        )}
                      </div>
                      {renderCopyButton(step.texto, `body-${idx}`)}
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{t('3. Cierre', '3. Closing')}</h3>
                    <p className="text-xs text-slate-500">{t('Elige una forma de terminar.', 'Pick a way to finish.')}</p>
                  </div>
                  {result.ctas.map((cta, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-sm text-slate-700 leading-snug select-text">{cta}</p>
                      {renderCopyButton(cta, `cta-${idx}`)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                    <p className="text-sm font-semibold text-slate-600">
                      {t('Estamos redactando tu guión...', 'We are writing your script...')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      {t('Armando el gancho, lo que dices, lo que muestras y el cierre.', 'Building the hook, what you say, what you show and the closing.')}
                    </p>
                  </>
                ) : (
                  <>
                    <Video className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
                    <p className="text-sm text-slate-400 font-medium">
                      {t(
                        'Completa los campos a la izquierda y presiona Generar Guión.',
                        'Fill in the fields on the left and click Generate Script.'
                      )}
                    </p>
                  </>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
