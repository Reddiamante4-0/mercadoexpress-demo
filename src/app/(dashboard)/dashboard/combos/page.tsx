'use client';

import React, { useState, useEffect } from 'react';
import { getProducts, saveProduct, deleteProduct, getCurrentStoreId, Product } from '@/lib/supabase-api';
import { useToast } from '@/components/ui/ToastProvider';
import { Sparkles, Plus, Trash2, Edit2, X } from 'lucide-react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&auto=format&fit=crop&q=60';

export default function CombosPage() {
  const { toast } = useToast();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [comboPrice, setComboPrice] = useState(0);
  const [comboStock, setComboStock] = useState(0);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const combos = products.filter(p => p.isCombo);
  const regularProducts = products.filter(p => !p.isCombo);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      const id = await getCurrentStoreId();
      if (!id || !mounted) {
        setLoading(false);
        return;
      }
      setStoreId(id);
      const data = await getProducts(id);
      if (mounted) {
        setProducts(data);
        setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

  const openNewComboModal = () => {
    setEditingCombo(null);
    setName('');
    setDescription('');
    setSelectedProductIds([]);
    setComboPrice(0);
    setComboStock(0);
    setActive(true);
    setShowModal(true);
  };

  const openEditComboModal = (combo: Product) => {
    setEditingCombo(combo);
    setName(combo.name);
    setDescription(combo.description || '');
    setSelectedProductIds(combo.comboProductIds || []);
    setComboPrice(combo.price);
    setComboStock(combo.stock);
    setActive(combo.active);
    setShowModal(true);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const regularPrice = regularProducts
    .filter(p => selectedProductIds.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  const savings = regularPrice - comboPrice;

  const handleSaveCombo = async () => {
    if (!storeId || !name || selectedProductIds.length < 2 || comboPrice <= 0) {
      toast({ title: 'Completa el nombre, elige al menos 2 productos, y pon un precio válido', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const comboProduct: Product = {
        id: editingCombo ? editingCombo.id : crypto.randomUUID(),
        name,
        category: 'Combos',
        price: comboPrice,
        oldPrice: regularPrice > comboPrice ? regularPrice : undefined,
        stock: comboStock,
        image: editingCombo ? editingCombo.image : DEFAULT_IMAGE,
        description: description || 'Combo especial de ahorro',
        active,
        unit: 'combo',
        isCombo: true,
        comboProductIds: selectedProductIds,
      };
      await saveProduct(comboProduct, storeId);
      toast({ title: editingCombo ? 'Combo actualizado' : 'Combo creado', type: 'success' });
      setShowModal(false);
      const updated = await getProducts(storeId);
      setProducts(updated);
    } catch (err: any) {
      toast({ title: err.message || 'Error guardando el combo', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCombo = async (comboId: string) => {
    if (!confirm('¿Borrar este combo? Esta acción no se puede deshacer.')) return;
    try {
      await deleteProduct(comboId);
      setProducts(prev => prev.filter(p => p.id !== comboId));
      toast({ title: 'Combo eliminado', type: 'success' });
    } catch (err: any) {
      toast({ title: 'Error eliminando el combo', type: 'error' });
    }
  };

  const handleToggleActive = async (combo: Product) => {
    if (!storeId) return;
    try {
      const updated = { ...combo, active: !combo.active };
      await saveProduct(updated, storeId);
      setProducts(prev => prev.map(p => p.id === combo.id ? updated : p));
    } catch (err: any) {
      toast({ title: 'Error actualizando el combo', type: 'error' });
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-400">Cargando combos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">Combos de Ahorro</h1>
            <p className="text-xs text-slate-400 font-medium">Arma paquetes de productos con un precio especial. Se venden como un producto más de tu catálogo.</p>
          </div>
        </div>
        <button
          onClick={openNewComboModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Crear Combo
        </button>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800">
        <strong>Importante:</strong> cuando armes un combo físico, recuerda bajar manualmente el stock de los productos que lo componen en "Productos", y ponerle stock al combo aquí — son inventarios separados.
      </div>

      {combos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-10 text-center">
          <p className="text-sm text-slate-400">Todavía no tienes ningún combo creado. Los combos no aparecen en tu tienda hasta que crees el primero.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden divide-y divide-slate-100">
          {combos.map((combo) => {
            const comboComponents = regularProducts.filter(p => (combo.comboProductIds || []).includes(p.id));
            return (
              <div key={combo.id} className="flex items-center justify-between px-5 py-4 gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">{combo.name}</p>
                    {!combo.active && (
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">Inactivo</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {comboComponents.length} productos · Stock: {combo.stock} ·{' '}
                    <span className="font-bold text-green-700">{formatPrice(combo.price)}</span>
                    {combo.oldPrice && (
                      <span className="line-through text-slate-300 ml-1">{formatPrice(combo.oldPrice)}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(combo)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    {combo.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => openEditComboModal(combo)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteCombo(combo.id)}
                    className="p-2 rounded-lg border border-red-200 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800">{editingCombo ? 'Editar Combo' : 'Nuevo Combo'}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Nombre del combo</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs" placeholder="Ej: Combo Cuidado Diario" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Descripción (opcional)</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Productos incluidos (elige 2 o más, solo de referencia)</label>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {regularProducts.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(p.id)}
                      onChange={() => toggleProductSelection(p.id)}
                    />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-slate-400">{formatPrice(p.price)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Precio del combo</label>
                <input type="number" value={comboPrice} onChange={(e) => setComboPrice(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Stock de combos armados</label>
                <input type="number" value={comboStock} onChange={(e) => setComboStock(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs" />
              </div>
            </div>

            {selectedProductIds.length > 0 && (
              <div className="p-3 bg-green-50 rounded-xl text-xs">
                <p className="text-slate-600">Precio normal sumado: <span className="font-bold">{formatPrice(regularPrice)}</span></p>
                <p className="text-green-700 font-bold">Ahorro para el cliente: {formatPrice(savings > 0 ? savings : 0)}</p>
              </div>
            )}

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Combo activo (visible en la tienda)
            </label>

            <button
              onClick={handleSaveCombo}
              disabled={saving}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:bg-slate-300 cursor-pointer"
            >
              {saving ? 'Guardando...' : editingCombo ? 'Guardar cambios' : 'Crear combo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
