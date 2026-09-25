'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

async function getStoreIdDelUsuarioActual(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No autorizado');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseSecret);

  const { data: tienda } = await supabaseAdmin
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!tienda) {
    throw new Error('No se encontró una tienda asociada a este usuario.');
  }

  return tienda.id;
}

export async function agregarCategoria(nombre: string) {
  const storeId = await getStoreIdDelUsuarioActual();
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

  revalidatePath('/dashboard/categorias');
  revalidatePath('/dashboard/productos');
}

export async function renombrarCategoria(categoriaId: string, nuevoNombre: string) {
  const storeId = await getStoreIdDelUsuarioActual();
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

  revalidatePath('/dashboard/categorias');
  revalidatePath('/dashboard/productos');
}

export async function eliminarCategoria(categoriaId: string) {
  const storeId = await getStoreIdDelUsuarioActual();

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

  revalidatePath('/dashboard/categorias');
  revalidatePath('/dashboard/productos');
}
