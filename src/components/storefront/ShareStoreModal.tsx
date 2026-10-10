'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, MessageCircle, Share2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { translations } from '@/config/translations';

interface ShareStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSlug: string;
  storeName?: string;
}

export function ShareStoreModal({ isOpen, onClose, storeSlug, storeName }: ShareStoreModalProps) {
  const { language } = useTranslation();
  const t = translations[language];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // URL pública base de la tienda sin parámetros
  const storeUrl = `https://${storeSlug}.crisalap.com`;

  // El QR se genera SOLO cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    QRCode.toDataURL(storeUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, storeUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const displayName = storeName || 'Crisalap';
  const whatsappMessage = (t.store.shareWhatsAppMessage || '¡Hola! Te comparto la tienda {storeName} para que hagas tus compras: {url}')
    .replace('{storeName}', displayName)
    .replace('{url}', storeUrl);

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo semitransparente */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Tarjeta del modal */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/60 z-10 text-left animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          aria-label={t.common.cancel || 'Close'}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
            {t.store.shareModalTitle}
          </h3>
        </div>

        <p className="text-[11px] text-slate-500 font-medium mb-4">
          {t.store.shareModalSubtitle}
        </p>

        {/* Contenedor del QR */}
        <div className="flex justify-center items-center my-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          {isGenerating ? (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400 font-bold">
              {t.common.loading}
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={t.store.shareQrAlt || 'QR code'}
              className="w-48 h-48 rounded-xl bg-white p-2 shadow-xs border border-slate-200/50"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400 font-bold">
              {t.common.error}
            </div>
          )}
        </div>

        {/* Input con la URL + Botón Copiar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={storeUrl}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-medium select-all focus:outline-hidden"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title={t.store.shareCopyLink}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="text-[11px]">{copied ? t.store.shareCopied : t.store.shareCopyLink}</span>
            </button>
          </div>
        </div>

        {/* Botón Enviar por WhatsApp */}
        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-green-500/20 active:scale-95 cursor-pointer text-center"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{t.store.shareWhatsApp}</span>
        </a>
      </div>
    </div>
  );
}
