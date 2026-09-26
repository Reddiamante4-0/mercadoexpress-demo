'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';

type ResultadoVerificacion =
  | { ok: true; planTipo: string }
  | { ok: false; error: string };

function crearClienteAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  return createAdminClient(supabaseUrl, supabaseSecret);
}

async function verificarPedidoPago(
  supabaseAdmin: ReturnType<typeof crearClienteAdmin>,
  pedidoIdCrudo: string
): Promise<ResultadoVerificacion> {
  const pedidoId = pedidoIdCrudo.trim();

  if (!pedidoId) {
    return {
      ok: false,
      error: 'Falta el pago del plan. Esta solicitud solo se puede enviar después de pagar en nuestra tienda de ventas.',
    };
  }

  const ventasSlug = process.env.NEXT_PUBLIC_TIENDA_VENTAS_SLUG;

  const { data: tiendaVentas } = ventasSlug
    ? await supabaseAdmin.from('stores').select('id').eq('slug', ventasSlug).maybeSingle()
    : { data: null };

  if (!tiendaVentas) {
    return { ok: false, error: 'No pudimos verificar el pago. Intenta de nuevo o contáctanos.' };
  }

  const { data: pedido } = await supabaseAdmin
    .from('orders')
    .select('id, status, store_id, items')
    .eq('id', pedidoId)
    .maybeSingle();

  if (!pedido || pedido.store_id !== tiendaVentas.id || pedido.status !== 'Recibido') {
    return {
      ok: false,
      error: 'No encontramos un pago confirmado para esta solicitud. Si ya pagaste, espera un momento e intenta de nuevo, o contáctanos.',
    };
  }

  const { data: solicitudExistente } = await supabaseAdmin
    .from('solicitudes_tienda')
    .select('id')
    .eq('pedido_id', pedidoId)
    .maybeSingle();

  if (solicitudExistente) {
    return { ok: false, error: 'Este pago ya tiene una solicitud registrada.' };
  }

  // El plan no se adivina por el precio: se lee del producto comprado, para
  // que subir o bajar el precio de un plan más adelante no rompa nada.
  const items: Array<{ productId?: string }> = Array.isArray(pedido.items) ? pedido.items : [];
  const productId = items[0]?.productId;

  if (!productId) {
    return { ok: false, error: 'No pudimos identificar el plan pagado. Contáctanos para continuar.' };
  }

  const { data: producto } = await supabaseAdmin
    .from('products')
    .select('plan_tipo')
    .eq('id', productId)
    .maybeSingle();

  const planTipo = producto?.plan_tipo;

  if (!planTipo) {
    return { ok: false, error: 'No pudimos identificar el plan pagado. Contáctanos para continuar.' };
  }

  return { ok: true, planTipo };
}

// Se llama al cargar el formulario para saber si el pedido es válido y qué
// plan corresponde, sin guardar nada todavía.
export async function verificarPedido(pedidoId: string): Promise<ResultadoVerificacion> {
  const supabaseAdmin = crearClienteAdmin();
  return verificarPedidoPago(supabaseAdmin, pedidoId);
}

export async function crearSolicitud(formData: {
  nombreNegocio: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
  tipoNegocio: string;
  refCodigo: string;
  sitioweb: string;
  pedidoId: string;
  subdominioDeseado: string;
  brandName: string;
  tagline: string;
  nequiNumber: string;
  customCategories: string;
  shippingFee: string;
  freeShippingThreshold: string;
  ownerEmail: string;
}) {
  // Honeypot: si este campo viene lleno, es un bot. Fingimos éxito y no guardamos nada.
  if (formData.sitioweb.trim() !== '') {
    return;
  }

  const nombreNegocio = formData.nombreNegocio.trim();
  const contactoTelefono = formData.contactoTelefono.trim();
  const subdominioDeseado = formData.subdominioDeseado.trim().toLowerCase();
  const ownerEmail = formData.ownerEmail.trim();

  if (!nombreNegocio || !contactoTelefono) {
    throw new Error('Falta el nombre del negocio o el teléfono de contacto.');
  }

  if (!subdominioDeseado) {
    throw new Error('Falta el subdominio deseado para la tienda.');
  }

  if (!ownerEmail) {
    throw new Error('Falta el correo del dueño de la tienda.');
  }

  const supabaseAdmin = crearClienteAdmin();

  // El plan pagado se detecta aquí de nuevo, de forma independiente de lo que
  // haya mostrado el formulario: nunca se confía en un plan enviado por el cliente.
  const verificacion = await verificarPedidoPago(supabaseAdmin, formData.pedidoId);

  if (!verificacion.ok) {
    throw new Error(verificacion.error);
  }

  const planTipo = verificacion.planTipo;
  const esVendedor = planTipo === 'vendedor';

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

  // El plan vendedor no vende productos: el envío no aplica.
  const shippingFee = esVendedor ? null : Number(formData.shippingFee) || 0;
  const freeShippingThreshold = esVendedor ? null : Number(formData.freeShippingThreshold) || 0;
  const tipoNegocio = esVendedor ? null : (formData.tipoNegocio.trim() || null);
  const customCategories = !esVendedor && formData.tipoNegocio.trim() === 'otro'
    ? (formData.customCategories.trim() || null)
    : null;

  const { error } = await supabaseAdmin.from('solicitudes_tienda').insert({
    nombre_negocio: nombreNegocio,
    contacto_nombre: formData.contactoNombre.trim() || null,
    contacto_telefono: contactoTelefono,
    contacto_email: formData.contactoEmail.trim() || null,
    tipo_negocio: tipoNegocio,
    referido_codigo_texto: refCodigo || null,
    referido_por_id: referidoPorId,
    pedido_id: formData.pedidoId.trim(),
    subdominio_deseado: subdominioDeseado,
    brand_name: formData.brandName.trim() || null,
    tagline: formData.tagline.trim() || null,
    nequi_number: esVendedor ? null : (formData.nequiNumber.trim() || null),
    custom_categories: customCategories,
    plan_tipo: planTipo,
    shipping_fee: shippingFee,
    free_shipping_threshold: freeShippingThreshold,
    owner_email: ownerEmail,
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
          html: `<p>Llegó una nueva solicitud:</p><p><strong>Negocio:</strong> ${nombreNegocio}</p><p><strong>Plan pagado:</strong> ${planTipo}</p><p><strong>Subdominio deseado:</strong> ${subdominioDeseado}</p><p><strong>Contacto:</strong> ${formData.contactoNombre.trim() || '—'} — ${contactoTelefono}</p><p><strong>Correo del dueño:</strong> ${ownerEmail}</p><p><strong>Referido por código:</strong> ${refCodigo || 'Venta directa'}</p><p>Revísala en tu panel: https://crisalap.com/admin/solicitudes</p>`,
        }),
      });
    } catch {
      // Si falla el correo, la solicitud ya quedó guardada; no interrumpimos nada.
    }
  }
}
