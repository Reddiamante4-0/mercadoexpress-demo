'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Datos de pago por transferencia (Nequi y llave Bre-B) de la tienda del
// conectado. Se guardan en la tabla `stores`; el checkout ofrece cada método
// solo si la tienda tiene su dato guardado.

export async function getTransferSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: store } = await supabase
    .from('stores')
    .select('nequi_number, llave_bre_b')
    .eq('owner_id', user.id)
    .single();

  if (!store) return null;

  return {
    nequiNumber: (store.nequi_number as string | null) ?? '',
    llaveBreB: (store.llave_bre_b as string | null) ?? '',
  };
}

export async function saveTransferSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autenticado' };

  const { data: store } = await supabase
    .from('stores')
    .select('id, plan_tipo')
    .eq('owner_id', user.id)
    .single();

  if (!store) return { success: false, error: 'Tienda no encontrada' };

  if (store.plan_tipo === 'vendedor') {
    return { success: false, error: 'Esta sección no está disponible para tiendas Crisalap Impulsa.' };
  }

  // Nequi: solo números, 10 dígitos (se aceptan espacios, guiones y el +57).
  let nequi = String(formData.get('nequi_number') ?? '').replace(/\D/g, '');
  if (nequi.length === 12 && nequi.startsWith('57')) nequi = nequi.slice(2);
  if (nequi && !/^3\d{9}$/.test(nequi)) {
    return { success: false, error: 'El número de Nequi debe ser un celular de 10 dígitos, por ejemplo 3001234567.' };
  }

  // Llave Bre-B: puede ser un celular, un correo, un alias o un documento.
  const llave = String(formData.get('llave_bre_b') ?? '').trim();
  if (llave.length > 60) {
    return { success: false, error: 'La llave Bre-B es demasiado larga.' };
  }

  const { data, error } = await supabase
    .from('stores')
    .update({ nequi_number: nequi || null, llave_bre_b: llave || null })
    .eq('id', store.id)
    .select('id');

  if (error || !data || data.length === 0) {
    console.error('Error guardando datos de transferencia:', error);
    return { success: false, error: 'No se pudo guardar. Intenta de nuevo.' };
  }

  revalidatePath('/dashboard/configuracion-pagos');
  return { success: true };
}
