'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

async function verificarSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    throw new Error('No autorizado');
  }
}

export async function agregarCategoriaAdmin(storeId: string, formData: FormData) {
  await verificarSuperAdmin();
  const nombre = String(formData.get('nombre') || '');
  const nombreLimpio = nombre.trim();

  if (!nombreLimpio) {
    throw new Error('El nombre de la categoría no puede estar vacío.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const { data: existente } = await supabaseAdmin
    .from('store_categories')
    .select('id')
    .eq('store_id', storeId)
    .ilike('name', nombreLimpio)
    .maybeSingle();

  if (existente) {
    throw new Error('Ya existe una categoría con ese nombre.');
  }

  const { data: ultimaCategoria } = await supabaseAdmin
    .from('store_categories')
    .select('display_order')
    .eq('store_id', storeId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const siguienteOrden = (ultimaCategoria?.display_order ?? -1) + 1;

  const { error } = await supabaseAdmin.from('store_categories').insert({
    store_id: storeId,
    name: nombreLimpio,
    emoji: '📦',
    display_order: siguienteOrden,
  });

  if (error) {
    throw new Error('No se pudo crear la categoría: ' + error.message);
  }

  revalidatePath(`/admin/tiendas/${storeId}/categorias`);
  revalidatePath('/dashboard/categorias');
  revalidatePath('/dashboard/productos');
}

export async function renombrarCategoriaAdmin(storeId: string, categoriaId: string, formData: FormData) {
  await verificarSuperAdmin();
  const nuevoNombre = String(formData.get('nuevoNombre') || '');
  const nombreLimpio = nuevoNombre.trim();

  if (!nombreLimpio) {
    throw new Error('El nombre de la categoría no puede estar vacío.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const { data: categoria } = await supabaseAdmin
    .from('store_categories')
    .select('id, name, store_id')
    .eq('id', categoriaId)
    .maybeSingle();

  if (!categoria || categoria.store_id !== storeId) {
    throw new Error('No autorizado');
  }

  const { data: existente } = await supabaseAdmin
    .from('store_categories')
    .select('id')
    .eq('store_id', storeId)
    .ilike('name', nombreLimpio)
    .neq('id', categoriaId)
    .maybeSingle();

  if (existente) {
    throw new Error('Ya existe otra categoría con ese nombre.');
  }

  const { error: errorProductos } = await supabaseAdmin
    .from('products')
    .update({ category: nombreLimpio })
    .eq('store_id', storeId)
    .eq('category', categoria.name);

  if (errorProductos) {
    throw new Error('No se pudieron actualizar los productos de esta categoría: ' + errorProductos.message);
  }

  const { error } = await supabaseAdmin
    .from('store_categories')
    .update({ name: nombreLimpio })
    .eq('id', categoriaId);

  if (error) {
    throw new Error('No se pudo renombrar la categoría: ' + error.message);
  }

  revalidatePath(`/admin/tiendas/${storeId}/categorias`);
  revalidatePath('/dashboard/categorias');
  revalidatePath('/dashboard/productos');
}

export async function eliminarCategoriaAdmin(storeId: string, categoriaId: string) {
  await verificarSuperAdmin();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const { data: categoria } = await supabaseAdmin
    .from('store_categories')
    .select('id, name, store_id')
    .eq('id', categoriaId)
    .maybeSingle();

  if (!categoria || categoria.store_id !== storeId) {
    throw new Error('No autorizado');
  }

  const { count } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('category', categoria.name);

  if (count && count > 0) {
    throw new Error(`No se puede eliminar: hay ${count} producto${count === 1 ? '' : 's'} usando esta categoría.`);
  }

  const { error } = await supabaseAdmin
    .from('store_categories')
    .delete()
    .eq('id', categoriaId);

  if (error) {
    throw new Error('No se pudo eliminar la categoría: ' + error.message);
  }

  revalidatePath(`/admin/tiendas/${storeId}/categorias`);
  revalidatePath('/dashboard/categorias');
  revalidatePath('/dashboard/productos');
}
