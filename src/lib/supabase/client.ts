import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY;

  let isValidUrl = false;
  if (url) {
    try {
      new URL(url);
      isValidUrl = true;
    } catch {
      isValidUrl = false;
    }
  }

  if (!url || !key || !isValidUrl) {
    console.warn('Supabase client environment variables are missing or invalid! Using placeholders.');
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
  }

  return createBrowserClient(url, key);
}
