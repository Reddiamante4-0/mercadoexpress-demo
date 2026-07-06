'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, ShoppingBag } from 'lucide-react';
import { getOrders, getProducts, Order, Product } from '@/lib/db';
import { useTranslation } from '@/hooks/useTranslation';
import { translations } from '@/config/translations';

interface AccumulatedItem {
  productId: string;
  name: string;
  nameEn?: string;
  quantity: number;
  unit: string;
  unitEn: string;
}

export default function AdminPresalePage() {
  const { language } = useTranslation();
  const t = translations[language];

  const [accumulated, setAccumulated] = useState<AccumulatedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPresaleData = () => {
    setLoading(true);
    const orders = getOrders();
    const products = getProducts();

    // Filter weekly presale orders
    const weeklyOrders = orders.filter(o => o.deliveryType === 'weekly' && o.status !== 'Cancelado');

    // Group items by productId
    const totals: Record<string, number> = {};
    weeklyOrders.forEach(order => {
      order.items.forEach(item => {
        totals[item.productId] = (totals[item.productId] || 0) + item.quantity;
      });
    });

    // Match with product units
    const list: AccumulatedItem[] = Object.entries(totals).map(([productId, quantity]) => {
      const prod = products.find(p => p.id === productId);
      return {
        productId,
        name: prod ? prod.name : productId,
        nameEn: prod?.nameEn,
        quantity,
        unit: prod?.unit || 'unidad',
        unitEn: prod?.unitEn || prod?.unit || 'unit'
      };
    });

    setAccumulated(list);
    setLoading(false);
  };

  useEffect(() => {
    loadPresaleData();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-12 text-left">
      
      {/* Title block */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600 animate-pulse" />
            <span>{t.admin.presaleTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.admin.presaleSubtitle}
          </p>
        </div>
        
        <button
          onClick={loadPresaleData}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{language === 'en' ? 'Refresh' : 'Actualizar'}</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
            {t.admin.presaleAccumulatedTitle}
          </h3>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : accumulated.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold">{t.admin.presaleEmpty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="px-6 py-4">{t.admin.presaleProduct}</th>
                  <th className="px-6 py-4 text-center">{t.admin.presaleQuantity}</th>
                  <th className="px-6 py-4 text-center">{t.admin.presaleUnit}</th>
                  <th className="px-6 py-4 text-right">{t.admin.presaleTotalLb}</th>
                </tr>
              </thead>
              <tbody>
                {accumulated.map((item) => {
                  const isPounds = item.unit.toLowerCase() === 'lb' || item.unit.toLowerCase() === 'libra';
                  const totalLbDisplay = isPounds ? `${item.quantity} lb` : 'N/A';
                  
                  return (
                    <tr key={item.productId} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {language === 'en' && item.nameEn ? item.nameEn : item.name}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-500">
                        {language === 'en' ? item.unitEn : item.unit}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-green-700">
                        {totalLbDisplay}
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
