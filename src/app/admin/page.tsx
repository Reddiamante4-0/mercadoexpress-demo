import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    notFound();
  }

  const { data: stores } = await supabase
    .from('stores')
    .select('id, slug, name, brand_name, is_active, next_payment_date, last_payment_date')
    .order('name', { ascending: true });

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Panel de Administración de Tiendas</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px' }}>Tienda</th>
            <th style={{ padding: '8px' }}>Slug</th>
            <th style={{ padding: '8px' }}>Activa</th>
            <th style={{ padding: '8px' }}>Último Pago</th>
            <th style={{ padding: '8px' }}>Próximo Vencimiento</th>
          </tr>
        </thead>
        <tbody>
          {stores?.map((store) => (
            <tr key={store.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{store.brand_name || store.name}</td>
              <td style={{ padding: '8px' }}>{store.slug}</td>
              <td style={{ padding: '8px' }}>{store.is_active ? '✅ Activa' : '⛔ Suspendida'}</td>
              <td style={{ padding: '8px' }}>{store.last_payment_date || '—'}</td>
              <td style={{ padding: '8px' }}>{store.next_payment_date || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
