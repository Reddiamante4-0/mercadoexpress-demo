'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function resetStoreSalesHistory(storeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No autorizado');
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .single();

  if (storeError || !store || store.owner_id !== user.id) {
    throw new Error('No autorizado para reiniciar esta tienda');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const { error: deleteError } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('store_id', storeId);

  if (deleteError) {
    throw new Error('Error borrando el historial: ' + deleteError.message);
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/ventas');
  revalidatePath('/dashboard/pedidos');

  return { success: true };
}
