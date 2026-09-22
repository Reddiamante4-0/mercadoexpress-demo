import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ store_slug: string }> }
) {
  const { store_slug } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from('stores')
    .select('name, brand_name, logo_url, theme_color')
    .eq('slug', store_slug)
    .eq('is_active', true)
    .single();

  if (!store) {
    return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
  }

  const displayName = store.brand_name || store.name;
  const hasLogo = Boolean(store.logo_url);
  const icon = store.logo_url || '/icon-512.png';

  // El logo de cada tienda puede estar en distintos formatos (png, jpg, webp),
  // así que verificamos el formato real en vez de asumir uno fijo.
  // Si la tienda no tiene logo propio, usamos el logo de Crisalap (siempre PNG).
  let iconType = 'image/png';
  if (hasLogo) {
    try {
      const headRes = await fetch(icon, { method: 'HEAD' });
      const contentType = headRes.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        iconType = contentType;
      }
    } catch {
      // Si la verificación falla, seguimos con image/png por defecto
      // para no romper el manifest completo.
    }
  }

  const manifest = {
    name: displayName,
    short_name: displayName,
    start_url: `/${store_slug}`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: store.theme_color || '#16a34a',
    orientation: 'portrait-primary',
    icons: [
      { src: icon, sizes: '192x192', type: iconType, purpose: 'any' },
      { src: icon, sizes: '512x512', type: iconType, purpose: 'any' },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
}
