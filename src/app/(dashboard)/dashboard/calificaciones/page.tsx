'use client';

import React, { useState, useEffect } from 'react';
import { Star, RefreshCw, Award } from 'lucide-react';
import { getRatings, Rating } from '@/lib/db';
import { useTranslation } from '@/hooks/useTranslation';
import { translations } from '@/config/translations';

export default function AdminRatingsPage() {
  const { language } = useTranslation();
  const t = translations[language];

  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRatingsData = () => {
    setLoading(true);
    setRatings(getRatings());
    setLoading(false);
  };

  useEffect(() => {
    loadRatingsData();
  }, []);

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-0.5 justify-center">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            className={`w-3.5 h-3.5 ${
              s <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
            }`} 
          />
        ))}
      </div>
    );
  };

  const getAverageScore = (r: Rating) => {
    return ((r.productRating + r.serviceRating + r.deliveryRating) / 3).toFixed(1);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-12 text-left">
      
      {/* Title block */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500 animate-spin-slow" />
            <span>{t.admin.ratingsTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.admin.ratingsSubtitle}
          </p>
        </div>
        
        <button
          onClick={loadRatingsData}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{language === 'en' ? 'Refresh' : 'Actualizar'}</span>
        </button>
      </div>

      {/* Ratings List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Award className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold">{t.admin.ratingsEmpty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="px-5 py-4">{t.admin.ratingsHeaderClient}</th>
                  <th className="py-4 text-center">{t.admin.ratingsAverage}</th>
                  <th className="py-4 text-center">{t.success.rateProduct}</th>
                  <th className="py-4 text-center">{t.success.rateService}</th>
                  <th className="py-4 text-center">{t.success.rateDelivery}</th>
                  <th className="px-5 py-4">{t.admin.ratingsHeaderComment}</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800 block">{r.customerName}</span>
                      <span className="text-[10px] font-mono text-green-600 font-bold block mt-0.5">{r.orderId}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-block px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-black rounded-lg">
                        ⭐ {getAverageScore(r)}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      {renderStars(r.productRating)}
                    </td>
                    <td className="py-4 text-center">
                      {renderStars(r.serviceRating)}
                    </td>
                    <td className="py-4 text-center">
                      {renderStars(r.deliveryRating)}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium italic max-w-xs truncate" title={r.comment}>
                      {r.comment || (language === 'en' ? 'No comments left.' : 'Sin comentarios.')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
