import { createClient } from '@/lib/supabase/server';

// Planes que tienen acceso a las herramientas de IA.
const IA_PLANES_PERMITIDOS = ['vendedor'];

// TODO (futuro): Se agregará la columna `ia_habilitada` en la tabla `stores`
// para permitir excepciones por tienda sin cambiar el plan. No usar hasta
// que exista esa columna en base de datos.

export type IaAccessResult =
  | { ok: true; userId: string; storeId: string }
  | { ok: false; error: string };

export async function requireIaAccess(): Promise<IaAccessResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'No autenticado' };
  }

  // Super-admin: acceso total sin restricciones de plan.
  if (
    process.env.SUPER_ADMIN_EMAIL &&
    user.email === process.env.SUPER_ADMIN_EMAIL
  ) {
    return { ok: true, userId: user.id, storeId: '' };
  }

  const { data: store } = await supabase
    .from('stores')
    .select('id, plan_tipo, is_active')
    .eq('owner_id', user.id)
    .single();

  if (!store) {
    return { ok: false, error: 'Tienda no encontrada' };
  }

  if (store.is_active !== true) {
    return { ok: false, error: 'Membresía inactiva' };
  }

  if (!IA_PLANES_PERMITIDOS.includes(store.plan_tipo)) {
    return { ok: false, error: 'Esta herramienta no está incluida en tu plan' };
  }

  return { ok: true, userId: user.id, storeId: store.id };
}
