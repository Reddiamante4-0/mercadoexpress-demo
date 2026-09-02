import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StorefrontClient from './StorefrontClient';

export default async function StorePage({ params }: { params: Promise<{ store_slug: string }> }) {
  const { store_slug } = await params;
  const supabase = await createClient();
  
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, brand_name, tagline, logo_url, whatsapp_number')
    .eq('slug', store_slug)
    .eq('is_active', true)
    .single();

  if (!store) {
    notFound();
  }

  return <StorefrontClient
    storeId={store.id}
    storeName={store.name}
    storeSlug={store_slug}
    brandName={store.brand_name}
    tagline={store.tagline}
    logoUrl={store.logo_url}
    whatsappNumber={store.whatsapp_number}
  />;
}
