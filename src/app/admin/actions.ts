'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function markStoreAsPaid(storeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    throw new Error('No autorizado');
  }

  const today = new Date();
  const nextPayment = new Date(today);
  nextPayment.setDate(nextPayment.getDate() + 30);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const { error } = await supabase
    .from('stores')
    .update({
      last_payment_date: formatDate(today),
      next_payment_date: formatDate(nextPayment),
      is_active: true,
    })
    .eq('id', storeId);

  if (error) {
    throw new Error('Error actualizando el pago: ' + error.message);
  }

  revalidatePath('/admin');
}
