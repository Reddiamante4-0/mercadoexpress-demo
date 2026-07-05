'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  ArrowRight,
  ClipboardList,
  Plus,
  Package
} from 'lucide-react';
import { getSalesMetrics, getOrders, getProducts, Order, Product, SalesMetrics } from '@/lib/db';
import { useToast } from '@/components/ui/ToastProvider';
import { useTranslation } from '@/hooks/useTranslation';
import { translations } from '@/config/translations';

const statusTranslations: Record<string, Record<string, string>> = {
  es: {
    'Recibido': 'Recibido',
    'En preparación': 'En preparación',
    'En camino': 'En camino',
    'Entregado': 'Entregado',
    'Cancelado': 'Cancelado'
  },
  en: {
    'Recibido': 'Received',
    'En preparación': 'Preparing',
    'En camino': 'On the way',
    'Entregado': 'Delivered',
    'Cancelado': 'Canceled'
  }
};

const categoryTranslations: Record<string, Record<string, string>> = {
  es: {
    'Todas': 'Todas',
    'Carnes': 'Carnes',
    'Pollo': 'Pollo',
    'Pescado': 'Pescado',
    'Verduras': 'Verduras',
    'Frutas': 'Frutas',
    'Abarrotes': 'Abarrotes',
    'Bebidas': 'Bebidas',
    'Aseo': 'Aseo',
    'Congelados': 'Congelados',
    'Ofertas': 'Ofertas'
  },
  en: {
    'Todas': 'All',
    'Carnes': 'Meats',
    'Pollo': 'Chicken',
    'Pescado': 'Fish',
    'Verduras': 'Vegetables',
    'Frutas': 'Fruits',
    'Abarrotes': 'Groceries',
    'Bebidas': 'Drinks',
    'Aseo': 'Cleaning',
    'Congelados': 'Frozen',
    'Ofertas': 'Offers'
  }
};

export default function DashboardAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useTranslation();
  const t = translations[language];

  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch metrics, orders, products
    const salesMetrics = getSalesMetrics();
    const allOrders = getOrders();
    const allProducts = getProducts();

    setMetrics(salesMetrics);
    setRecentOrders(allOrders.slice(0, 5)); // Last 5 orders
    setLowStockItems(allProducts.filter(p => p.stock <= 5 && p.active));
    setLoading(false);
  }, []);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recibido':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'En preparación':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'En camino':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Entregado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPaymentDetailsShort = (details: string) => {
    if (details.toLowerCase().includes('tarjeta') || details.toLowerCase().includes('card')) {
      return language === 'en' ? 'Card' : 'Tarjeta';
    }
    if (details.toUpperCase().includes('PSE')) return 'PSE';
    return language === 'en' ? 'Wallet' : 'Billetera';
  };

  if (loading || !metrics) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-12 text-left">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800">
            {t.admin.overviewTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.admin.overviewSubtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/dashboard/productos')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.admin.addProductBtn}</span>
          </button>
          <button
            onClick={() => router.push('/dashboard/pedidos')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>{t.admin.viewOrdersBtn}</span>
          </button>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Sales */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.admin.statSales}</span>
            <span className="text-base font-black text-slate-800 mt-0.5 block">{formatPrice(metrics.totalSales)}</span>
          </div>
        </div>

        {/* Stat 2: Total Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.admin.statOrders}</span>
            <span className="text-base font-black text-slate-800 mt-0.5 block">
              {metrics.totalOrders} {t.admin.statOrdersUnit}
            </span>
          </div>
        </div>

        {/* Stat 3: Active Clients */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.admin.statClients}</span>
            <span className="text-base font-black text-slate-800 mt-0.5 block">
              {metrics.activeClients} {t.admin.statClientsUnit}
            </span>
          </div>
        </div>

        {/* Stat 4: Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            metrics.lowStockCount > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.admin.statStockAlerts}</span>
            <span className="text-base font-black text-slate-800 mt-0.5 block">
              {metrics.lowStockCount} {t.admin.statStockAlertsUnit}
            </span>
          </div>
        </div>

      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left: Sales Chart (Col Span 3) */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs lg:col-span-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">{t.admin.chartSalesTitle}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{t.admin.chartSalesSubtitle}</p>
          </div>

          {/* Bar Chart Graphics */}
          <div className="mt-8 flex items-end justify-around h-48 border-b border-slate-100 pb-2">
            {metrics.monthlySales.map((item, idx) => {
              const maxVal = Math.max(...metrics.monthlySales.map(m => m.amount));
              const heightPct = maxVal > 0 ? (item.amount / maxVal) * 85 : 0;
              
              // Localized month name
              const monthDisplay = language === 'en' 
                ? (item.month === 'Mayo' ? 'May' : item.month === 'Junio' ? 'June' : 'July') 
                : item.month;

              return (
                <div key={item.month} className="flex flex-col items-center gap-2 w-16 group relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-md z-10 whitespace-nowrap">
                    {formatPrice(item.amount)}
                  </div>
                  {/* Bar */}
                  <div 
                    style={{ height: `${heightPct}%` }}
                    className="w-8 bg-green-500 rounded-t-lg group-hover:bg-green-600 transition-all duration-300 shadow-sm"
                  />
                  {/* Label */}
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{monthDisplay}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400 font-bold">
            <span>{t.admin.chartSalesUpdate}</span>
            <button 
              onClick={() => router.push('/dashboard/ventas')}
              className="text-green-600 hover:text-green-700 flex items-center gap-0.5 cursor-pointer"
            >
              <span>{t.admin.chartSalesLink}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Category Distribution (Col Span 2) */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs lg:col-span-2 flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">{t.admin.chartCategoryTitle}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{t.admin.chartCategorySubtitle}</p>

          <div className="mt-4 flex-1 space-y-3.5 overflow-y-auto max-h-52 pr-1">
            {metrics.categorySales.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">{t.admin.chartCategoryEmpty}</p>
            ) : (
              metrics.categorySales.slice(0, 4).map((cat) => {
                const totalCategorySales = metrics.categorySales.reduce((s, c) => s + c.amount, 0);
                const pct = totalCategorySales > 0 ? (cat.amount / totalCategorySales) * 100 : 0;
                
                return (
                  <div key={cat.category} className="space-y-1 text-left">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>{categoryTranslations[language][cat.category] || cat.category}</span>
                      <span>{formatPrice(cat.amount)} ({Math.round(pct)}%)</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="bg-orange-500 h-full rounded-full" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ── LOWER ROW: RECENT ORDERS & STOCK ALERTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders (Col Span 2) */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">{t.admin.recentOrdersTitle}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.admin.recentOrdersSubtitle}</p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/pedidos')}
              className="text-xs text-green-600 hover:text-green-700 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>{language === 'en' ? 'View all' : 'Ver todos'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">{t.admin.recentOrdersClient}</th>
                  <th className="py-2.5">{t.admin.recentOrdersDeliveryType}</th>
                  <th className="py-2.5">{t.admin.recentOrdersTotal}</th>
                  <th className="py-2.5">{t.admin.recentOrdersStatus}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">{t.admin.recentOrdersEmpty}</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-bold font-mono text-slate-600">{order.id}</td>
                      <td className="py-3 font-bold text-slate-700">{order.customerName}</td>
                      <td className="py-3 font-medium text-slate-500">
                        {order.deliveryType === 'weekly' 
                          ? (language === 'en' ? 'Weekly Presale' : 'Preventa Semanal') 
                          : (language === 'en' ? 'Daily Delivery' : 'Venta Diaria')}
                      </td>
                      <td className="py-3 font-black text-slate-800">{formatPrice(order.total)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(order.status)}`}>
                          {statusTranslations[language][order.status] || order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Items (Col Span 1) */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs space-y-4 text-left">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">{t.admin.lowStockTitle}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{t.admin.lowStockSubtitle}</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-10">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                <p className="text-xs text-slate-400 font-bold">{t.admin.lowStockEmpty}</p>
              </div>
            ) : (
              lowStockItems.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                      <img src={prod.image} alt={prod.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 truncate text-[11px]">
                        {language === 'en' && prod.nameEn ? prod.nameEn : prod.name}
                      </h4>
                      <span className="text-[9px] text-slate-400 block">
                        {categoryTranslations[language][prod.category] || prod.category}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    prod.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {prod.stock === 0 
                      ? (language === 'en' ? 'Out of stock' : 'Agotado') 
                      : `${prod.stock} ${language === 'en' ? (prod.unitEn || 'unit') : (prod.unit || 'und')}`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
