import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { aprobarComision, marcarComisionPagada } from '../actions';
import ComisionActionButton from './ComisionActionButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const ESTADO_STYLE: Record<string, { texto: string; bg: string; color: string }> = {
  pendiente: { texto: '🟡 Pendiente', bg: '#fef3c7', color: '#92400e' },
  aprobado: { texto: '🔵 Aprobado', bg: '#dbeafe', color: '#1e40af' },
  pagado: { texto: '🟢 Pagado', bg: '#dcfce7', color: '#166534' },
};

export default async function ComisionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    notFound();
  }

  const { data: comisiones } = await supabase
    .from('comisiones')
    .select(`
      id, tipo, monto, periodo, estado,
      beneficiaria:store_beneficiaria_id(name, brand_name),
      referida:store_referida_id(name, brand_name)
    `)
    .order('estado', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <Link href="/admin" style={{ fontSize: '0.85rem', color: '#555' }}>&larr; Volver al panel</Link>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0 1.5rem' }}>Comisiones de Referidos</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px' }}>Tienda Beneficiaria</th>
            <th style={{ padding: '8px' }}>Tienda Referida</th>
            <th style={{ padding: '8px' }}>Tipo</th>
            <th style={{ padding: '8px' }}>Monto</th>
            <th style={{ padding: '8px' }}>Periodo</th>
            <th style={{ padding: '8px' }}>Estado</th>
            <th style={{ padding: '8px' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {comisiones?.map((c: any) => {
            const estado = ESTADO_STYLE[c.estado] || ESTADO_STYLE.pendiente;
            return (
              <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{c.beneficiaria?.brand_name || c.beneficiaria?.name || '—'}</td>
                <td style={{ padding: '8px' }}>{c.referida?.brand_name || c.referida?.name || '—'}</td>
                <td style={{ padding: '8px' }}>{c.tipo === 'vinculacion' ? 'Vinculación' : 'Mensualidad'}</td>
                <td style={{ padding: '8px' }}>${c.monto.toLocaleString('es-CO')}</td>
                <td style={{ padding: '8px' }}>{c.periodo}</td>
                <td style={{ padding: '8px' }}>
                  <span style={{ backgroundColor: estado.bg, color: estado.color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {estado.texto}
                  </span>
                </td>
                <td style={{ padding: '8px' }}>
                  {c.estado === 'pendiente' && (
                    <form action={aprobarComision.bind(null, c.id)}>
                      <ComisionActionButton label="Aprobar" />
                    </form>
                  )}
                  {c.estado === 'aprobado' && (
                    <form action={marcarComisionPagada.bind(null, c.id)}>
                      <ComisionActionButton label="Marcar Pagado" />
                    </form>
                  )}
                  {c.estado === 'pagado' && <span style={{ color: '#888', fontSize: '0.8rem' }}>—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
