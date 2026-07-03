'use client';

import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';

export default function PoliticasPublicidadPage() {
  const { language } = useTranslation();

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8 pb-12">
      {/* ── HEADER ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-accent-pink animate-pulse" />
          <span className="text-xs font-semibold text-accent-pink uppercase tracking-widest">
            {language === 'en' ? 'Compliance & Security' : 'Cumplimiento y Seguridad'}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm leading-tight">
          {language === 'en' ? 'Advertising Policies (Meta & TikTok)' : 'Políticas de Publicidad (Meta & TikTok)'}
        </h1>
        <p className="text-sm text-white/45 font-medium max-w-3xl">
          {language === 'en'
            ? 'Gold rules to protect your accounts, pixel, and financial assets from bans. Make sure to audit your contents before running ads.'
            : 'Las reglas de oro para proteger tus cuentas, píxel y activos financieros contra baneos. Asegúrate de auditar tus contenidos antes de pautar.'}
        </p>
      </div>

      {/* ── TWO COLUMN POLICIES SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Meta Ads (Facebook & Instagram) Card */}
        <GlassCard className="p-6 max-w-none items-stretch justify-start text-left border-blue-500/10 hover:border-blue-500/20 transition-all duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-white/6 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400 font-black text-lg">
                F
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Meta Ads</h2>
                <p className="text-[10px] text-white/30">Facebook, Instagram & Messenger</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {language === 'en' ? 'Meta Rules' : 'Normas Meta'}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {/* Rule 1 */}
            <div className="flex gap-3 items-start p-3 rounded-2xl bg-white/1 border border-white/5">
              <AlertTriangle className="w-4.5 h-4.5 text-accent-pink shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">
                  {language === 'en' ? 'No Personal Attributes' : 'Sin Atributos Personales'}
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                  {language === 'en'
                    ? 'Do not write hooks targeting user vulnerabilities directly. Avoid asking "¿Tienes deudas?" or "¿Estás cansado de estar gordo?". Rephrase to positive solutions: "Aprende a estructurar tus finanzas" or "Consigue tu mejor versión física".'
                    : 'Está prohibido aludir a atributos o debilidades del usuario directamente. Evita preguntar "¿Tienes deudas?" o "¿Estás gordo?". En su lugar, usa un enfoque positivo: "Aprende a estructurar tus finanzas" o "Encuentra tu mejor versión física".'}
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex gap-3 items-start p-3 rounded-2xl bg-white/1 border border-white/5">
              <AlertTriangle className="w-4.5 h-4.5 text-accent-pink shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">
                  {language === 'en' ? 'No Get-Rich-Quick Promises' : 'Cero Promesas de Dinero Fácil'}
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                  {language === 'en'
                    ? 'Avoid promising specific figures, easy work from home, MLM pitches, or financial freedom in short timeframes. Meta blocks words like "hazte rico", "gana miles", or "ingresos pasivos garantizados".'
                    : 'Evita prometer cifras específicas de ingresos, trabajo desde casa fácil o libertad financiera rápida. Meta bloquea palabras como "hazte rico", "gana miles en 1 día" o "ingresos pasivos garantizados".'}
                </p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="flex gap-3 items-start p-3 rounded-2xl bg-white/1 border border-white/5">
              <AlertTriangle className="w-4.5 h-4.5 text-accent-pink shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">
                  {language === 'en' ? 'No Before & After Comparisons' : 'Evitar Antes / Después'}
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                  {language === 'en'
                    ? 'Meta bans comparing photos or descriptions of before/after states (physical, facial, financial, etc.). Keep messages focused on the training, tools, and processes.'
                    : 'Meta prohíbe comparar imágenes o descripciones de estados de antes/después (físicos, faciales, financieros, etc.). Mantén el enfoque en la educación, herramientas y procesos.'}
                </p>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex gap-3 items-start p-3 rounded-2xl bg-white/1 border border-white/5">
              <ShieldCheck className="w-4.5 h-4.5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">
                  {language === 'en' ? 'Landing Page Consistency' : 'Consistencia en Página de Destino'}
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                  {language === 'en'
                    ? 'Your landing page must match the ad copy, contain clear policies, terms of service, and a disclaimer that the page is not affiliated with Meta.'
                    : 'La página de destino debe coincidir con el anuncio, tener políticas de privacidad visibles, términos de servicio y un descargo de responsabilidad aclarando que no pertenece a Meta.'}
                </p>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="mt-6 pt-4 border-t border-white/6 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href="https://www.facebook.com/policies/ads/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-blue-600/5 hover:bg-blue-600/10 border border-blue-600/10 text-xs font-bold text-white transition-all cursor-pointer"
            >
              <span>{language === 'en' ? 'Official Meta Ads Policies' : 'Políticas Oficiales Ads'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </a>
            <a
              href="https://transparency.fb.com/policies/community-standards/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-blue-600/5 hover:bg-blue-600/10 border border-blue-600/10 text-xs font-bold text-white transition-all cursor-pointer"
            >
              <span>{language === 'en' ? 'Community Standards' : 'Normas Comunitarias'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </a>
          </div>
        </GlassCard>

        {/* TikTok Ads Card */}
        <GlassCard className="p-6 max-w-none items-stretch justify-start text-left border-red-500/10 hover:border-red-500/20 transition-all duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-white/6 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/10 border border-rose-600/20 flex items-center justify-center text-rose-400 font-black text-lg">
                T
              </div>
              <div>
                <h2 className="text-base font-bold text-white">TikTok Ads</h2>
                <p className="text-[10px] text-white/30">TikTok Business Ads</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {language === 'en' ? 'TikTok Rules' : 'Normas TikTok'}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {/* Rule 1 */}
            <div className="flex gap-3 items-start p-3 rounded-2xl bg-white/1 border border-white/5">
              <AlertTriangle className="w-4.5 h-4.5 text-accent-pink shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">
                  {language === 'en' ? 'Authenticity & Clear Offers' : 'Autenticidad y Oferta Clara'}
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                  {language === 'en'
                    ? 'Do not use fake timers, false stock warnings, or fake discounts. Exaggerated product performance claims (e.g., curing diseases, overnight weight loss) lead to instant bans.'
                    : 'Está prohibido usar contadores falsos, alertas de inventario falsas o descuentos falsos. Las exageraciones de rendimiento del producto (ej. curar enfermedades, bajar peso en 1 noche) causan suspensiones inmediatas.'}
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex gap-3 items-start p-3 rounded-2xl bg-white/1 border border-white/5">
              <AlertTriangle className="w-4.5 h-4.5 text-accent-pink shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">
                  {language === 'en' ? 'Sensationalist or Shocking Content' : 'Contenido Sensacionalista o Impactante'}
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                  {language === 'en'
                    ? 'Avoid jump scares, blood, disgusting imagery, or extreme reactions in videos. TikTok values high-vibe, positive, creative, and native-looking contents.'
                    : 'Evita sustos repentinos, imágenes desagradables o reacciones extremas. TikTok prefiere contenidos creativos, positivos, divertidos y con aspecto nativo de la app.'}
                </p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="flex gap-3 items-start p-3 rounded-2xl bg-white/1 border border-white/5">
              <ShieldCheck className="w-4.5 h-4.5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">
                  {language === 'en' ? 'High Technical Production Standards' : 'Calidad Técnica de Producción'}
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                  {language === 'en'
                    ? 'All videos must be vertical (9:16), have high resolution, clear audio without background noise, and descriptive caption overlay. Horizontal videos or blurry content will be rejected.'
                    : 'Los videos deben ser verticales (9:16), con alta resolución, audio claro sin ruidos extraños y subtítulos/textos descriptivos. Los videos horizontales o borrosos son rechazados.'}
                </p>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex gap-3 items-start p-3 rounded-2xl bg-white/1 border border-white/5">
              <ShieldCheck className="w-4.5 h-4.5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">
                  {language === 'en' ? 'Disclosure & Paid Content' : 'Declaración de Contenido Patrocinado'}
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                  {language === 'en'
                    ? 'Ensure you activate the "Paid Partnership" toggle if you are promoting sponsored brand products or services, obeying local region compliance guidelines.'
                    : 'Asegúrate de activar la casilla de "Contenido Promocionado" si estás recomendando un producto o servicio comercial para respetar las normativas de transparencia.'}
                </p>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="mt-6 pt-4 border-t border-white/6 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href="https://ads.tiktok.com/help/article/ads-policy-guidelines"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-rose-600/5 hover:bg-rose-600/10 border border-rose-600/10 text-xs font-bold text-white transition-all cursor-pointer"
            >
              <span>{language === 'en' ? 'Official TikTok Ads Policies' : 'Políticas Oficiales Ads'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
            </a>
            <a
              href="https://www.tiktok.com/community-guidelines"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-rose-600/5 hover:bg-rose-600/10 border border-rose-600/10 text-xs font-bold text-white transition-all cursor-pointer"
            >
              <span>{language === 'en' ? 'Community Guidelines' : 'Normas de Comunidad'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
            </a>
          </div>
        </GlassCard>

      </div>

      {/* ── SECURITY ADVISORY FOOTER ── */}
      <div className="p-5 rounded-3xl border border-yellow-500/20 bg-yellow-500/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wide">
            {language === 'en' ? 'Gold Tip: Audit your domain & business name' : 'Consejo de Oro: Revisa tu dominio y nombre comercial'}
          </h4>
          <p className="text-xs text-white/60 leading-relaxed font-medium">
            {language === 'en'
              ? 'Using names containing trademarks like "LiveGood" directly inside the page url or fanpage commercial name can cause automatic bans. Use generic brands suggestions generated in the Meta Ads Configurator Step 1.'
              : 'Usar nombres que contengan marcas como "LiveGood" directamente en el dominio o en el nombre comercial de la FanPage puede causar bloqueos automáticos. Utiliza nombres genéricos de marca sugeridos en el Configurador Paso 1.'}
          </p>
        </div>
      </div>
    </div>
  );
}
