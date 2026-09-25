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
}) {
  // Honeypot: si este campo viene lleno, es un bot. Fingimos éxito y no guardamos nada.
  if (formData.sitioweb.trim() !== '') {
    return;
  }

  const nombreNegocio = formData.nombreNegocio.trim();
  const contactoTelefono = formData.contactoTelefono.trim();

  if (!nombreNegocio || !contactoTelefono) {
    throw new Error('Falta el nombre del negocio o el teléfono de contacto.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

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
