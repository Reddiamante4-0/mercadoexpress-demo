'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Download, 
  ChevronRight, 
  FileText, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  Users,
  Award
} from 'lucide-react';
import { getSalesMetrics, SalesMetrics } from '@/lib/db';
import { useToast } from '@/components/ui/ToastProvider';
import { useTranslation } from '@/hooks/useTranslation';
import { translations } from '@/config/translations';

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

export default function AdminSalesPage() {
  const { toast } = useToast();
  const { language } = useTranslation();
  const t = translations[language];

  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setMetrics(getSalesMetrics());
    setLoading(false);
  }, []);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleDownloadReport = () => {
    setDownloading(true);
    toast({
      title: t.admin.salesToastExporting,
      type: 'success'
    });

    setTimeout(() => {
      setDownloading(false);
      toast({
        title: t.admin.salesToastExported,
        type: 'success'
      });
      // Simulate file download
      const element = document.createElement("a");
      const file = new Blob(["Reporte de Ventas MercadoExpress - Julio 2026\n\nTotal Ventas: " + formatPrice(metrics?.totalSales || 0)], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "Reporte-Ventas-MercadoExpress.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 2000);
  };

  if (loading || !metrics) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  // Calculate some insights
  const avgOrderValue = metrics.totalOrders > 0 ? metrics.totalSales / metrics.totalOrders : 0;
  const bestCategory = metrics.categorySales.length > 0 ? metrics.categorySales[0] : null;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-12 text-left">
      
      {/* Title section */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600 animate-bounce" />
            <span>{t.admin.salesTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.admin.salesSubtitle}
          </p>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <Download className="w-4.5 h-4.5" />
          <span>{t.admin.salesExport}</span>
        </button>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.admin.statSales}</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-800">{formatPrice(metrics.totalSales)}</span>
          </div>
          <span className="text-[9px] text-green-600 font-bold mt-2">
            {language === 'en' ? '🚀 +15% vs previous month' : '🚀 +15% vs el mes anterior'}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.admin.salesAvgTicket}</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-800">{formatPrice(avgOrderValue)}</span>
          </div>
          <span className="text-[9px] text-slate-400 font-bold mt-2">{t.admin.salesAvgTicketDesc}</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.admin.salesBestCategory}</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-800 truncate">
              {bestCategory ? (categoryTranslations[language][bestCategory.category] || bestCategory.category) : 'N/A'}
            </span>
          </div>
          <span className="text-[9px] text-orange-600 font-bold mt-2">
            {language === 'en'
              ? `🔥 ${bestCategory ? formatPrice(bestCategory.amount) : '$0'} in revenue`
              : `🔥 ${bestCategory ? formatPrice(bestCategory.amount) : '$0'} en facturación`}
          </span>
        </div>

      </div>

      {/* Detailed charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left: Category Breakdown Table (Col Span 3) */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs lg:col-span-3 space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">{t.admin.salesDistributionTitle}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{t.admin.salesDistributionSubtitle}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="py-2.5">{language === 'en' ? 'Department' : 'Departamento'}</th>
                  <th className="py-2.5 text-right">{language === 'en' ? 'Revenue' : 'Facturación'}</th>
                  <th className="py-2.5 text-right">{language === 'en' ? 'Contribution' : 'Contribución'}</th>
                </tr>
              </thead>
              <tbody>
                {metrics.categorySales.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">{language === 'en' ? 'No records yet.' : 'No hay registros aún.'}</td>
                  </tr>
                ) : (
                  metrics.categorySales.map((cat, idx) => {
                    const totalSales = metrics.categorySales.reduce((s, c) => s + c.amount, 0);
                    const contribution = totalSales > 0 ? (cat.amount / totalSales) * 100 : 0;
                    
                    return (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-bold text-slate-700">{categoryTranslations[language][cat.category] || cat.category}</td>
                        <td className="py-3 text-right font-black text-slate-800">{formatPrice(cat.amount)}</td>
                        <td className="py-3 text-right font-semibold text-orange-600">{Math.round(contribution)}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Insights card (Col Span 2) */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">
              {language === 'en' ? 'Financial Insights' : 'Perspectivas Financieras'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {language === 'en' ? 'Automatically generated analysis' : 'Análisis generado automáticamente'}
            </p>
          </div>

          <div className="space-y-4 flex-1 mt-4">
            <div className="flex gap-2.5 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Award className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-700">
                  {language === 'en' ? 'High Performance' : 'Rendimiento Alto'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {language === 'en'
                    ? 'Fresh proteins (meats and fish) represent the highest percentage of your sales. Make sure to keep consistent inventory.'
                    : 'Las proteínas frescas (carnes y pescados) representan el mayor porcentaje de tus ventas. Asegúrate de mantener un stock constante.'}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Calendar className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-700">
                  {language === 'en' ? 'Peak Order Days' : 'Días Pico de Pedidos'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {language === 'en'
                    ? 'Weekends are projected to see a 35% increase in orders. Plan shipments to keep delivery times low.'
                    : 'Los fines de semana se proyecta un aumento del 35% en pedidos. Planifica los despachos para mantener los tiempos de entrega bajos.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-xl border border-green-200/50 text-[10px] text-green-800 text-center font-medium">
            {language === 'en'
              ? '💡 Tip: Add more "Offers" family combos to increase the average ticket above $70,000.'
              : '💡 Consejo: Agrega más combos familiares de "Ofertas" para incrementar el ticket promedio por encima de $70.000.'}
          </div>
        </div>

      </div>

    </div>
  );
}
