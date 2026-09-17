'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function markStoreAsPaid(storeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    throw new Error('No autorizado');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const today = new Date();
  const nextPayment = new Date(today);
  nextPayment.setDate(nextPayment.getDate() + 30);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const { data: tienda } = await supabaseAdmin
    .from('stores')
    .select('referido_por, plan_mensualidad_monto')
    .eq('id', storeId)
    .single();

  const { error } = await supabaseAdmin
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

  if (tienda?.referido_por) {
    const { data: comisionExistente } = await supabaseAdmin
      .from('comisiones')
      .select('id')
      .eq('store_referida_id', storeId)
      .eq('tipo', 'mensualidad')
      .eq('periodo', formatDate(today))
      .maybeSingle();

    if (!comisionExistente) {
      const { data: tiendaReferente } = await supabaseAdmin
        .from('stores')
        .select('comision_pct_mensualidad')
        .eq('id', tienda.referido_por)
        .single();

      if (tiendaReferente) {
        const montoComision = Math.round((tienda.plan_mensualidad_monto || 40000) * (tiendaReferente.comision_pct_mensualidad / 100));
        await supabaseAdmin.from('comisiones').insert({
          store_beneficiaria_id: tienda.referido_por,
          store_referida_id: storeId,
          tipo: 'mensualidad',
          periodo: formatDate(today),
          monto: montoComision,
          estado: 'pendiente',
        });
      }
    }
  }

  revalidatePath('/admin');
}

export async function createNewStore(formData: {
  ownerEmail: string;
  ownerPassword: string;
  storeName: string;
  slug: string;
  brandName: string;
  tagline: string;
  whatsappNumber: string;
  nequiNumber: string;
  wompiEnabled: boolean;
  shippingFee: number;
  freeShippingThreshold: number;
  businessType: 'drogueria' | 'supermercado' | 'tienda_barrio' | 'otro';
  customCategories: string;
  planTipo: 'basica' | 'estandar' | 'premium' | 'vendedor';
  referidoPor: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    throw new Error('No autorizado');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: formData.ownerEmail,
    password: formData.ownerPassword,
    email_confirm: true,
  });

  if (userError || !newUser.user) {
    throw new Error('Error creando el usuario: ' + (userError?.message || 'desconocido'));
  }

  const today = new Date();
  const nextPayment = new Date(today);
  nextPayment.setDate(nextPayment.getDate() + 30);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const PLAN_VINCULACION_MONTOS: Record<string, number> = {
    basica: 250000,
    estandar: 300000,
    premium: 400000,
    vendedor: 40000,
  };
  const planVinculacionMonto = PLAN_VINCULACION_MONTOS[formData.planTipo];
  const planMensualidadMonto = 40000;
  const codigoReferido = formData.slug.toUpperCase();

  const { data: newStore, error: storeError } = await supabaseAdmin
    .from('stores')
    .insert({
      owner_id: newUser.user.id,
      name: formData.storeName,
      slug: formData.slug,
      brand_name: formData.brandName || formData.storeName,
      tagline: formData.tagline || null,
      whatsapp_number: formData.whatsappNumber || null,
      nequi_number: formData.nequiNumber || null,
      wompi_enabled: formData.wompiEnabled,
      shipping_fee: formData.shippingFee,
      free_shipping_threshold: formData.freeShippingThreshold,
      is_active: true,
      last_payment_date: formatDate(today),
      next_payment_date: formatDate(nextPayment),
      plan_tipo: formData.planTipo,
      plan_vinculacion_monto: planVinculacionMonto,
      plan_mensualidad_monto: planMensualidadMonto,
      referido_por: formData.referidoPor,
      codigo_referido: codigoReferido,
    })
    .select('id')
    .single();

  if (storeError || !newStore) {
    throw new Error('Error creando la tienda: ' + (storeError?.message || 'desconocido'));
  }

  if (formData.referidoPor) {
    const { data: tiendaReferente } = await supabaseAdmin
      .from('stores')
      .select('comision_pct_vinculacion')
      .eq('id', formData.referidoPor)
      .single();

    if (tiendaReferente) {
      const montoComision = Math.round(planVinculacionMonto * (tiendaReferente.comision_pct_vinculacion / 100));
      await supabaseAdmin.from('comisiones').insert({
        store_beneficiaria_id: formData.referidoPor,
        store_referida_id: newStore.id,
        tipo: 'vinculacion',
        periodo: formatDate(today),
        monto: montoComision,
        estado: 'pendiente',
      });
    }
  }

  const TEMPLATES: Record<string, { name: string; emoji: string }[]> = {
    drogueria: [
      { name: 'Medicamentos', emoji: '💊' },
      { name: 'Cuidado Personal', emoji: '🧴' },
      { name: 'Vitaminas y Suplementos', emoji: '💪' },
      { name: 'Bebés y Maternidad', emoji: '🍼' },
      { name: 'Dermocosmética', emoji: '✨' },
      { name: 'Primeros Auxilios', emoji: '🩹' },
      { name: 'Aseo del Hogar', emoji: '🧼' },
      { name: 'Cuidado del Adulto Mayor', emoji: '🦯' },
    ],
    supermercado: [
      { name: 'Carnes', emoji: '🥩' },
      { name: 'Pollo', emoji: '🍗' },
      { name: 'Pescado', emoji: '🐟' },
      { name: 'Verduras', emoji: '🥦' },
      { name: 'Frutas', emoji: '🍎' },
      { name: 'Abarrotes', emoji: '🍚' },
      { name: 'Bebidas', emoji: '🥤' },
      { name: 'Aseo', emoji: '🧼' },
      { name: 'Congelados', emoji: '❄️' },
    ],
    tienda_barrio: [
      { name: 'Abarrotes', emoji: '🍚' },
      { name: 'Bebidas', emoji: '🥤' },
      { name: 'Snacks y Dulces', emoji: '🍬' },
      { name: 'Lácteos', emoji: '🥛' },
      { name: 'Panadería', emoji: '🍞' },
      { name: 'Aseo', emoji: '🧼' },
      { name: 'Cigarrería', emoji: '🚬' },
      { name: 'Varios', emoji: '📦' },
    ],
  };

  let categoriesToInsert: { name: string; emoji: string }[];

  if (formData.businessType === 'otro') {
    categoriesToInsert = formData.customCategories
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0)
      .map(name => ({ name, emoji: '📦' }));
  } else {
    categoriesToInsert = TEMPLATES[formData.businessType] || [];
  }

  const categoryRows = categoriesToInsert.map((cat, index) => ({
    store_id: newStore.id,
    name: cat.name,
    emoji: cat.emoji,
    display_order: index,
  }));

  if (categoryRows.length > 0) {
    const { error: categoriesError } = await supabaseAdmin
      .from('store_categories')
      .insert(categoryRows);

    if (categoriesError) {
      throw new Error('Tienda creada, pero hubo un error sembrando categorías: ' + categoriesError.message);
    }
  }

  revalidatePath('/admin');

  return { success: true, slug: formData.slug };
}

export async function aprobarComision(comisionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    throw new Error('No autorizado');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const { error } = await supabaseAdmin
    .from('comisiones')
    .update({ estado: 'aprobado' })
    .eq('id', comisionId);

  if (error) {
    throw new Error('Error aprobando la comisión: ' + error.message);
  }

  revalidatePath('/admin/comisiones');
}

export async function marcarComisionPagada(comisionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    throw new Error('No autorizado');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const { error } = await supabaseAdmin
    .from('comisiones')
    .update({ estado: 'pagado' })
    .eq('id', comisionId);

  if (error) {
    throw new Error('Error marcando la comisión como pagada: ' + error.message);
  }

  revalidatePath('/admin/comisiones');
}
