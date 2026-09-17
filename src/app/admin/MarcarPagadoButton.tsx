'use client';

import { useFormStatus } from 'react-dom';

export default function MarcarPagadoButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: '6px 12px',
        backgroundColor: pending ? '#9ca3af' : '#16a34a',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: pending ? 'not-allowed' : 'pointer',
      }}
    >
      {pending ? 'Guardando...' : 'Marcar como pagado'}
    </button>
  );
}
