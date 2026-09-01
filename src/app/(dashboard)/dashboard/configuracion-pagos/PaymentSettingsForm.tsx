'use client'

import { useState } from 'react';
import { saveStorePaymentSettings } from './actions';

export default function PaymentSettingsForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const result = await saveStorePaymentSettings(formData);
    
    if (result.success) {
      setMessage('Configuración guardada correctamente.');
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
        <label className="block text-sm font-medium mb-2">Llave Pública (Public Key)</label>
        <input 
          type="text" 
          name="wompi_pub_key" 
          defaultValue={initialData?.wompi_pub_key || ''}
          placeholder="pub_prod_..."
          className="w-full bg-[#2C2C2E] text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#E3E810] transition-colors"
          required
        />
        <p className="text-xs text-gray-400 mt-1">Usada para cargar el Widget de pagos en la tienda.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Llave Privada (Private Key)</label>
        <input 
          type="password" 
          name="wompi_prv_key" 
          defaultValue={initialData?.wompi_prv_key || ''}
          placeholder="prv_prod_..."
          className="w-full bg-[#2C2C2E] text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#E3E810] transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Secreto de Integridad (Integrity Secret)</label>
        <input 
          type="password" 
          name="wompi_integrity_secret" 
          defaultValue={initialData?.wompi_integrity_secret || ''}
          placeholder="prod_integrity_..."
          className="w-full bg-[#2C2C2E] text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#E3E810] transition-colors"
          required
        />
        <p className="text-xs text-gray-400 mt-1">Garantiza que el valor del pedido no sea modificado (Usado para la firma de integridad).</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Secreto de Eventos (Event Secret)</label>
        <input 
          type="password" 
          name="wompi_event_secret" 
          defaultValue={initialData?.wompi_event_secret || ''}
          placeholder="prod_events_..."
          className="w-full bg-[#2C2C2E] text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#E3E810] transition-colors"
          required
        />
        <p className="text-xs text-gray-400 mt-1">Necesario para validar los webhooks cuando un pago es aprobado o rechazado.</p>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#E3E810] text-black font-semibold py-3 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? 'Guardando...' : 'Guardar Llaves de Pago'}
      </button>
    </form>
  );
}
