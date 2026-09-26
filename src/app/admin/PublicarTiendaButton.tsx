'use client';

import { useFormStatus } from 'react-dom';

export default function PublicarTiendaButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: '6px 12px',
        backgroundColor: pending ? '#9ca3af' : '#1e40af',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: pending ? 'not-allowed' : 'pointer',
      }}
    >
      {pending ? 'Publicando...' : 'Publicar tienda'}
    </button>
  );
}
