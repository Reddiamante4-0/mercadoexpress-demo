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

export default function AdminClientsPage() {
  const { language } = useTranslation();
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
            <span>Directorio de Clientes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualiza los datos de contacto, direcciones registradas y estadísticas de compra de tus clientes.
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
          placeholder="Buscar cliente por nombre, teléfono, dirección..."
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
                <th className="px-5 py-4">Cliente</th>
                <th className="py-4">Contacto</th>
                <th className="py-4">Dirección Principal</th>
                <th className="py-4 text-center">Pedidos</th>
                <th className="px-5 py-4 text-right">Total Comprado</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    
                    {/* User profile details */}
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-50 text-green-700 font-bold flex items-center justify-center shrink-0 border border-green-100">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{client.name}</p>
                        <span className="text-[9px] text-slate-400 font-mono">ID: {client.id}</span>
                      </div>
                    </td>

                    {/* Contact (Phone) */}
                    <td className="py-4">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <Phone className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-4">
                      <div className="flex items-start gap-1 text-slate-500 max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    </td>

                    {/* Orders count */}
                    <td className="py-4 text-center">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
                        {client.ordersCount}
                      </span>
                    </td>

                    {/* Total spent */}
                    <td className="px-5 py-4 text-right">
                      <span className="font-black text-slate-800">
                        {formatPrice(client.totalSpent)}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
