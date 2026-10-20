import { createClient as createAdminClient } from '@supabase/supabase-js';

// Envío del correo "continúa con la creación de tu tienda" a quien compra un
// plan en la tienda de ventas. Solo se usa desde el servidor (webhook de Wompi
// y la acción de la página de pedidos).
//
// Reglas:
// - Solo aplica a pedidos de la tienda de ventas, con correo y en estado "Recibido".
// - Se envía una sola vez por pedido (columna orders.enlace_enviado_at).
// - Si el cliente ya envió su solicitud, no se envía.
// - Si el envío falla, se libera la marca para poder reintentar.

export type ResultadoEnvio = { enviado: boolean; mensaje?: string };

function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function enviarEnlaceCreacion(
  orderId: string,
  opciones: { reenviar?: boolean } = {}
): Promise<ResultadoEnvio> {
  const reenviar = opciones.reenviar === true;
  const ventasSlug = process.env.NEXT_PUBLIC_TIENDA_VENTAS_SLUG;
  const resendKey = process.env.RESEND_API_KEY;

  if (!ventasSlug || !resendKey) {
    return { enviado: false, mensaje: 'Falta configurar el envío de correos.' };
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: tiendaVentas } = await admin
    .from('stores')
    .select('id')
    .eq('slug', ventasSlug)
    .maybeSingle();

  if (!tiendaVentas) {
    return { enviado: false, mensaje: 'No se encontró la tienda de ventas.' };
  }

  const { data: pedido, error: pedidoError } = await admin
    .from('orders')
    .select('id, store_id, status, customer_name, customer_email, ref_codigo')
    .eq('id', orderId)
    .maybeSingle();

  if (pedidoError) {
    console.error('enviarEnlaceCreacion: error leyendo el pedido', pedidoError);
    return { enviado: false, mensaje: 'No se pudo leer el pedido.' };
  }

  if (!pedido || pedido.store_id !== tiendaVentas.id) {
    return { enviado: false, mensaje: 'Este pedido no es de la tienda de ventas.' };
  }

  if (pedido.status !== 'Recibido') {
    return { enviado: false, mensaje: 'El pago de este pedido aún no está confirmado.' };
  }

  if (!pedido.customer_email) {
    return { enviado: false, mensaje: 'Este pedido no tiene correo del cliente.' };
  }

  const { data: solicitud } = await admin
    .from('solicitudes_tienda')
    .select('id')
    .eq('pedido_id', orderId)
    .maybeSingle();

  if (solicitud) {
    return { enviado: false, mensaje: 'Este pago ya tiene una solicitud registrada.' };
  }

  // Se reserva el envío antes de mandar el correo: si llegan dos avisos a la
  // vez (por ejemplo Wompi y un cambio manual), solo uno pasa.
  if (!reenviar) {
    const { data: reservado, error: reservaError } = await admin
      .from('orders')
      .update({ enlace_enviado_at: new Date().toISOString() })
      .eq('id', orderId)
      .is('enlace_enviado_at', null)
      .select('id');

    if (reservaError) {
      console.error('enviarEnlaceCreacion: error reservando el envío', reservaError);
      return { enviado: false, mensaje: 'No se pudo preparar el envío del correo.' };
    }

    if (!reservado || reservado.length === 0) {
      return { enviado: false, mensaje: 'El enlace ya se había enviado.' };
    }
  }

  const enlace =
    `https://${ventasSlug}.crisalap.com/solicitud?pedido=${encodeURIComponent(orderId)}` +
    (pedido.ref_codigo ? `&ref=${encodeURIComponent(pedido.ref_codigo)}` : '');

  const nombre = pedido.customer_name ? escapar(pedido.customer_name) : '';

  let enviado = false;
  try {
    const respuesta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Crisalap <noreply@crisalap.com>',
        to: pedido.customer_email,
        subject: 'Recibimos tu pago: continúa con la creación de tu tienda en Crisalap',
        html: `
          <p>¡Hola${nombre ? ` ${nombre}` : ''}!</p>
          <p>Recibimos tu pago. El siguiente paso es llenar los datos de tu tienda para que podamos crearla:</p>
          <p><a href="${enlace}" style="display:inline-block;padding:12px 20px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">Continuar con la creación de mi tienda</a></p>
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p><a href="${enlace}">${enlace}</a></p>
          <p>Si tú no hiciste esta compra, puedes ignorar este correo.</p>
        `,
      }),
    });
    enviado = respuesta.ok;
    if (!respuesta.ok) {
      console.error('enviarEnlaceCreacion: Resend respondió', respuesta.status);
    }
  } catch (e) {
    console.error('enviarEnlaceCreacion: error enviando el correo', e);
  }

  if (!enviado) {
    // Se libera la marca para que se pueda reintentar.
    if (!reenviar) {
      await admin.from('orders').update({ enlace_enviado_at: null }).eq('id', orderId);
    }
    return { enviado: false, mensaje: 'No se pudo enviar el correo. Intenta de nuevo.' };
  }

  if (reenviar) {
    await admin
      .from('orders')
      .update({ enlace_enviado_at: new Date().toISOString() })
      .eq('id', orderId);
  }

  return { enviado: true };
}
