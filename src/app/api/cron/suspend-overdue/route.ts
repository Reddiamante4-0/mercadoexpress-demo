import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const gracePeriodDays = 5;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - gracePeriodDays);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  // 1. Suspender tiendas que ya superaron el período de gracia
  const { data: suspended, error: suspendError } = await supabaseAdmin
    .from('stores')
    .update({ is_active: false })
    .lt('next_payment_date', cutoffStr)
    .eq('is_active', true)
    .select('id, name, slug');

  if (suspendError) {
    console.error('Error suspending overdue stores:', suspendError);
  }

  // 2. Avisar por correo a las tiendas que están a 2 días de ser suspendidas
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() - 3);
  const warningDateStr = warningDate.toISOString().split('T')[0];

  const { data: toWarn, error: warnFetchError } = await supabaseAdmin
    .from('stores')
    .select('id, name, brand_name, owner_id')
    .eq('next_payment_date', warningDateStr)
    .eq('is_active', true);

  let warned = 0;
  if (!warnFetchError && toWarn) {
    for (const store of toWarn) {
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(store.owner_id);
        const ownerEmail = userData?.user?.email;
        if (ownerEmail && process.env.RESEND_API_KEY) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Crisalap <noreply@crisalap.com>',
              to: ownerEmail,
              subject: 'Tu tienda en Crisalap se suspenderá en 2 días',
              html: `<p>Hola,</p><p>Tu tienda <strong>${store.brand_name || store.name}</strong> tiene un pago pendiente de registrar.</p><p>Si no se confirma el pago dentro de los próximos 2 días, tu tienda se suspenderá automáticamente: se apagará tu tienda pública y se bloqueará tu panel de administración.</p><p>Por favor realiza tu pago lo antes posible para evitar la interrupción del servicio.</p>`,
            }),
          });
          warned++;
        }
      } catch (err) {
        console.error('Error sending warning email:', err);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    suspended: suspended?.length || 0,
    stores: suspended,
    warned,
  });
}
