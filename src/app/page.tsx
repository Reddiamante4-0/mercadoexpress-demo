'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Plus, 
  Minus, 
  X, 
  ChevronRight,
  TrendingDown,
  ShoppingBag,
  Sparkles,
  Clock,
  ShieldCheck,
  ThumbsUp,
  Flame,
  ArrowRight,
  Percent,
  Truck,
  Heart
} from 'lucide-react';
import { getProducts, Product } from '@/lib/db';
import { useToast } from '@/components/ui/ToastProvider';
import { useTranslation } from '@/hooks/useTranslation';

const CATEGORIES = [
  { name: 'Todas', emoji: '🛒' },
  { name: 'Carnes', emoji: '🥩' },
  { name: 'Pollo', emoji: '🍗' },
  { name: 'Pescado', emoji: '🐟' },
  { name: 'Verduras', emoji: '🥦' },
  { name: 'Frutas', emoji: '🍎' },
  { name: 'Abarrotes', emoji: '🍚' },
  { name: 'Bebidas', emoji: '🥤' },
  { name: 'Aseo', emoji: '🧼' },
  { name: 'Congelados', emoji: '❄️' },
  { name: 'Ofertas', emoji: '🔥' }
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  'Todas': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200/40', gradient: 'from-green-600 to-emerald-500' },
  'Carnes': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200/40', gradient: 'from-red-600 to-rose-500' },
  'Pollo': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/40', gradient: 'from-amber-500 to-yellow-400' },
  'Pescado': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/40', gradient: 'from-blue-600 to-cyan-500' },
  'Verduras': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/40', gradient: 'from-emerald-600 to-teal-500' },
  'Frutas': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200/40', gradient: 'from-orange-500 to-amber-400' },
  'Abarrotes': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200/40', gradient: 'from-yellow-500 to-amber-300' },
  'Bebidas': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200/40', gradient: 'from-sky-500 to-blue-400' },
  'Aseo': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/40', gradient: 'from-indigo-600 to-violet-500' },
  'Congelados': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200/40', gradient: 'from-cyan-500 to-sky-400' },
  'Ofertas': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/40', gradient: 'from-rose-600 to-pink-500' }
};

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CatalogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useTranslation();

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Wishlist simulation
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load products & cart from localStorage
  useEffect(() => {
    setProducts(getProducts());
    
    const savedCart = localStorage.getItem('me_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('me_cart', JSON.stringify(updatedCart));
  };

  // Add to cart
  const addToCart = (product: Product, customQty = 1) => {
    if (product.stock <= 0) {
      toast({
        title: language === 'en' ? 'Item out of stock!' : '¡Producto sin inventario disponible!',
        type: 'error'
      });
      return;
    }

    const updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(item => item.product.id === product.id);

    if (existingIndex >= 0) {
      const currentQty = updatedCart[existingIndex].quantity;
      const targetQty = currentQty + customQty;
      if (targetQty > product.stock) {
        toast({
          title: language === 'en' 
            ? `Cannot add more. Only ${product.stock} items in stock.` 
            : `No puedes agregar más. Solo quedan ${product.stock} unidades en inventario.`,
          type: 'error'
        });
        return;
      }
      updatedCart[existingIndex].quantity = targetQty;
    } else {
      updatedCart.push({ product, quantity: customQty });
    }

    saveCartToStorage(updatedCart);
    toast({
      title: language === 'en' ? `${product.name} added to cart.` : `Se agregó ${product.name} al carrito.`,
      type: 'success'
    });
  };

  // Decrease quantity or remove
  const removeFromCart = (productId: string) => {
    const updatedCart = [...cart];
    const index = updatedCart.findIndex(item => item.product.id === productId);

    if (index >= 0) {
      if (updatedCart[index].quantity > 1) {
        updatedCart[index].quantity -= 1;
      } else {
        updatedCart.splice(index, 1);
      }
      saveCartToStorage(updatedCart);
    }
  };

  // Toggle wishlist
  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
      toast({ title: 'Eliminado de tus favoritos', type: 'success' });
    } else {
      setWishlist([...wishlist, id]);
      toast({ title: 'Agregado a tus favoritos ❤️', type: 'success' });
    }
  };

  // Add savings combos helper
  const addComboToCart = (comboName: string, productIds: string[]) => {
    const comboProducts = products.filter(p => productIds.includes(p.id) && p.stock > 0);
    if (comboProducts.length === 0) {
      toast({ title: 'Lo sentimos, este combo no tiene stock disponible', type: 'error' });
      return;
    }
    
    let addedCount = 0;
    const updatedCart = [...cart];
    
    comboProducts.forEach(product => {
      const idx = updatedCart.findIndex(item => item.product.id === product.id);
      if (idx >= 0) {
        if (updatedCart[idx].quantity < product.stock) {
          updatedCart[idx].quantity += 1;
          addedCount++;
        }
      } else {
        updatedCart.push({ product, quantity: 1 });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      saveCartToStorage(updatedCart);
      toast({
        title: `¡Combo "${comboName}" agregado al carrito!`,
        type: 'success'
      });
    } else {
      toast({
        title: 'Los productos de este combo ya están al límite de su inventario en tu carrito',
        type: 'error'
      });
    }
  };

  // Format currency
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    if (!p.active) return false;
    
    const matchesCategory = selectedCategory === 'Todas' || 
                            (selectedCategory === 'Ofertas' ? p.oldPrice !== undefined : p.category === selectedCategory);
    
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Hot/Discounted deals
  const dealsProducts = products.filter(p => p.active && p.oldPrice !== undefined).slice(0, 4);

  // Best sellers
  const bestSellers = products.filter(p => p.active).slice(2, 6);

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingFee = cartSubtotal > 80000 || cartSubtotal === 0 ? 0 : 5000;
  const cartTotal = cartSubtotal + shippingFee;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: language === 'en' ? 'Your cart is empty!' : '¡Tu carrito está vacío!',
        type: 'error'
      });
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-100/40 text-slate-800 flex flex-col font-sans pb-16 antialiased">
      
      {/* ── HIGH FIDELITY HEADER ── */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/95 border-b border-slate-200/50 shadow-xs transition-all">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo with elegant design */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0" 
            onClick={() => { setSelectedCategory('Todas'); setSearchQuery(''); }}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-green-600 via-emerald-500 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-green-600/20 group-hover:scale-105 transition-transform duration-200">
              <span className="font-black text-lg tracking-tighter">ME</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
                MercadoExpress
              </h1>
              <span className="text-[9px] text-orange-600 font-extrabold tracking-widest uppercase mt-1 block">Express Delivery</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-xl relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={language === 'en' ? "Search steak, vegetables, snacks..." : "Encuentra carne de res, pollo, papas, frutas..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/50 focus:bg-white border border-transparent focus:border-green-500/20 text-slate-800 placeholder-slate-400/80 transition-all text-xs focus:ring-1 focus:ring-green-500/10 focus:outline-hidden"
            />
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
              title="Admin Login"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Admin</span>
            </button>

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/25 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              <span>{formatPrice(cartSubtotal)}</span>
              {totalItemsCount > 0 && (
                <span className="bg-white text-orange-600 font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── HIGH CONTRAST DYNAMIC HERO SECTION ── */}
      <section className="px-4 py-6">
        <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-green-800 via-emerald-700 to-green-950 text-white shadow-2xl relative overflow-hidden p-6 sm:p-12 text-left">
          {/* Accent radial glow overlay */}
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full bg-radial from-orange-500/20 via-transparent to-transparent blur-3xl pointer-events-none -mr-40 -mt-40" />

          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 relative z-10">
            
            {/* Left Content */}
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xs">
                <Truck className="w-3.5 h-3.5 fill-white text-orange-500" />
                <span>Envíos en 45 minutos</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-none">
                Tu mercado fresco <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                  directo a tu hogar
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-green-100 font-medium max-w-lg leading-relaxed">
                ¡Olvídate de las filas! Pide las carnes más tiernas, verduras frescas recolectadas hoy, abarrotes y aseo al mejor precio del mercado.
              </p>

              {/* Badges block */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-white">Garantía</h4>
                    <p className="text-[9px] text-green-200">Reembolso si no te gusta</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Percent className="w-4 h-4 text-orange-300" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-white">Descuentos</h4>
                    <p className="text-[9px] text-green-200">Ofertas reales a diario</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button 
                  onClick={() => {
                    const el = document.getElementById('departments-navigation');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-500/15 cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <span>Pedir Ahora</span>
                  <ArrowRight className="w-4 h-4 stroke-[3px]" />
                </button>

                <button 
                  onClick={() => setSelectedCategory('Ofertas')} 
                  className="bg-white/15 hover:bg-white/20 text-white border border-white/10 px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-4.5 h-4.5 text-orange-400 fill-orange-400" />
                  <span>Sección de Ofertas</span>
                </button>
              </div>
            </div>

            {/* Right Large Market Image with custom glow frame */}
            <div className="md:col-span-5 flex justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-3xl blur-2xl opacity-30 scale-95 pointer-events-none" />
              <div className="w-full max-w-sm aspect-1.2 rounded-3xl overflow-hidden border-4 border-white/15 shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80" 
                  alt="Mercado de alimentos frescos" 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-5 text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-yellow-300">100% Cosechados a Mano</span>
                  <h4 className="text-sm font-black text-white mt-1">Frutas y Verduras Orgánicas</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">Frescura del campo directo a tu puerta.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-6xl mx-auto px-4 py-4 flex-1 w-full flex flex-col gap-10">
        
        {/* Department Navigation Card Buttons */}
        <section id="departments-navigation" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 text-left">Departamentos Recomendados</h3>
          </div>
          
          <div className="flex items-center gap-3.5 overflow-x-auto pb-4 pt-1 scrollbar-thin select-none scroll-smooth">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const style = CATEGORY_STYLES[cat.name] || CATEGORY_STYLES['Todas'];

              return (
                <div
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-20 sm:w-24 h-24 sm:h-28 rounded-3xl flex flex-col items-center justify-center p-3 cursor-pointer shrink-0 transition-all border ${
                    isSelected 
                      ? `bg-gradient-to-br ${style.gradient} border-transparent text-white scale-105 shadow-lg shadow-green-600/15` 
                      : 'bg-white border-slate-200/50 hover:border-slate-300 hover:scale-105 shadow-xs'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs transition-all ${isSelected ? 'bg-white/20' : 'bg-slate-50'}`}>
                    {cat.emoji}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-black tracking-tight mt-2.5 ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* HIGH CONVERTING SAVINGS COMBOS BLOCK [NEW] */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 text-left">🧺 Combos de Ahorro Popular</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Combo 1 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-200/60 p-5 flex flex-col justify-between shadow-xs text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-green-200/30 blur-xl pointer-events-none" />
              <div>
                <span className="bg-green-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">Saludable</span>
                <h4 className="text-sm font-black text-slate-800 mt-2">Combo Sancocho Casero</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">Incluye papas, plátanos, cebolla, tomate, y cilantro fresco seleccionado.</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-500 font-bold">🥦 Verduras</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-500 font-bold">🧅 3 Variedades</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-green-200/30">
                <span className="text-xs font-black text-green-800">Llevar todo por $12.500</span>
                <button 
                  onClick={() => addComboToCart('Sancocho Casero', ['p7', 'p8', 'p9'])}
                  className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Agregar Combo
                </button>
              </div>
            </div>

            {/* Combo 2 */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl border border-red-200/60 p-5 flex flex-col justify-between shadow-xs text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-red-200/30 blur-xl pointer-events-none" />
              <div>
                <span className="bg-red-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">Asado Asombroso</span>
                <h4 className="text-sm font-black text-slate-800 mt-2">Combo Parrillada Premium</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">Incluye lomo de res premium fresco, alitas de pollo adobables y aguacate Hass.</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-500 font-bold">🥩 Carnes</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-500 font-bold">🥑 Acompañante</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-red-200/30">
                <span className="text-xs font-black text-red-800">Llevar todo por $68.400</span>
                <button 
                  onClick={() => addComboToCart('Parrillada Premium', ['p1', 'p4', 'p10'])}
                  className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Agregar Combo
                </button>
              </div>
            </div>

            {/* Combo 3 */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border border-orange-200/60 p-5 flex flex-col justify-between shadow-xs text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-orange-200/30 blur-xl pointer-events-none" />
              <div>
                <span className="bg-orange-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">Vitaminas al Día</span>
                <h4 className="text-sm font-black text-slate-800 mt-2">Combo Ensalada Dulce</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">Fresas seleccionadas rojas y dulces acompañadas de banano Urabá fresco.</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-500 font-bold">🍎 Frutas</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-500 font-bold">🍌 100% Orgánico</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-orange-200/30">
                <span className="text-xs font-black text-orange-800">Llevar todo por $11.000</span>
                <button 
                  onClick={() => addComboToCart('Ensalada Dulce', ['p11', 'p12'])}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Agregar Combo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* DYNAMIC HOT DEALS ROW (IF AVAILABLE) [NEW] */}
        {dealsProducts.length > 0 && (
          <section className="w-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 fill-white text-white animate-bounce" />
                <h3 className="text-sm font-black uppercase tracking-wider">Ofertas Imperdibles del Día</h3>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">¡Solo por 24 horas!</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dealsProducts.map((p) => {
                const savingPct = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
                return (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="bg-white rounded-2xl p-3 text-slate-800 flex flex-col justify-between cursor-pointer hover:scale-103 transition-all relative group"
                  >
                    <span className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-xs">
                      -{savingPct}%
                    </span>

                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300" />
                    </div>

                    <div className="text-left">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{p.name}</h4>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xs font-black text-slate-800">{formatPrice(p.price)}</span>
                        {p.oldPrice && <span className="text-[10px] text-slate-400 line-through">{formatPrice(p.oldPrice)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* PRODUCT CATALOG GRID & RECOMMENDATIONS */}
        <section className="w-full flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800 text-left flex items-center gap-2">
                <span>{selectedCategory === 'Todas' ? 'Nuestros Productos Seleccionados' : selectedCategory}</span>
              </h3>
              <p className="text-xs text-slate-400 text-left mt-0.5 font-medium">
                Encontramos {filteredProducts.length} deliciosos productos listos para entregar
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/50 shadow-xs max-w-md mx-auto my-8">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600">No encontramos resultados</p>
              <p className="text-xs text-slate-400 mt-1 px-4">Intenta buscar otro producto o cambia la categoría de filtro.</p>
              <button 
                onClick={() => { setSelectedCategory('Todas'); setSearchQuery(''); }}
                className="mt-5 px-4.5 py-2.5 rounded-xl text-xs font-black bg-green-600 text-white cursor-pointer active:scale-95 transition-all"
              >
                Restaurar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product, index) => {
                const cartItem = cart.find(item => item.product.id === product.id);
                const quantityInCart = cartItem ? cartItem.quantity : 0;
                const isOutOfStock = product.stock <= 0;
                
                // Smart decorative badges
                let badge = null;
                if (index === 0) badge = { text: 'Premium ⭐', color: 'bg-indigo-600' };
                else if (index === 2) badge = { text: 'Fresco 🍏', color: 'bg-emerald-600' };
                else if (index === 4) badge = { text: 'Más Vendido 🔥', color: 'bg-amber-600' };
                else if (product.oldPrice) badge = { text: 'Oferta ⚡', color: 'bg-rose-600' };

                return (
                  <div 
                    key={product.id}
                    className="bg-white rounded-3xl border border-slate-200/40 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group text-left relative"
                  >
                    {/* Badge absolute overlays */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
                      {badge && (
                        <div className={`${badge.color} text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm`}>
                          {badge.text}
                        </div>
                      )}
                      {product.stock > 0 && product.stock <= 5 && (
                        <div className="bg-red-500 text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider">
                          Quedan {product.stock}
                        </div>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                    </button>

                    {/* Image frame */}
                    <div 
                      className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer" 
                      onClick={() => setSelectedProduct(product)}
                    >
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300"
                      />
                      
                      {/* Dark overlay for out of stock */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 text-center">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-2.5 py-1 rounded-lg">Agotado</span>
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-4 flex flex-col flex-1 gap-2.5 justify-between bg-white">
                      <div className="cursor-pointer space-y-1 flex-1" onClick={() => setSelectedProduct(product)}>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-1.5 py-0.5 rounded-sm">
                            {product.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-green-600 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Pricing Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          {product.oldPrice && (
                            <span className="text-[9px] text-slate-400 line-through block leading-none mb-0.5">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                          <span className="text-sm font-black text-slate-800 block leading-none">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        {/* Interactive Cart Buttons */}
                        {isOutOfStock ? (
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                            <Plus className="w-4 h-4" />
                          </div>
                        ) : quantityInCart > 0 ? (
                          <div className="flex items-center bg-green-50 rounded-xl border border-green-200 overflow-hidden shadow-xs">
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="px-2 py-2 text-green-600 hover:bg-green-100/50 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-1 text-xs font-black text-green-700 min-w-4 text-center">
                              {quantityInCart}
                            </span>
                            <button
                              onClick={() => addToCart(product)}
                              className="px-2 py-2 text-green-600 hover:bg-green-100/50 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer active:scale-95 shadow-md shadow-green-600/10 transition-all shrink-0"
                            title="Agregar al Carrito"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ── SHOPPING CART DRAWER ── */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsCartOpen(false)} />

        {/* Panel */}
        <div className={`absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-100 bg-green-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <h3 className="text-xs font-black uppercase tracking-wider">Tu Carrito</h3>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {totalItemsCount}
              </span>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
                <p className="text-sm font-bold text-slate-600">El carrito está vacío</p>
                <p className="text-xs text-slate-400 mt-1">Navega en la tienda y agrega los mejores productos frescos.</p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-4.5 py-2.5 rounded-xl text-xs font-black bg-green-600 text-white cursor-pointer active:scale-95"
                >
                  Seguir Comprando
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/40 text-left relative">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 truncate">{item.product.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{item.product.category}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-black text-slate-700">{formatPrice(item.product.price)}</span>
                      
                      {/* Quantity control */}
                      <div className="flex items-center bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="px-1.5 py-1 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-1 text-xs font-bold text-slate-700 min-w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item.product)}
                          className="px-1.5 py-1 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Completely */}
                  <button 
                    onClick={() => {
                      const updatedCart = cart.filter(c => c.product.id !== item.product.id);
                      saveCartToStorage(updatedCart);
                    }}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-4">
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    Domicilio
                    {shippingFee === 0 && <span className="bg-green-100 text-green-700 font-black text-[9px] px-1.5 py-0.5 rounded-md">GRATIS</span>}
                  </span>
                  <span className="font-bold text-slate-800">{shippingFee === 0 ? 'Gratis' : formatPrice(shippingFee)}</span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-[10px] text-green-600 font-bold text-left">
                    💡 Agrega <b>{formatPrice(80000 - cartSubtotal)}</b> más para tener envío <b>GRATIS</b>.
                  </p>
                )}
                <div className="border-t border-slate-200 pt-2.5 flex justify-between text-sm font-black text-slate-800">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 transition-all text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/10 active:scale-95"
              >
                <span>Proceder al Pago</span>
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── PRODUCT DETAIL MODAL ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedProduct(null)} />

          {/* Panel */}
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200/40 text-left animate-float">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-900/40 hover:bg-slate-900/60 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Product Image */}
            <div className="h-56 sm:h-64 relative bg-slate-100">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="object-cover w-full h-full" />
              {selectedProduct.oldPrice && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  ¡Oferta Especial!
                </div>
              )}
            </div>

            {/* Product Detail Content */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-green-700 bg-green-50 px-2.5 py-1 rounded-md inline-block border border-green-200/30">
                  {selectedProduct.category}
                </span>
                <h3 className="text-base font-black text-slate-800 mt-2">{selectedProduct.name}</h3>
                
                {/* Stock Tag */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-[10px] text-slate-400 font-bold">
                    {selectedProduct.stock > 0 ? `Stock disponible: ${selectedProduct.stock} unidades` : 'Sin inventario disponible'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                <p className="text-xs text-slate-500 font-bold leading-relaxed">{selectedProduct.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Precio unitario</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-slate-800">{formatPrice(selectedProduct.price)}</span>
                    {selectedProduct.oldPrice && (
                      <span className="text-xs text-slate-400 line-through">{formatPrice(selectedProduct.oldPrice)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedProduct.stock > 0 ? (
                    <button
                      onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                      className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Agregar al Carrito</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-5 py-3 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
                    >
                      Agotado
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
