'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  Brain,
  ShieldAlert,
  Target,
  Sparkles,
  Smile,
  AlertCircle,
  Loader2,
  CheckCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  MessageSquare,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import { analizarAvatarAction, generarAccionAvatarAction } from './actions';

interface AvatarResult {
  resumenSimple: string;
  dolorPrincipal: string;
  deseoPrincipal: string;
  anguloRecomendado: string;
  doloresOcultos: string[];
  placeresDeseos: string[];
  objecionesTipicas: { objecion: string; respuesta: string }[];
  segmentacionSugerida: string[];
}

export default function AvatarPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();

  const [producto, setProducto] = useState('');
  const [nicho, setNicho] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AvatarResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Expandable complete analysis toggle
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  // Asset generator states
  const [activeAsset, setActiveAsset] = useState<'copy' | 'guion' | 'whatsapp' | 'hooks' | null>(null);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<string | null>(null);
  const [copiedAssetId, setCopiedAssetId] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producto.trim() || !nicho.trim()) {
      toast({
        title: language === 'en' ? 'Please fill in all fields.' : 'Por favor completa todos los campos.',
        type: 'error',
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setGeneratedAsset(null);
    setActiveAsset(null);
    setShowFullAnalysis(false);
    try {
      const res = await analizarAvatarAction(producto, nicho);
      if (res.success && res.data) {
        setResult(res.data as AvatarResult);
        toast({
          title: language === 'en' ? 'Avatar analyzed successfully!' : '¡Avatar analizado con éxito!',
          type: 'success',
        });
      } else {
        toast({
          title: res.error || (language === 'en' ? 'Failed to analyze avatar.' : 'Error al analizar el avatar.'),
          type: 'error',
      });
      }
    } catch (err) {
      toast({
        title: language === 'en' ? 'An unexpected error occurred.' : 'Ocurrió un error inesperado.',
        type: 'error',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateAsset = async (type: 'copy' | 'guion' | 'whatsapp' | 'hooks') => {
    if (!result) return;
    
    setActiveAsset(type);
    setIsGeneratingAsset(true);
    setGeneratedAsset(null);

    try {
      const res = await generarAccionAvatarAction(producto, nicho, type);
      if (res.success && res.data?.resultado) {
        setGeneratedAsset(res.data.resultado);
        toast({
          title: language === 'en' ? 'Asset generated successfully!' : '¡Recurso generado con éxito!',
          type: 'success'
        });
      } else {
        toast({
          title: res.error || (language === 'en' ? 'Failed to generate asset.' : 'Error al generar el recurso.'),
          type: 'error'
        });
      }
    } catch {
      toast({
        title: language === 'en' ? 'Error calling Gemini AI.' : 'Error al conectar con la IA de Gemini.',
        type: 'error'
      });
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  const handleUseInCopywriter = () => {
    router.push(`/generadorCopys?tema=${encodeURIComponent(producto)}&publico=${encodeURIComponent(nicho)}`);
  };

  const copyToClipboard = async (text: string, id: string, isAsset = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isAsset) {
        setCopiedAssetId(id);
      } else {
        setCopiedId(id);
      }
      toast({
        title: language === 'en' ? 'Copied to clipboard!' : '¡Copiado al portapapeles!',
        type: 'success',
      });
      setTimeout(() => {
        if (isAsset) setCopiedAssetId(null);
        else setCopiedId(null);
      }, 2000);
    } catch {
      toast({
        title: language === 'en' ? 'Failed to copy.' : 'No se pudo copiar.',
        type: 'error',
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 select-none">
      
      {/* ── HEADER ── */}
      <div className="space-y-2 text-left border-b border-white/5 pb-5">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            Red Diamante 4.0
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm leading-tight">
          {language === 'en' ? 'Avatar Researcher (AI)' : 'Investigador de Avatar (IA)'}
        </h1>
        <p className="text-sm text-white/50 mt-1 max-w-3xl font-medium leading-relaxed">
          {language === 'en'
            ? 'Discover your ideal client profile. Enter your business details and let Gemini map hidden pains, desires, objections, and campaign angles.'
            : 'Descubre el perfil de tu cliente ideal. Introduce tu negocio y deja que Gemini estructure dolores ocultos, deseos, objeciones y ángulos de campaña.'}
        </p>
      </div>

      {/* ── MAIN GRID LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form column (Col span 4) */}
        <div className="lg:col-span-4">
          <GlassCard className="p-6 max-w-none items-start text-left">
            <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent-blue" />
              {language === 'en' ? 'Avatar Variables' : 'Variables del Avatar'}
            </h2>

            <form onSubmit={handleAnalyze} className="w-full space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-white/60 uppercase tracking-wider pl-1">
                  {language === 'en' ? 'Product / Service' : 'Producto o Servicio'}
                </label>
                <Input
                  type="text"
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. LiveGood Wellness Supplements' : 'Ej. Suplementos de Bienestar LiveGood'}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-white/60 uppercase tracking-wider pl-1">
                  {language === 'en' ? 'General Niche' : 'Nicho General'}
                </label>
                <Input
                  type="text"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. Wellness and Home Income' : 'Ej. Bienestar y Negocios desde Casa'}
                  required
                />
              </div>

              <GlowButton type="submit" disabled={isAnalyzing} className="w-full mt-2">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'en' ? 'Analyzing Client Profile...' : 'Investigando Avatar...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'en' ? 'Research Avatar' : 'Investigar Avatar'}</span>
                  </>
                )}
              </GlowButton>
            </form>
          </GlassCard>
        </div>

        {/* Results column (Col span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {result ? (
            <div className="space-y-6 text-left">
              
              {/* 1. Resumen Simple del Avatar */}
              <GlassCard className="p-6 max-w-none items-stretch justify-start text-left border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
                  <UserCheck className="w-4.5 h-4.5 text-primary" />
                  <h3 className="text-sm font-bold text-white">
                    {language === 'en' ? 'Ideal Client Summary' : 'Resumen de tu cliente ideal'}
                  </h3>
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-sans font-medium">
                  {result.resumenSimple}
                </p>
              </GlassCard>

              {/* 2 & 3. Dolor Principal & Deseo Principal (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Dolor Principal */}
                <GlassCard className="p-5 max-w-none items-stretch justify-start border-red-500/10 bg-red-500/2">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4.5 h-4.5 text-accent-pink" />
                    <h3 className="text-xs font-bold text-white">
                      {language === 'en' ? 'What Concerns Them Most' : 'Lo que más le preocupa'}
                    </h3>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed font-semibold font-sans">
                    {result.dolorPrincipal}
                  </p>
                </GlassCard>

                {/* Deseo Principal */}
                <GlassCard className="p-5 max-w-none items-stretch justify-start border-green-500/10 bg-green-500/2">
                  <div className="flex items-center gap-2 mb-3">
                    <Smile className="w-4.5 h-4.5 text-green-400" />
                    <h3 className="text-xs font-bold text-white">
                      {language === 'en' ? 'What They Want to Achieve' : 'Lo que quiere lograr'}
                    </h3>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed font-semibold font-sans">
                    {result.deseoPrincipal}
                  </p>
                </GlassCard>
              </div>

              {/* 4. Objeciones Principales */}
              <GlassCard className="p-6 max-w-none items-stretch justify-start border-yellow-500/10">
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2.5">
                  <AlertCircle className="w-4.5 h-4.5 text-yellow-400" />
                  <h3 className="text-sm font-bold text-white">
                    {language === 'en' ? 'How to Answer Objections' : 'Lo que probablemente te va a responder'}
                  </h3>
                </div>
                <div className="space-y-3">
                  {result.objecionesTipicas.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-white/5 bg-white/2 space-y-1.5 font-sans">
                      <p className="text-xs font-bold text-white">
                        <span className="text-yellow-400">Objeción: </span> {item.objecion}
                      </p>
                      <p className="text-[11px] text-white/60 leading-relaxed font-semibold">
                        <span className="text-green-400 font-bold">Respuesta sugerida: </span> {item.respuesta}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* 5. Ángulo Recomendado */}
              <GlassCard className="p-6 max-w-none items-stretch justify-start border-blue-500/10">
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
                  <Target className="w-4.5 h-4.5 text-accent-blue" />
                  <h3 className="text-sm font-bold text-white">
                    {language === 'en' ? 'Recommended Ad Angle' : 'Ángulo recomendado para tu anuncio'}
                  </h3>
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-sans font-semibold">
                  {result.anguloRecomendado}
                </p>
              </GlassCard>

              {/* 6. Acciones Sugeridas */}
              <GlassCard className="p-6 max-w-none items-stretch justify-start border-primary/15 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2.5">
                  <Sparkles className="w-4.5 h-4.5 text-primary" />
                  <h3 className="text-sm font-bold text-white">
                    {language === 'en' ? 'Suggested Action Assets' : 'Acciones sugeridas'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                  <button
                    onClick={() => handleGenerateAsset('copy')}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2 h-24 ${
                      activeAsset === 'copy'
                        ? 'bg-primary/20 border-primary text-white shadow-md'
                        : 'bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-accent-blue" />
                    <span className="text-[10px] font-bold leading-normal">Crear copy para anuncio</span>
                  </button>

                  <button
                    onClick={() => handleGenerateAsset('guion')}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2 h-24 ${
                      activeAsset === 'guion'
                        ? 'bg-primary/20 border-primary text-white shadow-md'
                        : 'bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <Video className="w-5 h-5 text-accent-pink" />
                    <span className="text-[10px] font-bold leading-normal">Crear guion para video</span>
                  </button>

                  <button
                    onClick={() => handleGenerateAsset('whatsapp')}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2 h-24 ${
                      activeAsset === 'whatsapp'
                        ? 'bg-primary/20 border-primary text-white shadow-md'
                        : 'bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 text-green-400" />
                    <span className="text-[10px] font-bold leading-normal">Crear mensaje WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleGenerateAsset('hooks')}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2 h-24 ${
                      activeAsset === 'hooks'
                        ? 'bg-primary/20 border-primary text-white shadow-md'
                        : 'bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-[10px] font-bold leading-normal">Crear 5 hooks</span>
                  </button>

                  <button
                    onClick={handleUseInCopywriter}
                    className="p-3.5 rounded-xl border border-primary/20 bg-primary/10 hover:bg-primary/20 transition-all text-white text-center cursor-pointer flex flex-col items-center justify-between gap-2 h-24 hover:border-primary/45 group"
                  >
                    <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-0.5 transition-transform" />
                    <span className="text-[10px] font-bold leading-normal">Llevar al Generador de Copys</span>
                  </button>
                </div>

                {/* Quick actions generation output container */}
                {activeAsset && (
                  <div className="mt-5 pt-4 border-t border-white/5">
                    {isGeneratingAsset ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Loader2 className="w-7 h-7 text-primary animate-spin" />
                        <span className="text-xs text-white/55 font-semibold">Redactando pieza publicitaria con IA...</span>
                      </div>
                    ) : generatedAsset ? (
                      <div className="bg-black/35 border border-white/5 rounded-xl p-4.5 relative space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                            {activeAsset === 'copy' && 'Copy Persuasivo Generado'}
                            {activeAsset === 'guion' && 'Guion de Video Corto Generado'}
                            {activeAsset === 'whatsapp' && 'Mensaje de WhatsApp Generado'}
                            {activeAsset === 'hooks' && '5 Hooks Publicitarios Generados'}
                          </span>

                          <button
                            onClick={() => copyToClipboard(generatedAsset, 'generated-asset-clip', true)}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer border border-white/5 flex items-center gap-1 text-[10px] font-bold"
                          >
                            {copiedAssetId === 'generated-asset-clip' ? (
                              <>
                                <Check className="w-3 text-green-400" />
                                <span className="text-green-400">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed font-sans whitespace-pre-wrap select-text font-medium text-left">
                          {generatedAsset}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </GlassCard>

              {/* Expandable Section: Ver análisis completo */}
              <div className="pt-2">
                <button
                  onClick={() => setShowFullAnalysis(prev => !prev)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 transition-all text-xs font-bold text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-4.5 h-4.5 text-primary" />
                    {language === 'en' ? 'View Complete Detailed Analysis' : 'Ver análisis completo'}
                  </span>
                  {showFullAnalysis ? <ChevronUp className="w-4.5 h-4.5 text-white/60" /> : <ChevronDown className="w-4.5 h-4.5 text-white/60" />}
                </button>

                {showFullAnalysis && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 animate-fadeIn">
                    
                    {/* Dolores Ocultos */}
                    <GlassCard className="p-5 max-w-none items-stretch justify-start text-left border-red-500/10 bg-red-500/1">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldAlert className="w-4.5 h-4.5 text-accent-pink" />
                        <h3 className="text-xs font-bold text-white">
                          {language === 'en' ? 'Hidden Pains' : 'Dolores Ocultos'}
                        </h3>
                      </div>
                      <ul className="space-y-2 flex-1">
                        {result.doloresOcultos.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start text-[11px] text-white/60 leading-relaxed font-sans font-medium">
                            <span className="text-accent-pink shrink-0 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </GlassCard>

                    {/* Placeres y Deseos */}
                    <GlassCard className="p-5 max-w-none items-stretch justify-start text-left border-green-500/10 bg-green-500/1">
                      <div className="flex items-center gap-2 mb-3">
                        <Smile className="w-4.5 h-4.5 text-green-400" />
                        <h3 className="text-xs font-bold text-white">
                          {language === 'en' ? 'Pleasures & Desires' : 'Placeres y Deseos'}
                        </h3>
                      </div>
                      <ul className="space-y-2 flex-1">
                        {result.placeresDeseos.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start text-[11px] text-white/60 leading-relaxed font-sans font-medium">
                            <span className="text-green-400 shrink-0 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </GlassCard>

                    {/* Segmentación Sugerida */}
                    <GlassCard className="p-5 max-w-none items-stretch justify-start text-left sm:col-span-2 border-blue-500/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4.5 h-4.5 text-accent-blue" />
                        <h3 className="text-xs font-bold text-white">
                          {language === 'en' ? 'Suggested targeting interests' : 'Segmentación detallada (Meta & TikTok)'}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.segmentacionSugerida.map((interest, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/5 hover:bg-blue-600/10 border border-blue-600/10 text-[10px] font-semibold text-white/70 hover:text-white transition-all"
                          >
                            <span>{interest}</span>
                            <button
                              onClick={() => copyToClipboard(interest, `interest-${idx}`)}
                              className="text-white/30 hover:text-white transition-colors cursor-pointer"
                              title={language === 'en' ? 'Copy interest' : 'Copiar interés'}
                            >
                              {copiedId === `interest-${idx}` ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                  </div>
                )}
              </div>

            </div>
          ) : (
            <GlassCard className="p-8 justify-center items-center text-center min-h-[340px]">
              {isAnalyzing ? (
                <div className="space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-white/70">
                    {language === 'en' ? 'Gemini is researching your avatar...' : 'Gemini está investigando tu avatar...'}
                  </p>
                  <p className="text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
                    {language === 'en' ? 'Structuring deep psychology and targeting recommendations.' : 'Estructurando psicología de compras y segmentación exacta.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <UserCheck className="w-10 h-10 text-white/15 mx-auto animate-pulse" />
                  <p className="text-sm text-white/50 font-medium">
                    {language === 'en' 
                      ? 'Fill in the variables on the left and click Research.' 
                      : 'Completa las variables a la izquierda y presiona Investigar.'}
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
