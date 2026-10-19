import { createClient } from '@/lib/supabase/server';

// Herramientas de IA de Crisalap Impulsa. La clave de cada una es la que se
// guarda en la columna `herramientas_ia` de la tabla `stores` y la que cada
// acción del servidor pasa a requireIaAccess().
export type HerramientaIa = 'copys' | 'guiones' | 'estudio-creativo';

export const TODAS_LAS_HERRAMIENTAS: HerramientaIa[] = ['copys', 'guiones', 'estudio-creativo'];

// Planes que tienen acceso a todas las herramientas de IA.
const IA_PLANES_PERMITIDOS = ['vendedor'];

// Herramientas que reciben por regla todas las tiendas comerciales (sin
// plan Impulsa). El resto solo se habilita por excepción, agregando su clave
// a `herramientas_ia` de esa tienda.
const HERRAMIENTAS_COMERCIALES: HerramientaIa[] = ['estudio-creativo'];

export type IaAccessResult =
  | { ok: true; userId: string; storeId: string }
  | { ok: false; error: string };

type Contexto =
  | { ok: true; userId: string; storeId: string; completo: boolean; herramientas: HerramientaIa[] }
  | { ok: false; error: string };

function soloValidas(valores: unknown): HerramientaIa[] {
  if (!Array.isArray(valores)) return [];
  return TODAS_LAS_HERRAMIENTAS.filter((h) => valores.includes(h));
}

// Una sola regla para saber qué puede usar quien está conectado. La usan el
// permiso de cada acción y el menú, para que nunca se contradigan.
async function cargarContexto(): Promise<Contexto> {
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
    return { ok: true, userId: user.id, storeId: '', completo: true, herramientas: [...TODAS_LAS_HERRAMIENTAS] };
  }

  const consulta = await supabase
    .from('stores')
    .select('id, plan_tipo, is_active, herramientas_ia')
    .eq('owner_id', user.id)
    .single();
  let store = consulta.data;

  // Si la columna `herramientas_ia` todavía no existe, se consulta sin ella
  // para no bloquear a nadie mientras se crea.
  if (consulta.error || !store) {
    const respaldo = await supabase
      .from('stores')
      .select('id, plan_tipo, is_active')
      .eq('owner_id', user.id)
      .single();
    store = respaldo.data ? { ...respaldo.data, herramientas_ia: [] } : null;
  }

  if (!store) {
    return { ok: false, error: 'Tienda no encontrada' };
  }

  if (store.is_active !== true) {
    return { ok: false, error: 'Membresía inactiva' };
  }

  if (IA_PLANES_PERMITIDOS.includes(store.plan_tipo)) {
    return { ok: true, userId: user.id, storeId: store.id, completo: true, herramientas: [...TODAS_LAS_HERRAMIENTAS] };
  }

  const herramientas = TODAS_LAS_HERRAMIENTAS.filter(
    (h) => HERRAMIENTAS_COMERCIALES.includes(h) || soloValidas(store.herramientas_ia).includes(h)
  );
  return { ok: true, userId: user.id, storeId: store.id, completo: false, herramientas };
}

// Sin argumento exige acceso completo (plan Impulsa o super-admin), como antes.
// Con la clave de una herramienta, solo exige esa.
export async function requireIaAccess(herramienta?: HerramientaIa): Promise<IaAccessResult> {
  const ctx = await cargarContexto();
  if (!ctx.ok) return ctx;

  const permitido = herramienta ? ctx.herramientas.includes(herramienta) : ctx.completo;
  if (!permitido) {
    return { ok: false, error: 'Esta herramienta no está incluida en tu plan' };
  }

  return { ok: true, userId: ctx.userId, storeId: ctx.storeId };
}

// Herramientas que puede ver y usar quien está conectado (para el menú).
export async function herramientasIaPermitidas(): Promise<HerramientaIa[]> {
  const ctx = await cargarContexto();
  return ctx.ok ? ctx.herramientas : [];
}
