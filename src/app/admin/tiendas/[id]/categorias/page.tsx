import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { agregarCategoriaAdmin, renombrarCategoriaAdmin, eliminarCategoriaAdmin } from './actions';

export const dynamic = 'force-dynamic';

export default async function CategoriasTiendaAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    notFound();
  }

  const { id: storeId } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const { data: tienda } = await supabaseAdmin
    .from('stores')
    .select('id, name, brand_name')
    .eq('id', storeId)
    .maybeSingle();

  if (!tienda) {
    notFound();
  }

  const { data: categorias } = await supabaseAdmin
    .from('store_categories')
    .select('id, name, emoji, display_order')
    .eq('store_id', storeId)
    .order('display_order', { ascending: true });

  const { data: productos } = await supabaseAdmin
    .from('products')
    .select('category')
    .eq('store_id', storeId);

  const conteos: Record<string, number> = {};
  (productos || []).forEach((p) => {
    conteos[p.category] = (conteos[p.category] || 0) + 1;
  });

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '640px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
        Categorías de {tienda.brand_name || tienda.name}
      </h1>
      <p style={{ fontSize: '13px', color: '#666', marginBottom: '1.5rem' }}>
        Agrega, renombra o elimina las categorías de esta tienda. No se puede eliminar una categoría mientras tenga productos asignados.
      </p>

      <form action={agregarCategoriaAdmin.bind(null, storeId)} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la nueva categoría"
          required
          style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
        />
        <button
          type="submit"
          style={{ padding: '8px 16px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          + Agregar
        </button>
      </form>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        {(!categorias || categorias.length === 0) && (
          <p style={{ padding: '16px', fontSize: '13px', color: '#666' }}>Esta tienda todavía no tiene categorías.</p>
        )}
        {(categorias || []).map((cat, index) => {
          const productCount = conteos[cat.name] || 0;
          return (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderTop: index === 0 ? 'none' : '1px solid #f0f0f0',
              }}
            >
              <span style={{ fontSize: '13px', color: '#999', minWidth: '90px' }}>
                {productCount} producto{productCount === 1 ? '' : 's'}
              </span>
              <form action={renombrarCategoriaAdmin.bind(null, storeId, cat.id)} style={{ display: 'flex', gap: '6px', flex: 1 }}>
                <input
                  type="text"
                  name="nuevoNombre"
                  defaultValue={cat.name}
                  required
                  style={{ flex: 1, padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
                />
                <button
                  type="submit"
                  style={{ fontSize: '12px', fontWeight: 'bold', padding: '6px 10px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Renombrar
                </button>
              </form>
              <form action={eliminarCategoriaAdmin.bind(null, storeId, cat.id)}>
                <button
                  type="submit"
                  disabled={productCount > 0}
                  title={productCount > 0 ? 'No se puede eliminar: tiene productos asignados' : ''}
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '6px 10px',
                    backgroundColor: productCount > 0 ? '#f3f4f6' : '#fee2e2',
                    color: productCount > 0 ? '#aaa' : '#991b1b',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: productCount > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Eliminar
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
