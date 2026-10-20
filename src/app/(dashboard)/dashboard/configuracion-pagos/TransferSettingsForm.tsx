'use client'

import { useState } from 'react';
import { saveTransferSettings } from './transferActions';

export default function TransferSettingsForm({
  initialNequi,
  initialBreB,
}: {
  initialNequi: string;
  initialBreB: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await saveTransferSettings(formData);

    if (result.success) {
      setMessage('Datos de transferencia guardados correctamente.');
    } else {
      setError(result.error || 'Ocurrió un error inesperado.');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && <div className="p-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg">{message}</div>}
      {error && <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-2">Número de Nequi</label>
        <input
          type="text"
          name="nequi_number"
          defaultValue={initialNequi}
          placeholder="3001234567"
          inputMode="numeric"
          className="w-full bg-[#2C2C2E] text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#E3E810] transition-colors"
        />
        <p className="text-xs text-gray-400 mt-1">Tus clientes verán este número para transferirte por Nequi.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Llave Bre-B</label>
        <input
          type="text"
          name="llave_bre_b"
          defaultValue={initialBreB}
          placeholder="Tu llave Bre-B"
          className="w-full bg-[#2C2C2E] text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#E3E810] transition-colors"
        />
        <p className="text-xs text-gray-400 mt-1">Puede ser tu celular, correo, alias o documento, tal como la registraste en tu banco.</p>
      </div>

      <p className="text-xs text-gray-400">
        Si dejas un campo vacío, ese método no se ofrece en tu tienda.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E3E810] text-black font-semibold py-3 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? 'Guardando...' : 'Guardar datos de transferencia'}
      </button>
    </form>
  );
}
