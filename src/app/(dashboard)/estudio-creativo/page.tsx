'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Download, RefreshCw, Image as ImageIcon, Store, Target, Phone } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import { generarTextosDisenoAction, obtenerDatosTiendaAction } from './actions';
import { dibujarDiseno, normalizarColor, type Formato } from './disenos';

type Textos = { titular: string; subtitulo: string; puntos: string[]; cta: string };

const FORMATOS: { value: Formato; es: string; en: string; ayudaEs: string; ayudaEn: string }[] = [
  { value: 'cuadrado', es: 'Cuadrado', en: 'Square', ayudaEs: 'Para redes sociales', ayudaEn: 'For social media' },
  { value: 'volante', es: 'Volante', en: 'Flyer', ayudaEs: 'Tamaño carta, para entregar', ayudaEn: 'Letter size, to hand out' },
  { value: 'afiche', es: 'Afiche', en: 'Poster', ayudaEs: 'Para pared o vitrina', ayudaEn: 'For a wall or window' },
];

const LABEL_CLASS = 'text-xs font-semibold text-base-content/75 uppercase tracking-wider pl-1';
const FIELD_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

function cargarImagen(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function normalizarUrl(u: string): string {
  const v = u.trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export default function EstudioCreativoPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const t = (es: string, en: string) => (language === 'en' ? en : es);

  // Datos del negocio
  const [negocio, setNegocio] = useState('');
  const [producto, setProducto] = useState('');
  const [beneficio, setBeneficio] = useState('');
  const [oferta, setOferta] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [direccion, setDireccion] = useState('');
  const [color, setColor] = useState('#0F766E');

  // Formato, logo y QR
  const [formato, setFormato] = useState<Formato>('cuadrado');
  const [usarLogo, setUsarLogo] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [usarQr, setUsarQr] = useState(true);
  const [urlQr, setUrlQr] = useState('');

  // Textos del diseño (editables)
  const [textos, setTextos] = useState<Textos | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rellena el formulario con los datos de la tienda de la persona.
  useEffect(() => {
    obtenerDatosTiendaAction()
      .then((r) => {
        if (r.success && r.tienda) {
          setNegocio(r.tienda.nombre || '');
          setWhatsapp(r.tienda.whatsapp || '');
          setLogoUrl(r.tienda.logoUrl || '');
          setUrlQr(r.tienda.url || '');
          if (r.tienda.color) setColor(normalizarColor(r.tienda.color));
        }
      })
      .catch(() => {});
  }, []);

  // Redibuja el diseño cada vez que cambia algo.
  useEffect(() => {
    if (!textos || !canvasRef.current) return;
    let cancelado = false;
    const canvas = canvasRef.current;

    (async () => {
      const urlFinal = normalizarUrl(urlQr);
      let qrImg: HTMLImageElement | null = null;
      if (usarQr && urlFinal) {
        try {
          const QRCode = (await import('qrcode')).default;
          const dataUrl = await QRCode.toDataURL(urlFinal, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 800,
            color: { dark: '#000000', light: '#FFFFFF' },
          });
          qrImg = await cargarImagen(dataUrl);
        } catch (err) {
          console.error('No se pudo crear el QR:', err);
        }
      }
      const logoImg = usarLogo ? await cargarImagen(logoUrl) : null;
      if (cancelado) return;

      dibujarDiseno(canvas, {
        formato,
        negocio,
        titular: textos.titular,
        subtitulo: textos.subtitulo,
        puntos: textos.puntos,
        cta: textos.cta,
        oferta,
        whatsapp,
        direccion,
        color,
        qr: qrImg,
        logo: logoImg,
      });
    })();

    return () => {
      cancelado = true;
    };
  }, [textos, formato, negocio, oferta, whatsapp, direccion, color, usarQr, urlQr, usarLogo, logoUrl]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producto.trim()) {
      toast({ title: t('Cuéntanos qué vendes.', 'Tell us what you sell.'), type: 'error' });
      return;
    }
    if (usarQr && !normalizarUrl(urlQr)) {
      toast({
        title: t('Escribe la dirección web para el QR o desactiva el QR.', 'Enter the web address for the QR or turn the QR off.'),
        type: 'error',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generarTextosDisenoAction({
        negocio,
        producto,
        beneficio,
        oferta,
        zona: direccion,
        formato,
      });
      if (res.success && res.textos) {
        setTextos(res.textos as Textos);
        toast({ title: t('¡Diseño creado!', 'Design created!'), type: 'success' });
      } else {
        toast({ title: res.error || t('No se pudo crear el diseño.', 'Could not create the design.'), type: 'error' });
      }
    } catch {
      toast({ title: t('Ocurrió un error inesperado.', 'An unexpected error occurred.'), type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        toast({ title: t('No se pudo descargar el diseño.', 'Could not download the design.'), type: 'error' });
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const base = (negocio || 'mi-negocio')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      a.href = url;
      a.download = `${base || 'diseno'}-${formato}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  const actualizarTexto = (campo: 'titular' | 'subtitulo' | 'cta', valor: string) => {
    setTextos((prev) => (prev ? { ...prev, [campo]: valor } : prev));
  };

  const actualizarPunto = (i: number, valor: string) => {
    setTextos((prev) => {
      if (!prev) return prev;
      const puntos = [...prev.puntos];
      puntos[i] = valor;
      return { ...prev, puntos };
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Crisalap Impulsa</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm leading-tight">
          {t('Estudio Creativo (Volantes y Afiches)', 'Creative Studio (Flyers and Posters)')}
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium max-w-3xl">
          {t(
            'Crea el diseño para promocionar tu negocio, listo para publicar o imprimir, con el código QR de tu tienda si lo quieres.',
            'Create a design to promote your business, ready to post or print, with your store QR code if you want it.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* ── FORMULARIO ── */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 max-w-none items-start">
            <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accent-pink" />
              {t('Tu diseño', 'Your design')}
            </h2>

            <form onSubmit={handleGenerate} className="w-full space-y-5">
              {/* Formato */}
              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>{t('¿Qué formato necesitas?', 'Which format do you need?')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {FORMATOS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFormato(f.value)}
                      className={`rounded-xl border px-2 py-2.5 text-center cursor-pointer transition-all ${
                        formato === f.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-sm font-bold">{language === 'en' ? f.en : f.es}</span>
                      <span className="block text-[10px] leading-tight mt-0.5 opacity-80">
                        {language === 'en' ? f.ayudaEn : f.ayudaEs}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>{t('Nombre de tu negocio', 'Your business name')}</label>
                <Input
                  type="text"
                  value={negocio}
                  onChange={(e) => setNegocio(e.target.value)}
                  placeholder={t('Ej. Empanadas Doña Rosa', 'e.g. Doña Rosa Empanadas')}
                  icon={<Store className="w-4 h-4" />}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>{t('¿Qué vendes? (producto o servicio)', 'What do you sell? (product or service)')}</label>
                <Input
                  type="text"
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                  placeholder={t('Ej. Empanadas hechas en casa', 'e.g. Homemade empanadas')}
                  icon={<Target className="w-4 h-4" />}
                  required
                />
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
                  placeholder={t('Ej. Resuelven la comida de la tarde sin cocinar', 'e.g. Solve the afternoon meal without cooking')}
                  className={FIELD_CLASS}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>{t('Oferta o precio (opcional)', 'Offer or price (optional)')}</label>
                <Input
                  type="text"
                  value={oferta}
                  onChange={(e) => setOferta(e.target.value)}
                  maxLength={120}
                  placeholder={t('Ej. 3 por $5.000 · Domicilio gratis en Suba', 'e.g. 3 for $5,000 · Free delivery')}
                />
                <p className="text-[11px] text-slate-500 pl-1 leading-snug">
                  {t('Se muestra tal cual la escribes, en un recuadro destacado.', 'It is shown exactly as you write it, in a highlighted box.')}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>{t('WhatsApp de tu negocio', 'Your business WhatsApp')}</label>
                <Input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  maxLength={30}
                  placeholder={t('Ej. 300 123 4567', 'e.g. 300 123 4567')}
                  icon={<Phone className="w-4 h-4" />}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS}>{t('Dirección o zona (opcional)', 'Address or area (optional)')}</label>
                <Input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  maxLength={120}
                  placeholder={t('Ej. Suba, Bogotá', 'e.g. Suba, Bogotá')}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className={LABEL_CLASS}>{t('Color principal', 'Main color')}</label>
                <input
                  type="color"
                  value={normalizarColor(color)}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-16 rounded-lg border border-slate-200 bg-white cursor-pointer"
                />
              </div>

              {/* Logo */}
              {logoUrl && (
                <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={usarLogo} onChange={(e) => setUsarLogo(e.target.checked)} className="w-4 h-4" />
                  {t('Usar el logo de mi tienda', 'Use my store logo')}
                </label>
              )}

              {/* QR opcional */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 cursor-pointer">
                  <input type="checkbox" checked={usarQr} onChange={(e) => setUsarQr(e.target.checked)} className="w-4 h-4" />
                  {t('Incluir código QR de mi tienda', 'Include my store QR code')}
                </label>
                {usarQr ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={urlQr}
                      onChange={(e) => setUrlQr(e.target.value)}
                      placeholder="https://mitienda.crisalap.com"
                      className={FIELD_CLASS}
                    />
                    <p className="text-[11px] text-slate-500 pl-1 leading-snug">
                      {t(
                        'El QR lleva a esta dirección. Puedes cambiarla si quieres enviar a otro lugar.',
                        'The QR leads to this address. You can change it to point somewhere else.'
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {t('Sin QR, el diseño aprovecha ese espacio para el contacto.', 'Without a QR, the design uses that space for contact details.')}
                  </p>
                )}
              </div>

              <GlowButton type="submit" disabled={isGenerating} className="w-full mt-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('Creando diseño...', 'Creating design...')}</span>
                  </>
                ) : textos ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>{t('Crear otros textos con IA', 'Create new texts with AI')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t('Crear diseño con IA', 'Create design with AI')}</span>
                  </>
                )}
              </GlowButton>
            </form>
          </GlassCard>
        </div>

        {/* ── VISTA PREVIA ── */}
        <div className="lg:col-span-3 space-y-5">
          <GlassCard className="p-6 max-w-none items-stretch justify-start min-h-[340px]">
            <div className="flex justify-between items-center mb-5 gap-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent-blue" />
                {t('Vista previa', 'Preview')}
              </h2>
              {textos && (
                <button
                  onClick={handleDownload}
                  className="p-2 px-3 rounded-lg bg-primary text-white hover:opacity-90 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('Descargar imagen', 'Download image')}</span>
                </button>
              )}
            </div>

            {textos ? (
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-xl border border-slate-200 shadow-sm"
                  style={{ maxWidth: formato === 'cuadrado' ? '560px' : '460px', height: 'auto' }}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                    <p className="text-sm font-semibold text-slate-600">{t('Estamos creando tu diseño...', 'We are creating your design...')}</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
                    <p className="text-sm text-slate-400 font-medium">
                      {t(
                        'Completa los datos a la izquierda y presiona Crear diseño.',
                        'Fill in the details on the left and click Create design.'
                      )}
                    </p>
                  </>
                )}
              </div>
            )}
          </GlassCard>

          {/* Textos editables */}
          {textos && (
            <GlassCard className="p-6 max-w-none items-stretch justify-start">
              <h3 className="text-sm font-bold text-slate-800">{t('Ajusta los textos', 'Adjust the texts')}</h3>
              <p className="text-xs text-slate-500 mb-4">
                {t('Si algo no te convence, cámbialo aquí y el diseño se actualiza al instante.', 'If something does not convince you, change it here and the design updates instantly.')}
              </p>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className={LABEL_CLASS}>{t('Titular', 'Headline')}</label>
                  <input
                    type="text"
                    value={textos.titular}
                    maxLength={80}
                    onChange={(e) => actualizarTexto('titular', e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={LABEL_CLASS}>{t('Frase de apoyo', 'Supporting line')}</label>
                  <textarea
                    value={textos.subtitulo}
                    rows={2}
                    maxLength={160}
                    onChange={(e) => actualizarTexto('subtitulo', e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>
                {formato === 'volante' &&
                  textos.puntos.map((p, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <label className={LABEL_CLASS}>
                        {t('Punto', 'Point')} {i + 1}
                      </label>
                      <input
                        type="text"
                        value={p}
                        maxLength={70}
                        onChange={(e) => actualizarPunto(i, e.target.value)}
                        className={FIELD_CLASS}
                      />
                    </div>
                  ))}
                <div className="flex flex-col gap-1.5">
                  <label className={LABEL_CLASS}>{t('Llamado a la acción', 'Call to action')}</label>
                  <input
                    type="text"
                    value={textos.cta}
                    maxLength={50}
                    onChange={(e) => actualizarTexto('cta', e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
