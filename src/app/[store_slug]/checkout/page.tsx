import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutServerPage({ params }: { params: Promise<{ store_slug: string }> }) {
  const { store_slug } = await params;
  const supabase = await createClient();
  
  const { data: store, error } = await supabase
    .from('stores')
    .select('id, name, whatsapp_number, nequi_number, wompi_enabled, shipping_fee, free_shipping_threshold')
    .eq('slug', store_slug)
    .eq('is_active', true)
    .single();

  if (!store) {
    console.error("DEBUG checkout/page.tsx: store not found!", { store_slug, store, error });
    notFound();
  }

  return (
    <CheckoutClient
      storeId={store.id}
      storeName={store.name}
      storeSlug={store_slug}
      whatsappNumber={store.whatsapp_number}
      nequiNumber={store.nequi_number}
      wompiEnabled={store.wompi_enabled}
      shippingFee={store.shipping_fee}
      freeShippingThreshold={store.free_shipping_threshold}
    />
  );
}
