'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  CreditCard, 
  Clock, 
  Loader2,
  Star,
  MessageSquare,
  Send,
  MessageCircle
} from 'lucide-react';
import { getOrders, saveRating, saveMessage, Order } from '@/lib/db';
import { useTranslation } from '@/hooks/useTranslation';
import { translations } from '@/config/translations';
import { brandConfig } from '@/config/brandConfig';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { language } = useTranslation();
  const t = translations[language];

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Ratings State
  const [productRating, setProductRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  // Messages State
  const [customerMessage, setCustomerMessage] = useState('');
  const [isMessageSubmitted, setIsMessageSubmitted] = useState(false);

  useEffect(() => {
    if (orderId) {
      const orders = getOrders();
      const found = orders.find(o => o.id === orderId);
      if (found) {
        setOrder(found);
      }
    }
    setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-slate-200/60 shadow-md">
          <p className="text-sm font-bold text-slate-600">{t.success.notFound}</p>
          <button 
            onClick={() => router.push('/')}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-xs uppercase"
          >
            {t.success.notFoundButton}
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveRating({
      id: `RAT-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: order.id,
      customerName: order.customerName,
      productRating,
      serviceRating,
      deliveryRating,
      comment: ratingComment.trim() || undefined,
      createdAt: new Date().toISOString()
    });
    setIsRatingSubmitted(true);
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessage.trim()) {
      alert(t.success.messageInputError);
      return;
    }
    saveMessage({
      id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: order.id,
      customerName: order.customerName,
      phone: order.phone,
      messageText: customerMessage.trim(),
      createdAt: new Date().toISOString()
    });
    setIsMessageSubmitted(true);
    setCustomerMessage('');
  };

  const StarRatingSelector = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => {
    return (
      <div className="flex items-center justify-between py-1 border-b border-slate-50">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="focus:outline-hidden transition-transform active:scale-110"
            >
              <Star className={`w-5 h-5 ${star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Pre-filled WhatsApp message
  const whatsappMsgText = t.success.whatsappMsg.replace('{orderId}', order.id);
  const whatsappLink = `https://wa.me/${brandConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMsgText)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16">
      
      {/* ── MAIN CONTAINER ── */}
      <main className="max-w-xl mx-auto px-4 py-12 w-full space-y-6">
        
        {/* Success Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 text-center shadow-md space-y-4 relative overflow-hidden">
          {/* Top colored line */}
          <div className="absolute top-0 left-0 w-full h-[5px] bg-green-600" />
          
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-800">{t.success.title}</h2>
            <p className="text-xs text-slate-400">{t.success.subtitle}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-black font-mono border border-green-200/50">
              {t.success.orderLabel}: {order.id}
            </span>
          </div>

          {/* Delivery progress simulation bar */}
          <div className="pt-4 pb-2 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="text-green-600">{t.success.statusReceived}</span>
              <span>{t.success.statusPreparing}</span>
              <span>{t.success.statusOnTheWay}</span>
              <span>{t.success.statusDelivered}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-green-600 rounded-full w-1/4" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-green-600" />
              <span>
                {order.deliveryType === 'weekly' 
                  ? t.success.deliveryWeeklyEstimated 
                  : t.success.estimatedTime}
              </span>
            </p>
          </div>
        </div>

        {/* WhatsApp Notification Button */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4.5 h-4.5" />
          <span>{t.success.whatsappButton}</span>
        </a>

        {/* Client ratings section */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs space-y-4 text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{t.success.ratingTitle}</span>
          </h3>

          {isRatingSubmitted ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
              <p className="text-xs font-bold text-green-700">{t.success.rateSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <p className="text-[11px] text-slate-400">{t.success.ratingDesc}</p>
              
              <div className="space-y-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <StarRatingSelector label={t.success.rateProduct} value={productRating} onChange={setProductRating} />
                <StarRatingSelector label={t.success.rateService} value={serviceRating} onChange={setServiceRating} />
                <StarRatingSelector label={t.success.rateDelivery} value={deliveryRating} onChange={setDeliveryRating} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.success.rateComment}</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder={t.success.rateCommentPlaceholder}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none bg-slate-50/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-98"
              >
                {t.success.rateSubmit}
              </button>
            </form>
          )}
        </div>

        {/* Client message section */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs space-y-4 text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-green-600" />
            <span>{t.success.messageTitle}</span>
          </h3>

          {isMessageSubmitted ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
              <p className="text-xs font-bold text-green-700">{t.success.messageSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleMessageSubmit} className="space-y-3.5">
              <textarea
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder={t.success.messagePlaceholder}
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none bg-slate-50/30"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.success.messageSubmit}</span>
              </button>
            </form>
          )}
        </div>

        {/* Delivery Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs space-y-3 text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
            {t.success.dispatchDetails}
          </h3>
          
          <div className="space-y-3.5 text-xs text-slate-600">
            <div className="flex gap-2.5 items-start">
              <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700">{order.customerName}</p>
                <p className="text-slate-400 mt-0.5">{order.address}</p>
              </div>
            </div>

            <div className="flex gap-2.5 items-center">
              <Phone className="w-4 h-4 text-green-600 shrink-0" />
              <span className="font-medium">{order.phone}</span>
            </div>

            <div className="flex gap-2.5 items-center">
              <CreditCard className="w-4 h-4 text-green-600 shrink-0" />
              <span className="font-medium truncate">{order.paymentDetails}</span>
            </div>
            
            {order.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/40 text-[11px] text-slate-400 italic">
                <b>{language === 'en' ? 'Notes:' : 'Notas:'}</b> {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Order Items Receipt Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs space-y-3 text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
            {t.success.receiptSummary}
          </h3>

          {/* Items */}
          <div className="space-y-3 pt-1">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-xs text-slate-600">
                <span className="font-medium truncate pr-4">
                  {item.name} <b className="text-slate-400 ml-1">x{item.quantity}</b>
                </span>
                <span className="font-bold text-slate-800">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Calculations */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>{t.success.subtotal}</span>
              <span className="font-bold text-slate-700">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.success.shippingFee}</span>
              <span className="font-bold text-slate-700">{order.shippingFee === 0 ? t.store.shippingFree : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="border-t border-slate-200/60 pt-2 flex justify-between text-sm font-black text-slate-800">
              <span>{t.success.totalPaid}</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.success.keepShopping}</span>
          </button>
        </div>

      </main>

    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
