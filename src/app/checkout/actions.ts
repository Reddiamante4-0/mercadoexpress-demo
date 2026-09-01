'use server'

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function generateWompiSignature(orderId: string, storeId: string) {
  // Inicializamos Supabase usando el Service Role Key (Admin) para saltarnos RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseSecret);

  // 1. Obtener el total real del pedido desde el servidor
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('total')
    .eq('id', orderId)
    .eq('store_id', storeId)
    .single();

  if (orderError || !order) {
    throw new Error('Error al obtener la información del pedido.');
  }

  const amountInCents = Math.round(order.total * 100);
  const currency = 'COP';

  // 2. Obtener las llaves PÚBLICA e INTEGRIDAD de la tienda
  const { data: settings, error: settingsError } = await supabaseAdmin
    .from('store_payment_settings')
    .select('wompi_pub_key, wompi_integrity_secret')
    .eq('store_id', storeId)
    .single();

  if (settingsError || !settings?.wompi_pub_key || !settings?.wompi_integrity_secret) {
    throw new Error('La tienda no tiene configuradas sus llaves de pago completas.');
  }

  // 3. Generar la firma con el SECRETO DE INTEGRIDAD
  const integrityString = `${orderId}${amountInCents}${currency}${settings.wompi_integrity_secret}`;
  const hash = crypto.createHash('sha256').update(integrityString).digest('hex');

  // 4. Retornar los datos para el Widget
  return {
    pubKey: settings.wompi_pub_key,
    signature: hash,
    amountInCents: amountInCents,
    currency: currency
  };
}
