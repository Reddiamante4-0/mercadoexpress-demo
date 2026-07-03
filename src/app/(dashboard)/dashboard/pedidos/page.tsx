'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  MapPin, 
  Phone, 
  CreditCard, 
  Clock, 
  Check, 
  X,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getOrders, saveOrder, Order } from '@/lib/db';
import { useToast } from '@/components/ui/ToastProvider';
import { useTranslation } from '@/hooks/useTranslation';

const STATUS_OPTIONS = [
  'Recibido',
  'En preparación',
  'En camino',
  'Entregado',
  'Cancelado'
];

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const { language } = useTranslation();

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Load orders on mount
  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const handleStatusChange = (order: Order, newStatus: any) => {
    const updatedOrder = { ...order, status: newStatus };
    const updatedList = saveOrder(updatedOrder);
    setOrders(updatedList);
    toast({
      title: language === 'en' 
        ? `Order status changed to: ${newStatus}` 
        : `Estado del pedido cambiado a: ${newStatus}`,
      type: 'success'
    });
  };

  const toggleExpandOrder = (id: string) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(id);
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  const getStatusStyle = (status: string) => {
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

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Filters
  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter;
    const matchesSearch = o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-12 text-left">
      
      {/* Title section */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-green-600 animate-bounce" />
            <span>Pedidos Recibidos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualiza los pedidos de tus clientes en tiempo real y gestiona el flujo de despacho.
          </p>
        </div>
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por ID, cliente, dirección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
          />
        </div>

        {/* Filter by status */}
        <div className="md:col-span-2 flex items-center gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Filtrar por</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="Todos">Todos los estados</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">No se encontraron pedidos</p>
            <p className="text-xs text-slate-400 mt-1">No hay órdenes registradas con los filtros seleccionados.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div 
                key={order.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-xs ${
                  isExpanded ? 'border-green-300 shadow-md' : 'border-slate-200/60 hover:border-slate-300'
                }`}
              >
                {/* Header of Card */}
                <div 
                  onClick={() => toggleExpandOrder(order.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-700 text-sm">{order.id}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{formatDate(order.createdAt)}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-0.5">{order.customerName}</h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 self-start sm:self-center">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-left sm:text-right">Total Pedido</span>
                      <span className="text-sm font-black text-slate-800 block mt-0.5">{formatPrice(order.total)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 grid grid-cols-1 md:grid-cols-5 gap-6 text-xs text-slate-600">
                    
                    {/* Column 1 & 2: Client/Delivery Details (Span 2) */}
                    <div className="md:col-span-2 space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Detalles del Cliente</h5>
                      
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/50">
                        <div className="flex gap-2.5 items-start">
                          <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-700">Dirección</p>
                            <p className="text-slate-400 mt-0.5">{order.address}</p>
                          </div>
                        </div>

                        <div className="flex gap-2.5 items-center">
                          <Phone className="w-4 h-4 text-green-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-700 mr-1.5">Teléfono:</span>
                            <span className="font-medium text-slate-600">{order.phone}</span>
                          </div>
                        </div>

                        <div className="flex gap-2.5 items-center">
                          <CreditCard className="w-4 h-4 text-green-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-700 mr-1.5">Pago:</span>
                            <span className="font-medium text-slate-600">{order.paymentDetails}</span>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/40 text-[10px] text-slate-400 italic">
                            <b>Instrucciones:</b> {order.notes}
                          </div>
                        )}
                      </div>

                      {/* Status quick switcher dropdown */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1 block">Actualizar Estado</label>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-green-600"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Column 3 & 4 & 5: Items Purchased List (Span 3) */}
                    <div className="md:col-span-3 space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Productos Solicitados</h5>
                      
                      <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden shadow-xs">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                              <th className="px-4 py-2">Item</th>
                              <th className="py-2 text-right">Unitario</th>
                              <th className="py-2 text-center">Cant</th>
                              <th className="px-4 py-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-50">
                                <td className="px-4 py-2.5 font-bold text-slate-700 truncate max-w-xs">{item.name}</td>
                                <td className="py-2.5 text-right font-medium text-slate-500">{formatPrice(item.price)}</td>
                                <td className="py-2.5 text-center font-bold text-slate-600">{item.quantity}</td>
                                <td className="px-4 py-2.5 text-right font-bold text-slate-800">{formatPrice(item.price * item.quantity)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Receipts breakdown */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-1.5 text-xs text-slate-500">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-bold text-slate-700">{formatPrice(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Costo Domicilio</span>
                            <span className="font-bold text-slate-700">{order.shippingFee === 0 ? 'Gratis' : formatPrice(order.shippingFee)}</span>
                          </div>
                          <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-800">
                            <span>Total Facturado</span>
                            <span>{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
