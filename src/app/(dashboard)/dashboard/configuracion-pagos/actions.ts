'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getStorePaymentSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single();
  if (!store) return null;

  const { data, error } = await supabase
    .from('store_payment_settings')
    .select('*')
    .eq('store_id', store.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error);
    return null;
  }
  
  return { storeId: store.id, settings: data || null };
}

export async function saveStorePaymentSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autenticado' };

  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single();
  if (!store) return { success: false, error: 'Tienda no encontrada' };

  const pubKey = formData.get('wompi_pub_key') as string;
  const prvKey = formData.get('wompi_prv_key') as string;
  const eventSecret = formData.get('wompi_event_secret') as string;
  const integritySecret = formData.get('wompi_integrity_secret') as string;

  const { error } = await supabase
    .from('store_payment_settings')
    .upsert({
      store_id: store.id,
      wompi_pub_key: pubKey,
      wompi_prv_key: prvKey,
      wompi_event_secret: eventSecret,
      wompi_integrity_secret: integritySecret
    }, { onConflict: 'store_id' });

  if (error) {
    console.error('Error saving settings:', error);
    return { success: false, error: 'Error al guardar configuración.' };
  }

  revalidatePath('/dashboard/configuracion-pagos');
  return { success: true };
}
