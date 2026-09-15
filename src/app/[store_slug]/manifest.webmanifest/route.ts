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
  const icon = store.logo_url || '/favicon.ico';

  let iconType = 'image/png';
  if (icon.toLowerCase().endsWith('.jpg') || icon.toLowerCase().endsWith('.jpeg')) {
    iconType = 'image/jpeg';
  } else if (icon.toLowerCase().endsWith('.svg')) {
    iconType = 'image/svg+xml';
  } else if (icon.toLowerCase().endsWith('.webp')) {
    iconType = 'image/webp';
  } else if (icon.toLowerCase().endsWith('.gif')) {
    iconType = 'image/gif';
  } else if (icon.toLowerCase().endsWith('.ico')) {
    iconType = 'image/x-icon';
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
