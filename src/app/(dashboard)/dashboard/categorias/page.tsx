'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentStoreId, supabase } from '@/lib/supabase-api';
import { agregarCategoria, renombrarCategoria, eliminarCategoria } from './actions';

type Categoria = {
  id: string;
  name: string;
  emoji: string | null;
  display_order: number;
  productCount: number;
};

export default function CategoriasPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editandoNombre, setEditandoNombre] = useState('');

  const cargarCategorias = useCallback(async (id: string) => {
    const { data: categoriasData } = await supabase
      .from('store_categories')
      .select('id, name, emoji, display_order')
      .eq('store_id', id)
      .order('display_order', { ascending: true });

    const { data: productosData } = await supabase
      .from('products')
      .select('category')
      .eq('store_id', id);

    const conteos: Record<string, number> = {};
    (productosData || []).forEach((p: { category: string }) => {
      conteos[p.category] = (conteos[p.category] || 0) + 1;
    });

    setCategorias(
      (categoriasData || []).map((c) => ({
        ...c,
        productCount: conteos[c.name] || 0,
      }))
    );
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const id = await getCurrentStoreId();
      if (!active) return;
      setStoreId(id);
      if (id) await cargarCategorias(id);
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [cargarCategorias]);

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setGuardando(true);
    setError('');
    try {
      await agregarCategoria(nuevoNombre);
      setNuevoNombre('');
      if (storeId) await cargarCategorias(storeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarEdicion = async (categoriaId: string) => {
    if (!editandoNombre.trim()) return;
    setGuardando(true);
    setError('');
    try {
      await renombrarCategoria(categoriaId, editandoNombre);
      setEditandoId(null);
      if (storeId) await cargarCategorias(storeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (categoriaId: string) => {
    setGuardando(true);
    setError('');
    try {
      await eliminarCategoria(categoriaId);
      if (storeId) await cargarCategorias(storeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Categorías</h1>
      <p className="text-sm text-gray-500 mb-6">
        Organiza las categorías de tu tienda. Puedes agregar nuevas, renombrarlas o eliminarlas (solo si no tienen productos).
      </p>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAgregar} className="flex gap-2 mb-6">
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder="Nombre de la nueva categoría"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={guardando}
          className="px-4 py-2 bg-green-600 text-white rounded font-bold text-sm disabled:opacity-50"
        >
          + Agregar
        </button>
      </form>

      <div className="bg-white rounded-lg shadow border border-gray-200 divide-y">
        {categorias.length === 0 && (
          <p className="p-4 text-sm text-gray-500">Todavía no tienes categorías creadas.</p>
        )}
        {categorias.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-4">
            {editandoId === cat.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={editandoNombre}
                  onChange={(e) => setEditandoNombre(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  autoFocus
                />
                <button
                  onClick={() => handleGuardarEdicion(cat.id)}
                  disabled={guardando}
                  className="text-xs font-bold px-3 py-1 rounded bg-green-600 text-white"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditandoId(null)}
                  className="text-xs font-bold px-3 py-1 rounded bg-gray-100 text-gray-600"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <div>
                  <span className="font-semibold text-sm">{cat.emoji} {cat.name}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {cat.productCount} producto{cat.productCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditandoId(cat.id); setEditandoNombre(cat.name); }}
                    className="text-xs font-bold px-3 py-1 rounded bg-blue-50 text-blue-700"
                  >
                    Renombrar
                  </button>
                  <button
                    onClick={() => handleEliminar(cat.id)}
                    disabled={cat.productCount > 0 || guardando}
                    title={cat.productCount > 0 ? 'No se puede eliminar: tiene productos asignados' : ''}
                    className="text-xs font-bold px-3 py-1 rounded bg-red-50 text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
