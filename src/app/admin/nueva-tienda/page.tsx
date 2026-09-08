import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import NuevaTiendaForm from './NuevaTiendaForm';

export const dynamic = 'force-dynamic';

export default async function NuevaTiendaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    notFound();
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '640px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Crear Tienda Nueva</h1>
      <NuevaTiendaForm />
    </div>
  );
}
