'use client';

import React, { useState, useEffect } from 'react';
import { getProducts, saveOrder, getCurrentStoreId, Product, Order } from '@/lib/supabase-api';
import { useToast } from '@/components/ui/ToastProvider';
import { Store, Loader2 } from 'lucide-react';

export default function MostradorPage() {
  const { toast } = useToast();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadData() {
      const id = await getCurrentStoreId();
      if (!id || !active) {
        setLoading(false);
        return;
      }
      setStoreId(id);
      const data = await getProducts(id);
      if (active) {
        setProducts(data.filter(p => p.active));
        setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, []);

  const handleQtyChange = (productId: string, value: string) => {
    const num = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
    setQuantities(prev => ({ ...prev, [productId]: num }));
  };

  const itemsToSave = products
    .filter(p => (quantities[p.id] || 0) > 0)
    .map(p => ({
      productId: p.id,
      name: p.name,
      price: p.price,
      quantity: quantities[p.id],
    }));

  const totalRevenue = itemsToSave.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = itemsToSave.reduce((sum, item) => sum + item.quantity, 0);

  const handleSaveClosing = async () => {
    if (!storeId || itemsToSave.length === 0) return;
    setSaving(true);
    try {
      const today = new Date();
      const newOrder: Order = {
        id: crypto.randomUUID(),
        customerName: 'Venta de mostrador',
        phone: '',
        address: 'Venta física en tienda',
        paymentMethod: 'mostrador',
        paymentDetails: `Cierre de mostrador del ${today.toLocaleDateString('es-CO')}`,
        items: itemsToSave,
        subtotal: totalRevenue,
        shippingFee: 0,
        total: totalRevenue,
        status: 'Recibido',
        createdAt: today.toISOString(),
      };
      await saveOrder(newOrder, storeId);
      toast({ title: `Cierre guardado: ${totalItems} productos, ${totalRevenue.toLocaleString('es-CO')} COP`, type: 'success' });
      setQuantities({});
      const data = await getProducts(storeId);
      setProducts(data.filter(p => p.active));
    } catch (err: any) {
      toast({ title: err.message || 'Error guardando el cierre', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

  if (loading) {
    return <div className="p-6 text-sm text-slate-400">Cargando productos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Store className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">Cierre de Mostrador</h1>
            <p className="text-xs text-slate-400 font-medium">Registra al final del día cuánto vendiste en persona, sin pasar por la app.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3 gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-400">{formatPrice(p.price)} · Stock actual: {p.stock}</p>
              </div>
              <input
                type="number"
                min={0}
                value={quantities[p.id] || ''}
                onChange={(e) => handleQtyChange(p.id, e.target.value)}
                placeholder="0"
                className="w-20 text-center bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>
          ))}
        </div>
      </div>

      {itemsToSave.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs sticky bottom-4 space-y-3">
          <div className="flex justify-between text-xs text-slate-500 font-bold">
            <span>{totalItems} productos vendidos</span>
            <span>{formatPrice(totalRevenue)}</span>
          </div>
          <button
            onClick={handleSaveClosing}
            disabled={saving}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:bg-slate-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Guardando...' : 'Guardar cierre de hoy'}
          </button>
        </div>
      )}
    </div>
  );
}
