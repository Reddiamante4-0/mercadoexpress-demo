'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function crearSolicitud(formData: {
  nombreNegocio: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
  tipoNegocio: string;
  refCodigo: string;
  sitioweb: string;
  pedidoId: string;
}) {
  // Honeypot: si este campo viene lleno, es un bot. Fingimos éxito y no guardamos nada.
  if (formData.sitioweb.trim() !== '') {
    return;
  }

  const nombreNegocio = formData.nombreNegocio.trim();
  const contactoTelefono = formData.contactoTelefono.trim();
  const pedidoId = formData.pedidoId.trim();

  if (!nombreNegocio || !contactoTelefono) {
    throw new Error('Falta el nombre del negocio o el teléfono de contacto.');
  }

  if (!pedidoId) {
    throw new Error('Falta el pago del plan. Esta solicitud solo se puede enviar después de pagar en nuestra tienda de ventas.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  // Verificamos que exista un pago real, aprobado, hecho en la tienda de ventas,
  // y que ese pago no se haya usado ya para otra solicitud.
  const ventasSlug = process.env.NEXT_PUBLIC_TIENDA_VENTAS_SLUG;

  const { data: tiendaVentas } = ventasSlug
    ? await supabaseAdmin.from('stores').select('id').eq('slug', ventasSlug).maybeSingle()
    : { data: null };

  if (!tiendaVentas) {
    throw new Error('No pudimos verificar el pago. Intenta de nuevo o contáctanos.');
  }

  const { data: pedido } = await supabaseAdmin
    .from('orders')
    .select('id, status, store_id')
    .eq('id', pedidoId)
    .maybeSingle();

  if (!pedido || pedido.store_id !== tiendaVentas.id || pedido.status !== 'Recibido') {
    throw new Error('No encontramos un pago confirmado para esta solicitud. Si ya pagaste, espera un momento e intenta de nuevo, o contáctanos.');
  }

  const { data: solicitudExistente } = await supabaseAdmin
    .from('solicitudes_tienda')
    .select('id')
    .eq('pedido_id', pedidoId)
    .maybeSingle();

  if (solicitudExistente) {
    throw new Error('Este pago ya tiene una solicitud registrada.');
  }

  const refCodigo = formData.refCodigo.trim().toUpperCase();
  let referidoPorId: string | null = null;

  if (refCodigo) {
    const { data: tiendaReferente } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('codigo_referido', refCodigo)
      .maybeSingle();

    if (tiendaReferente) {
      referidoPorId = tiendaReferente.id;
    }
  }

  const { error } = await supabaseAdmin.from('solicitudes_tienda').insert({
    nombre_negocio: nombreNegocio,
    contacto_nombre: formData.contactoNombre.trim() || null,
    contacto_telefono: contactoTelefono,
    contacto_email: formData.contactoEmail.trim() || null,
    tipo_negocio: formData.tipoNegocio.trim() || null,
    referido_codigo_texto: refCodigo || null,
    referido_por_id: referidoPorId,
    pedido_id: pedidoId,
  });

  if (error) {
    throw new Error('No se pudo guardar la solicitud: ' + error.message);
  }

  // Aviso por correo, sin bloquear la respuesta al usuario si el correo falla
  if (process.env.RESEND_API_KEY && process.env.SUPER_ADMIN_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Crisalap <noreply@crisalap.com>',
          to: process.env.SUPER_ADMIN_EMAIL,
          subject: 'Nueva solicitud de tienda en Crisalap',
          html: `<p>Llegó una nueva solicitud:</p><p><strong>Negocio:</strong> ${nombreNegocio}</p><p><strong>Contacto:</strong> ${formData.contactoNombre.trim() || '—'} — ${contactoTelefono}</p><p><strong>Referido por código:</strong> ${refCodigo || 'Venta directa'}</p><p>Revísala en tu panel: https://crisalap.com/admin/solicitudes</p>`,
        }),
      });
    } catch {
      // Si falla el correo, la solicitud ya quedó guardada; no interrumpimos nada.
    }
  }
}
