'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  TrendingUp, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { getClients, Client } from '@/lib/db';
import { useTranslation } from '@/hooks/useTranslation';
import { translations } from '@/config/translations';

export default function AdminClientsPage() {
  const { language } = useTranslation();
  const t = translations[language];

  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load clients on mount
  useEffect(() => {
    setClients(getClients());
    setLoading(false);
  }, []);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Filter clients
  const filteredClients = clients.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.phone.includes(searchQuery) ||
           c.address.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Users className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-12 text-left">
      
      {/* Title section */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600 animate-bounce" />
            <span>{t.admin.clientsTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.admin.clientsSubtitle}
          </p>
        </div>
      </div>

      {/* Search filter */}
      <div className="relative w-full max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder={t.admin.clientsSearch}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
        />
      </div>

      {/* Clients Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                <th className="px-5 py-4">{t.admin.clientsHeaderName}</th>
                <th className="py-4">{t.admin.clientsHeaderContact}</th>
                <th className="py-4">{t.admin.clientsHeaderAddress}</th>
                <th className="py-4 text-center">{t.admin.clientsHeaderCount}</th>
                <th className="px-5 py-4 text-right">{t.admin.clientsHeaderTotalSpent}</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                    {t.admin.clientsEmpty}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black font-mono">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">{client.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ID: {client.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-green-600" />
                        <span className="font-medium">{client.phone}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1 text-slate-500 max-w-xs truncate">
                        <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-black font-mono">
                        {client.ordersCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-black text-slate-800">
                      {formatPrice(client.totalSpent)}
                    </td>
                  </tr>
                )))
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
