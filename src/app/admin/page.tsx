import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { markStoreAsPaid } from './actions';
import Link from 'next/link';
import MarcarPagadoButton from './MarcarPagadoButton';

export const dynamic = 'force-dynamic';

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
      <Link
        href="/admin/nueva-tienda"
        style={{
          display: 'inline-block',
          backgroundColor: '#16a34a',
          color: 'white',
          padding: '10px 18px',
          borderRadius: '8px',
          fontWeight: 'bold',
          textDecoration: 'none',
          marginBottom: '1.5rem',
        }}
      >
        + Crear Tienda Nueva
      </Link>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px' }}>Tienda</th>
            <th style={{ padding: '8px' }}>Slug</th>
            <th style={{ padding: '8px' }}>Estado</th>
            <th style={{ padding: '8px' }}>Último Pago</th>
            <th style={{ padding: '8px' }}>Próximo Vencimiento</th>
            <th style={{ padding: '8px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {stores?.map((store) => {
            let daysUntilDue: number | null = null;
            if (store.is_active && store.next_payment_date) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dueDate = new Date(store.next_payment_date);
              dueDate.setHours(0, 0, 0, 0);
              daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            }

            let estado: { texto: string; bg: string; color: string };
            if (!store.is_active) {
              estado = { texto: '⚫ Suspendida', bg: '#e5e7eb', color: '#374151' };
            } else if (daysUntilDue !== null && daysUntilDue < 0) {
              estado = { texto: `🔴 Vencido hace ${Math.abs(daysUntilDue)} día${Math.abs(daysUntilDue) === 1 ? '' : 's'}`, bg: '#fee2e2', color: '#991b1b' };
            } else if (daysUntilDue !== null && daysUntilDue <= 5) {
              estado = { texto: `🟡 Vence en ${daysUntilDue} día${daysUntilDue === 1 ? '' : 's'}`, bg: '#fef3c7', color: '#92400e' };
            } else {
              estado = { texto: '🟢 Al día', bg: '#dcfce7', color: '#166534' };
            }

            return (
              <tr key={store.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{store.brand_name || store.name}</td>
                <td style={{ padding: '8px' }}>{store.slug}</td>
                <td style={{ padding: '8px' }}>
                  <span style={{ backgroundColor: estado.bg, color: estado.color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {estado.texto}
                  </span>
                </td>
                <td style={{ padding: '8px' }}>{store.last_payment_date || '—'}</td>
                <td style={{ padding: '8px' }}>{store.next_payment_date || '—'}</td>
                <td style={{ padding: '8px' }}>
                  <form action={markStoreAsPaid.bind(null, store.id)}>
                    <MarcarPagadoButton />
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
