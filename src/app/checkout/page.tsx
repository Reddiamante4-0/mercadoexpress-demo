'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  ShoppingCart,
  Globe
} from 'lucide-react';
import { getProducts, saveOrder, Order, OrderItem } from '@/lib/db';
import { useToast } from '@/components/ui/ToastProvider';
import { useTranslation } from '@/hooks/useTranslation';
import { translations } from '@/config/translations';
import { brandConfig } from '@/config/brandConfig';

interface CartItem {
  product: any;
  quantity: number;
}

const COLOMBIAN_BANKS = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Popular',
  'Scotiabank Colpatria',
  'Banco Itaú',
  'Nequi (PSE)',
  'DaviPlata (PSE)',
  'Lulo Bank'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language, setLanguage } = useTranslation();
  const t = translations[language];

  // Load Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [barrio, setBarrio] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState<'daily' | 'weekly'>('daily');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pse' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [pseBank, setPseBank] = useState(COLOMBIAN_BANKS[0]);
  const [walletPhone, setWalletPhone] = useState('');
  const [walletType, setWalletType] = useState<'nequi' | 'daviplata' | 'other'>('nequi');

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  useEffect(() => {
    const savedCart = localStorage.getItem('me_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const dbProducts = getProducts();
        const syncedCart = parsed.map((item: any) => {
          const dbProd = dbProducts.find(p => p.id === item.product.id);
          if (dbProd) {
            return { ...item, product: dbProd };
          }
          return item;
        }).filter((item: any) => {
          const dbProd = dbProducts.find(p => p.id === item.product.id);
          return dbProd !== undefined;
        });
        setCart(syncedCart);
        if (syncedCart.length === 0) {
          router.push('/');
        }
      } catch (e) {
        console.error('Error parsing cart:', e);
        router.push('/');
      }
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingFee = cartSubtotal > 80000 ? 0 : 5000;
  const cartTotal = cartSubtotal + shippingFee;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !phone || !address || !barrio) {
      toast({
        title: t.checkout.validationError,
        type: 'error'
      });
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
      toast({
        title: t.checkout.paymentCompleteError,
        type: 'error'
      });
      return;
    }

    if (paymentMethod === 'wallet' && !walletPhone) {
      toast({
        title: t.checkout.walletError,
        type: 'error'
      });
      return;
    }

    // Start Simulation
    setIsProcessing(true);
    
    // Simulate Gateway Steps
    try {
      setProcessingStep(t.checkout.processingStock);
      await new Promise(resolve => setTimeout(resolve, 800));

      setProcessingStep(t.checkout.processingGateway);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProcessingStep(t.checkout.processingBank);
      await new Promise(resolve => setTimeout(resolve, 800));

      setProcessingStep(t.checkout.processingOrder);
      await new Promise(resolve => setTimeout(resolve, 600));

      // Generate Order Details
      const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const orderItems: OrderItem[] = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      let paymentDetails = '';
      if (paymentMethod === 'card') {
        paymentDetails = `Tarjeta de Crédito (***${cardNumber.slice(-4)}) - Titular: ${cardName}`;
      } else if (paymentMethod === 'pse') {
        paymentDetails = `PSE (${pseBank})`;
      } else {
        const typeLabel = walletType === 'nequi' ? 'Nequi' : walletType === 'daviplata' ? 'DaviPlata' : 'Otro';
        paymentDetails = `Billetera Digital (${typeLabel} - Celular: ${walletPhone})`;
      }

      const newOrder: Order = {
        id: orderId,
        customerName,
        phone,
        address: `${address}, Barrio: ${barrio}`,
        notes: notes || undefined,
        paymentMethod,
        paymentDetails,
        items: orderItems,
        subtotal: cartSubtotal,
        shippingFee,
        total: cartTotal,
        status: 'Recibido',
        createdAt: new Date().toISOString(),
        deliveryType
      };

      // Save Order to LocalStorage Database
      saveOrder(newOrder);

      // Clear Cart
      localStorage.removeItem('me_cart');

      toast({
        title: t.checkout.paymentSuccessToast,
        type: 'success'
      });

      router.push(`/order-success?orderId=${orderId}`);

    } catch (err) {
      console.error('Error during payment simulation:', err);
      toast({
        title: 'Error procesando el pago ficticio.',
        type: 'error'
      });
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16">
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/')}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-slate-700 text-left">{t.checkout.title}</h1>
              <p className="text-[10px] text-slate-400 text-left mt-0.5">{t.checkout.subtitle}</p>
            </div>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span>{language === 'es' ? 'EN' : 'ES'}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-4xl mx-auto px-4 py-6 w-full flex-1 grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Left Column: Delivery Form & Payment Gateway (Col Span 3) */}
        <div className="md:col-span-3 space-y-6">
          <form onSubmit={handlePay} className="space-y-6">
            
            {/* Delivery Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs space-y-4 text-left">
              <h2 className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center gap-1.5">
                {t.checkout.deliveryDetails}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.checkout.recipient}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.checkout.recipientPlaceholder}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.checkout.phone}</label>
                  <input
                    type="tel"
                    required
                    placeholder={t.checkout.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.checkout.address}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.checkout.addressPlaceholder}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.checkout.neighborhood}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.checkout.neighborhoodPlaceholder}
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.checkout.notes}</label>
                <textarea
                  placeholder={t.checkout.notesPlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none"
                />
              </div>
            </div>

            {/* Delivery Option Selector Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs space-y-4 text-left">
              <h2 className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center gap-1.5">
                {t.checkout.deliveryModel}
              </h2>
              
              <div className="grid grid-cols-1 gap-3">
                <label className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  deliveryType === 'daily' 
                    ? 'border-green-600 bg-green-50/30' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === 'daily'}
                    onChange={() => setDeliveryType('daily')}
                    className="mt-1 text-green-600 focus:ring-green-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{t.checkout.deliveryDaily}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 leading-normal">{t.checkout.deliveryDailyDesc}</span>
                  </div>
                </label>

                <label className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  deliveryType === 'weekly' 
                    ? 'border-green-600 bg-green-50/30' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === 'weekly'}
                    onChange={() => setDeliveryType('weekly')}
                    className="mt-1 text-green-600 focus:ring-green-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{t.checkout.deliveryWeekly}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 leading-normal">{t.checkout.deliveryWeeklyDesc}</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method Selector Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs space-y-4 text-left">
            <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center gap-1.5">
                  {t.checkout.paymentTitle}
                </h2>
                <p className="text-[10px] text-slate-400 mt-1">{t.checkout.paymentSubtitle}</p>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-white text-green-700 border-green-200 shadow-xs'
                      : 'bg-transparent text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t.checkout.paymentCard}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('pse')}
                  className={`py-2 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    paymentMethod === 'pse'
                      ? 'bg-white text-green-700 border-green-200 shadow-xs'
                      : 'bg-transparent text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{t.checkout.paymentPSE}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`py-2 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    paymentMethod === 'wallet'
                      ? 'bg-white text-green-700 border-green-200 shadow-xs'
                      : 'bg-transparent text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{t.checkout.paymentWallet}</span>
                </button>
              </div>

              {/* Dynamic Inputs depending on selector */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                
                {/* 1. Credit Card Option */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">{t.checkout.cardHolder}</label>
                      <input
                        type="text"
                        placeholder="MARTA INES GOMEZ"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">{t.checkout.cardNumber}</label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4542 0000 0000 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">{t.checkout.cardExpiry}</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">{t.checkout.cardCVV}</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PSE Option */}
                {paymentMethod === 'pse' && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 leading-normal">
                      {language === 'en'
                        ? 'Payment by bank transfer. You will be securely redirected to your bank portal through the PSE system.'
                        : 'Pago por transferencia bancaria. Serás redirigido de forma segura al portal de tu banco a través del sistema PSE.'}
                    </p>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                        {language === 'en' ? 'Select your Bank' : 'Selecciona tu Banco de Pago'}
                      </label>
                      <select
                        value={pseBank}
                        onChange={(e) => setPseBank(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        {COLOMBIAN_BANKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 3. Billetera Digital Option (Nequi / DaviPlata / Otro) */}
                {paymentMethod === 'wallet' && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 leading-normal">
                      {language === 'en'
                        ? 'Select your digital wallet and enter the associated phone number.'
                        : 'Selecciona tu billetera digital e ingresa el número asociado.'}
                    </p>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                        {language === 'en' ? 'Wallet Type' : 'Tipo de Billetera'}
                      </label>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setWalletType('nequi')}
                          className={`py-2 px-1 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                            walletType === 'nequi' 
                              ? 'border-purple-600 bg-purple-50 shadow-xs' 
                              : 'border-slate-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Nequi_Logo.png" alt="Nequi" className="h-5 object-contain" />
                          <span className="text-[10px] font-bold text-slate-700">Nequi</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setWalletType('daviplata')}
                          className={`py-2 px-1 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                            walletType === 'daviplata' 
                              ? 'border-red-600 bg-red-50 shadow-xs' 
                              : 'border-slate-200 bg-white hover:border-red-300'
                          }`}
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Logo_Daviplata.png/640px-Logo_Daviplata.png" alt="DaviPlata" className="h-5 object-contain" />
                          <span className="text-[10px] font-bold text-slate-700">DaviPlata</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setWalletType('other')}
                          className={`py-2 px-1 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                            walletType === 'other' 
                              ? 'border-green-600 bg-green-50 shadow-xs' 
                              : 'border-slate-200 bg-white hover:border-green-300'
                          }`}
                        >
                          <Smartphone className="w-4 h-4 text-slate-500" />
                          <span className="text-[10px] font-bold text-slate-700">{language === 'en' ? 'Other' : 'Otro'}</span>
                        </button>
                      </div>
                    </div>

                    {walletType && (
                      <div className="space-y-1 mt-4">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                          {language === 'en' ? 'Mobile Number' : 'Número de Celular'}
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          placeholder="Ej: 3001234567"
                          value={walletPhone}
                          onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                        />
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Secure Transaction badge */}
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200/50">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-[9px] text-green-700 leading-snug font-medium">
                  {t.checkout.secureBadge}
                </p>
              </div>
            </div>

            {/* Pay Button (Visible on mobile/desktop inside form) */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.checkout.processingPayment}</span>
                </>
              ) : (
                <span>{t.checkout.payButton}: {formatPrice(cartTotal)}</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary (Col Span 2) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs space-y-4 text-left">
            <h2 className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center gap-1.5">
              {t.checkout.summaryTitle}
            </h2>

            {/* Item list */}
            <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-2 text-xs">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">
                      {language === 'en' && item.product.nameEn ? item.product.nameEn : item.product.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {t.checkout.cartTotalItems.replace('{qty}', String(item.quantity)).replace('{price}', formatPrice(item.product.price))}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 text-right self-center">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>{t.store.subtotal}</span>
                <span className="font-bold text-slate-700">{formatPrice(cartSubtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>{t.store.shipping}</span>
                <span className="font-bold text-slate-700">{shippingFee === 0 ? t.store.shippingFree : formatPrice(shippingFee)}</span>
              </div>

              <div className="border-t border-slate-200/60 pt-2.5 flex justify-between text-sm font-black text-slate-800">
                <span>{t.store.total}</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* ── PROCESSING MODAL overlay ── */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-slate-200/50">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-green-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-green-600 animate-spin" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">{t.checkout.processingModalTitle}</h3>
              <p className="text-xs text-slate-400 font-bold font-mono text-green-600 animate-pulse">{processingStep}</p>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
              {t.checkout.processingModalDesc}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
