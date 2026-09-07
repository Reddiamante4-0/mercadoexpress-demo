import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { markStoreAsPaid } from './actions';

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
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px' }}>Tienda</th>
            <th style={{ padding: '8px' }}>Slug</th>
            <th style={{ padding: '8px' }}>Activa</th>
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
            const isNearDue = daysUntilDue !== null && daysUntilDue <= 5;

            return (
              <tr key={store.id} style={{ borderBottom: '1px solid #eee', backgroundColor: isNearDue ? '#fef3c7' : 'transparent' }}>
                <td style={{ padding: '8px' }}>{store.brand_name || store.name}</td>
                <td style={{ padding: '8px' }}>{store.slug}</td>
                <td style={{ padding: '8px' }}>{store.is_active ? '✅ Activa' : '⛔ Suspendida'}</td>
                <td style={{ padding: '8px' }}>{store.last_payment_date || '—'}</td>
                <td style={{ padding: '8px' }}>
                  {store.next_payment_date || '—'}
                  {isNearDue && (
                    <span style={{ marginLeft: '8px', color: '#b45309', fontWeight: 'bold', fontSize: '0.8rem' }}>
                      {daysUntilDue! >= 0
                        ? `⚠️ Vence en ${daysUntilDue} día${daysUntilDue === 1 ? '' : 's'}`
                        : `⚠️ Vencido hace ${Math.abs(daysUntilDue!)} día${Math.abs(daysUntilDue!) === 1 ? '' : 's'}`}
                    </span>
                  )}
                </td>
                <td style={{ padding: '8px' }}>
                  <form action={markStoreAsPaid.bind(null, store.id)}>
                    <button
                      type="submit"
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Marcar como pagado
                    </button>
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
