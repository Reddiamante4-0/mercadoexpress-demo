import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signatureChecksum = body.signature?.checksum;
    const signatureProperties = body.signature?.properties;
    
    // Validación básica del payload enviado por Wompi
    if (!signatureChecksum || !signatureProperties || !body.data?.transaction) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const transaction = body.data.transaction;
    const orderId = transaction.reference; // La referencia es nuestra ID del pedido
    
    // Inicializamos Supabase Admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseSecret);

    // Encontramos a qué tienda pertenece este pedido
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('store_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Obtenemos el Secreto de Eventos (Event Secret) de esa tienda en específico
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('store_payment_settings')
      .select('wompi_event_secret')
      .eq('store_id', order.store_id)
      .single();

    if (settingsError || !settings?.wompi_event_secret) {
      return NextResponse.json({ error: 'Configuración de pago no encontrada para esta tienda' }, { status: 500 });
    }

    // ==========================================
    // VERIFICACIÓN DE FIRMA (Evita Spoofing)
    // ==========================================
    let signatureString = '';
    
    // 1. Concatenamos los valores dinámicos dictados por Wompi en el mismo orden
    if (Array.isArray(signatureProperties)) {
      for (const prop of signatureProperties) {
          // Si prop es "transaction.amount_in_cents", el reduce extrae ese valor exacto de body.data
          const value = prop.split('.').reduce((obj: any, key: string) => obj && obj[key], body.data);
          // Al sumar al string, JS lo convierte de número a texto de forma segura
          signatureString += value;
      }
    }
    
    // 2. Concatenamos el timestamp proporcionado en la raíz del payload
    signatureString += body.timestamp;
    // 3. Por último, agregamos el Event Secret de la tienda
    signatureString += settings.wompi_event_secret;

    // 4. Aplicamos SHA-256
    const hash = crypto.createHash('sha256').update(signatureString).digest('hex');

    if (hash !== signatureChecksum) {
      console.error(`ALERTA: Firma de webhook inválida para el pedido ${orderId}`);
      return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
    }

    // ==========================================
    // ACTUALIZACIÓN DE PEDIDO
    // ==========================================
    let newStatus = 'Pendiente de pago';
    if (transaction.status === 'APPROVED') {
      newStatus = 'Recibido';
    } else if (['DECLINED', 'ERROR', 'VOIDED'].includes(transaction.status)) {
      newStatus = 'Pago fallido';
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error procesando webhook Wompi:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
