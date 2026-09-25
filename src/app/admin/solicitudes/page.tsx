import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { descartarSolicitud } from './actions';

export const dynamic = 'force-dynamic';

export default async function SolicitudesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    notFound();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const { data: solicitudes } = await supabaseAdmin
    .from('solicitudes_tienda')
    .select('id, created_at, nombre_negocio, contacto_nombre, contacto_telefono, contacto_email, tipo_negocio, referido_codigo_texto, referido_por_id, estado')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false });

  const referidoIds = (solicitudes || [])
    .map((s) => s.referido_por_id)
    .filter((id): id is string => Boolean(id));

  let nombresReferentes: Record<string, string> = {};
  if (referidoIds.length > 0) {
    const { data: tiendasReferentes } = await supabaseAdmin
      .from('stores')
      .select('id, name, brand_name')
      .in('id', referidoIds);

    nombresReferentes = Object.fromEntries(
      (tiendasReferentes || []).map((t) => [t.id, t.brand_name || t.name])
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Solicitudes Pendientes</h1>

      {(!solicitudes || solicitudes.length === 0) && (
        <p style={{ color: '#666' }}>No hay solicitudes pendientes por ahora.</p>
      )}

      {(solicitudes || []).map((s) => (
        <div key={s.id} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '16px', marginBottom: '12px' }}>
          <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>{s.nombre_negocio}</p>
          <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Contacto: {s.contacto_nombre || '—'}</p>
          <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Teléfono: {s.contacto_telefono}</p>
          {s.contacto_email && <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Correo: {s.contacto_email}</p>}
          {s.tipo_negocio && <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Tipo de negocio: {s.tipo_negocio}</p>}
          <p style={{ fontSize: '13px', margin: '2px 0' }}>
            Referido por:{' '}
            {s.referido_por_id
              ? (nombresReferentes[s.referido_por_id] || 'Tienda no encontrada')
              : (s.referido_codigo_texto ? `Código no reconocido: ${s.referido_codigo_texto}` : 'Venta directa')}
          </p>
          <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Recibida: {new Date(s.created_at).toLocaleString('es-CO')}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <form action="/admin/nueva-tienda" method="GET">
              <input type="hidden" name="solicitud_id" value={s.id} />
              <button
                type="submit"
                style={{ fontSize: '13px', fontWeight: 'bold', padding: '6px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Convertir en tienda
              </button>
            </form>
            <form action={descartarSolicitud.bind(null, s.id)}>
              <button
                type="submit"
                style={{ fontSize: '13px', fontWeight: 'bold', padding: '6px 12px', backgroundColor: '#f3f4f6', color: '#555', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
              >
                Descartar
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
