'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Send, MessageCircle } from 'lucide-react';
import { getMessages, Message } from '@/lib/db';
import { useTranslation } from '@/hooks/useTranslation';
import { translations } from '@/config/translations';

export default function AdminMessagesPage() {
  const { language } = useTranslation();
  const t = translations[language];

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessagesData = () => {
    setLoading(true);
    setMessages(getMessages());
    setLoading(false);
  };

  useEffect(() => {
    loadMessagesData();
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'es-CO', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-12 text-left">
      
      {/* Title block */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-600 animate-bounce" />
            <span>{t.admin.messagesTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.admin.messagesSubtitle}
          </p>
        </div>
        
        <button
          onClick={loadMessagesData}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{language === 'en' ? 'Refresh' : 'Actualizar'}</span>
        </button>
      </div>

      {/* Messages Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold">{t.admin.messagesEmpty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="px-5 py-4">{t.admin.messagesHeaderOrder}</th>
                  <th className="py-4">{t.admin.messagesHeaderClient}</th>
                  <th className="py-4 px-4">{t.admin.messagesHeaderQuery}</th>
                  <th className="py-4 text-center">{t.admin.messagesHeaderDate}</th>
                  <th className="px-5 py-4 text-right">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => {
                  const replyText = language === 'en'
                    ? `Hello ${m.customerName}, regarding your query on order ${m.orderId}:`
                    : `Hola ${m.customerName}, respondiendo a tu consulta sobre el pedido ${m.orderId}:`;
                  const cleanPhone = m.phone.replace(/[^0-9]/g, '');
                  // For Colombian numbers, prepend country code if not present
                  const whatsappPhone = cleanPhone.length === 10 ? `57${cleanPhone}` : cleanPhone;
                  const replyWhatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(replyText)}`;

                  return (
                    <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                      <td className="px-5 py-4 font-mono font-black text-green-600">
                        {m.orderId}
                      </td>
                      <td className="py-4">
                        <span className="font-bold text-slate-800 block">{m.customerName}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{m.phone}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-medium max-w-sm whitespace-normal leading-normal">
                        {m.messageText}
                      </td>
                      <td className="py-4 text-center text-slate-400 font-medium whitespace-nowrap">
                        {formatDate(m.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={replyWhatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-[10px] font-black uppercase rounded-lg transition-all active:scale-95 shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{t.admin.messagesActions}</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
