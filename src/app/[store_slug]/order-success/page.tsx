import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OrderSuccessClient from './OrderSuccessClient';

export default async function OrderSuccessServerPage({ params }: { params: Promise<{ store_slug: string }> }) {
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

  return <OrderSuccessClient storeId={store.id} storeName={store.name} />;
}
