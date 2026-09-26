'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { crearSolicitud } from './actions';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  marginTop: '4px',
  marginBottom: '14px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#333',
};

function SolicitudForm() {
  const searchParams = useSearchParams();
  const refCodigo = searchParams.get('ref') || '';
  const pedidoId = searchParams.get('pedido') || '';

  const [nombreNegocio, setNombreNegocio] = useState('');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [contactoEmail, setContactoEmail] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('');
  const [sitioweb, setSitioweb] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    try {
      await crearSolicitud({
        nombreNegocio,
        contactoNombre,
        contactoTelefono,
        contactoEmail,
        tipoNegocio,
        refCodigo,
        sitioweb,
        pedidoId,
      });
      setResult({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setResult({ success: false, error: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result?.success) {
    return (
      <div style={{ padding: '32px', maxWidth: '480px', margin: '0 auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#16a34a' }}>¡Listo!</h1>
        <p>Recibimos tu solicitud. Muy pronto te contactaremos para armar tu tienda.</p>
      </div>
    );
  }

  if (!pedidoId) {
    return (
      <div style={{ padding: '32px', maxWidth: '480px', margin: '0 auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '12px' }}>Acceso no disponible</h1>
        <p style={{ fontSize: '14px', color: '#555' }}>
          Este formulario solo se habilita después de completar el pago de tu plan en nuestra tienda de ventas. Si ya pagaste y llegaste aquí por error, contáctanos.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '480px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>Quiero mi tienda en Crisalap</h1>
      <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
        Cuéntanos de tu negocio y te contactaremos para armar tu tienda.
      </p>

      <form onSubmit={handleSubmit}>
        {result?.success === false && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #dc2626', borderRadius: '6px', marginBottom: '16px', color: '#991b1b', fontSize: '13px' }}>
            {result.error}
          </div>
        )}

        {/* Campo trampa para bots: invisible para personas reales */}
        <input
          type="text"
          value={sitioweb}
          onChange={(e) => setSitioweb(e.target.value)}
          name="sitioweb"
          autoComplete="off"
          tabIndex={-1}
          style={{ position: 'absolute', left: '-9999px' }}
          aria-hidden="true"
        />

        <label style={labelStyle}>Nombre del negocio</label>
        <input type="text" value={nombreNegocio} onChange={(e) => setNombreNegocio(e.target.value)} required style={inputStyle} />

        <label style={labelStyle}>Tu nombre</label>
        <input type="text" value={contactoNombre} onChange={(e) => setContactoNombre(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>WhatsApp / Teléfono</label>
        <input type="tel" value={contactoTelefono} onChange={(e) => setContactoTelefono(e.target.value)} required style={inputStyle} />

        <label style={labelStyle}>Correo (opcional)</label>
        <input type="email" value={contactoEmail} onChange={(e) => setContactoEmail(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Tipo de negocio (opcional)</label>
        <input type="text" value={tipoNegocio} onChange={(e) => setTipoNegocio(e.target.value)} placeholder="Droguería, supermercado, etc." style={inputStyle} />

        <button
          type="submit"
          disabled={isSubmitting}
          style={{ width: '100%', padding: '10px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  );
}

export default function SolicitudPage() {
  return (
    <Suspense fallback={<div style={{ padding: '32px', textAlign: 'center' }}>Cargando...</div>}>
      <SolicitudForm />
    </Suspense>
  );
}
