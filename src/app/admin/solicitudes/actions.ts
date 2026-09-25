'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function descartarSolicitud(solicitudId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    throw new Error('No autorizado');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const { error } = await supabaseAdmin
    .from('solicitudes_tienda')
    .update({ estado: 'descartada' })
    .eq('id', solicitudId);

  if (error) {
    throw new Error('No se pudo descartar la solicitud: ' + error.message);
  }

  revalidatePath('/admin/solicitudes');
}
