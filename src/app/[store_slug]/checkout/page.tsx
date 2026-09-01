import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutServerPage({ params }: { params: Promise<{ store_slug: string }> }) {
  const { store_slug } = await params;
  const supabase = await createClient();
  
  const { data: store } = await supabase
    .from('stores')
    .select('id, name')
    .eq('slug', store_slug)
    .eq('is_active', true)
    .single();

  if (!store) {
    notFound();
  }

  return <CheckoutClient storeId={store.id} storeName={store.name} />;
}
