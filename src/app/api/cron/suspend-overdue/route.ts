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

  const { data, error } = await supabaseAdmin
    .from('stores')
    .update({ is_active: false })
    .lt('next_payment_date', cutoffStr)
    .eq('is_active', true)
    .select('id, name, slug');

  if (error) {
    console.error('Error suspending overdue stores:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, suspended: data?.length || 0, stores: data });
}
