import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StorefrontClient from './StorefrontClient';

export const dynamic = 'force-dynamic';

export default async function StorePage({ params }: { params: Promise<{ store_slug: string }> }) {
  const { store_slug } = await params;
  const supabase = await createClient();
  
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, brand_name, tagline, logo_url, whatsapp_number, hero_description, hero_image_url, hero_badge_text, hero_title_text, hero_subtitle_text, shipping_fee, free_shipping_threshold, hero_header_subtitle, hero_delivery_badge, hero_guarantee_text, hero_discount_text, hero_cta_primary, hero_cta_secondary')
    .eq('slug', store_slug)
    .eq('is_active', true)
    .single();

  if (!store) {
    notFound();
  }

  const { data: categories } = await supabase
    .from('store_categories')
    .select('name, emoji, display_order')
    .eq('store_id', store.id)
    .order('display_order', { ascending: true });

  return <StorefrontClient
    storeId={store.id}
    storeName={store.name}
    brandName={store.brand_name}
    tagline={store.tagline}
    logoUrl={store.logo_url}
    whatsappNumber={store.whatsapp_number}
    heroDescription={store.hero_description}
    heroImageUrl={store.hero_image_url}
    heroBadgeText={store.hero_badge_text}
    heroTitleText={store.hero_title_text}
    heroSubtitleText={store.hero_subtitle_text}
    categories={categories || []}
    shippingFee={store.shipping_fee}
    freeShippingThreshold={store.free_shipping_threshold}
    storeSlug={store_slug}
    heroHeaderSubtitle={store.hero_header_subtitle}
    heroDeliveryBadge={store.hero_delivery_badge}
    heroGuaranteeText={store.hero_guarantee_text}
    heroDiscountText={store.hero_discount_text}
    heroCtaPrimary={store.hero_cta_primary}
    heroCtaSecondary={store.hero_cta_secondary}
  />;
}
