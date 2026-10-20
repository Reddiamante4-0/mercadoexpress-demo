'use server';

import { createClient } from '@/lib/supabase/server';
import { enviarEnlaceCreacion, type ResultadoEnvio } from '@/lib/enlaceCreacion';

// Lo llama la página de pedidos cuando el dueño de la tienda de ventas
// confirma un pago (o pulsa "Reenviar enlace de creación").
export async function enviarEnlaceCreacionAction(
  orderId: string,
  reenviar = false
): Promise<ResultadoEnvio> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { enviado: false, mensaje: 'No autenticado.' };
    }

    // Solo puede enviarlo quien es dueño de la tienda a la que pertenece el pedido.
    const { data: tienda } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!tienda) {
      return { enviado: false, mensaje: 'Tienda no encontrada.' };
    }

    const { data: pedido } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .eq('store_id', tienda.id)
      .maybeSingle();

    if (!pedido) {
      return { enviado: false, mensaje: 'Pedido no encontrado.' };
    }

    return await enviarEnlaceCreacion(orderId, { reenviar });
  } catch (error) {
    console.error('Error enviando el enlace de creación:', error);
    return { enviado: false, mensaje: 'No se pudo enviar el correo.' };
  }
}
