import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { descartarSolicitud } from './actions';

export const dynamic = 'force-dynamic';

const PLAN_LABELS: Record<string, string> = {
  basica: 'Básico',
  estandar: 'Estándar',
  premium: 'Premium',
  vendedor: 'Vendedor/Afiliado',
};

const TIPO_NEGOCIO_LABELS: Record<string, string> = {
  drogueria: 'Droguería',
  supermercado: 'Supermercado',
  tienda_barrio: 'Tienda de barrio',
  otro: 'Otro / Personalizado',
};

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
    .select('id, created_at, nombre_negocio, contacto_nombre, contacto_telefono, contacto_email, tipo_negocio, referido_codigo_texto, referido_por_id, estado, pedido_id, subdominio_deseado, brand_name, tagline, nequi_number, custom_categories, plan_tipo, shipping_fee, free_shipping_threshold, owner_email')
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

      {(solicitudes || []).map((s) => {
        const esVendedor = s.plan_tipo === 'vendedor';
        return (
          <div key={s.id} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '15px', margin: 0 }}>{s.nombre_negocio}</p>
              {s.plan_tipo && (
                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '999px', backgroundColor: '#eff6ff', color: '#1e3a8a' }}>
                  Plan {PLAN_LABELS[s.plan_tipo] || s.plan_tipo}
                </span>
              )}
              {s.pedido_id ? (
                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '999px', backgroundColor: '#e6f7ec', color: '#16a34a' }}>
                  ✓ Pago verificado
                </span>
              ) : (
                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '999px', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                  Sin pago verificado
                </span>
              )}
            </div>

            {s.subdominio_deseado && <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Subdominio deseado: {s.subdominio_deseado}.crisalap.com</p>}
            {(s.brand_name || s.tagline) && (
              <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>
                Marca: {s.brand_name || '—'}{s.tagline ? ` — "${s.tagline}"` : ''}
              </p>
            )}

            <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Contacto: {s.contacto_nombre || '—'}</p>
            <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Teléfono: {s.contacto_telefono}</p>
            {s.contacto_email && <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Correo de contacto: {s.contacto_email}</p>}
            {s.owner_email && <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Correo del dueño: {s.owner_email}</p>}
            {s.nequi_number && <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>Nequi: {s.nequi_number}</p>}

            {!esVendedor && s.tipo_negocio && (
              <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>
                Tipo de negocio: {TIPO_NEGOCIO_LABELS[s.tipo_negocio] || s.tipo_negocio}
                {s.tipo_negocio === 'otro' && s.custom_categories ? ` (${s.custom_categories})` : ''}
              </p>
            )}
            {!esVendedor && (s.shipping_fee !== null || s.free_shipping_threshold !== null) && (
              <p style={{ fontSize: '13px', color: '#555', margin: '2px 0' }}>
                Domicilio: ${s.shipping_fee ?? 0} — envío gratis desde ${s.free_shipping_threshold ?? 0}
              </p>
            )}

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
        );
      })}
    </div>
  );
}
