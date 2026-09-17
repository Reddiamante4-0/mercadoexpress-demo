'use client';

import { useFormStatus } from 'react-dom';

export default function ComisionActionButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: '4px 10px',
        backgroundColor: pending ? '#9ca3af' : '#16a34a',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: pending ? 'not-allowed' : 'pointer',
        fontSize: '0.8rem',
      }}
    >
      {pending ? 'Guardando...' : label}
    </button>
  );
}
