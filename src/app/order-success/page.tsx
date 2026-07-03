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
  ArrowRight,
  Loader2
} from 'lucide-react';
import { getOrders, Order } from '@/lib/db';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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
          <p className="text-sm font-bold text-slate-600">No encontramos el pedido</p>
          <button 
            onClick={() => router.push('/')}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-xs uppercase"
          >
            Volver al Inicio
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
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-800">¡Pedido Confirmado!</h2>
            <p className="text-xs text-slate-400">Gracias por comprar en MercadoExpress</p>
            <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-black font-mono border border-green-200/50">
              {order.id}
            </span>
          </div>

          {/* Delivery progress simulation bar */}
          <div className="pt-4 pb-2 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="text-green-600">Recibido</span>
              <span>En Preparación</span>
              <span>En camino</span>
              <span>Entregado</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-green-600 rounded-full w-1/4" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-green-600" />
              <span>Tiempo estimado de entrega: 30 - 45 minutos.</span>
            </p>
          </div>
        </div>

        {/* Delivery Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs space-y-3 text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
            Detalles del Despacho
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
                <b>Notas:</b> {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Order Items Receipt Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs space-y-3 text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
            Resumen del Recibo
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
              <span>Subtotal</span>
              <span className="font-bold text-slate-700">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo de Envío</span>
              <span className="font-bold text-slate-700">{order.shippingFee === 0 ? 'Gratis' : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="border-t border-slate-200/60 pt-2 flex justify-between text-sm font-black text-slate-800">
              <span>Total Cancelado</span>
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
            <span>Seguir Comprando</span>
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ir al Panel Administrador</span>
            <ArrowRight className="w-4 h-4" />
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
