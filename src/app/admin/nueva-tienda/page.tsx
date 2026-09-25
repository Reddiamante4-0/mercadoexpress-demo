import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import NuevaTiendaForm from './NuevaTiendaForm';

export const dynamic = 'force-dynamic';

export default async function NuevaTiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ solicitud_id?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    notFound();
  }

  const { data: tiendasExistentes } = await supabase
    .from('stores')
    .select('id, name, brand_name, codigo_referido')
    .order('name', { ascending: true });

  const { solicitud_id: solicitudId } = await searchParams;
  let solicitudPrefill: {
    id: string;
    nombreNegocio: string;
    contactoTelefono: string | null;
    tipoNegocio: string | null;
    referidoPorId: string | null;
  } | null = null;

  if (solicitudId) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
    const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

    const { data: solicitud } = await supabaseAdmin
      .from('solicitudes_tienda')
      .select('id, nombre_negocio, contacto_telefono, tipo_negocio, referido_por_id')
      .eq('id', solicitudId)
      .maybeSingle();

    if (solicitud) {
      solicitudPrefill = {
        id: solicitud.id,
        nombreNegocio: solicitud.nombre_negocio,
        contactoTelefono: solicitud.contacto_telefono,
        tipoNegocio: solicitud.tipo_negocio,
        referidoPorId: solicitud.referido_por_id,
      };
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '640px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Crear Tienda Nueva</h1>
      <NuevaTiendaForm tiendasExistentes={tiendasExistentes || []} solicitudPrefill={solicitudPrefill} />
    </div>
  );
}
