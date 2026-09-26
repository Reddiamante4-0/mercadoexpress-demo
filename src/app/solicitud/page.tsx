'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { crearSolicitud, verificarPedido } from './actions';

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

const hintStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#888',
  marginTop: '-10px',
  marginBottom: '14px',
};

function slugificar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function AccesoNoDisponible({ mensaje }: { mensaje: string }) {
  return (
    <div style={{ padding: '32px', maxWidth: '480px', margin: '0 auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '20px', marginBottom: '12px' }}>Acceso no disponible</h1>
      <p style={{ fontSize: '14px', color: '#555' }}>{mensaje}</p>
    </div>
  );
}

function SolicitudForm() {
  const searchParams = useSearchParams();
  const refCodigo = searchParams.get('ref') || '';
  const pedidoId = searchParams.get('pedido') || '';

  const [verificacion, setVerificacion] = useState<{ loading: boolean; ok: boolean; planTipo?: string; error?: string }>(() =>
    pedidoId ? { loading: true, ok: false } : { loading: false, ok: false }
  );

  useEffect(() => {
    if (!pedidoId) {
      return;
    }
    let cancelado = false;
    verificarPedido(pedidoId).then((res) => {
      if (cancelado) return;
      if (res.ok) {
        setVerificacion({ loading: false, ok: true, planTipo: res.planTipo });
      } else {
        setVerificacion({ loading: false, ok: false, error: res.error });
      }
    });
    return () => {
      cancelado = true;
    };
  }, [pedidoId]);

  const esVendedor = verificacion.planTipo === 'vendedor';

  const [nombreNegocio, setNombreNegocio] = useState('');
  const [subdominioDeseado, setSubdominioDeseado] = useState('');
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [contactoEmail, setContactoEmail] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [nequiNumber, setNequiNumber] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState<'drogueria' | 'supermercado' | 'tienda_barrio' | 'otro'>('tienda_barrio');
  const [customCategories, setCustomCategories] = useState('');
  const [shippingFee, setShippingFee] = useState('5000');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('80000');
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
        subdominioDeseado,
        brandName,
        tagline,
        nequiNumber,
        customCategories,
        shippingFee,
        freeShippingThreshold,
        ownerEmail,
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
      <AccesoNoDisponible mensaje="Este formulario solo se habilita después de completar el pago de tu plan en nuestra tienda de ventas. Si ya pagaste y llegaste aquí por error, contáctanos." />
    );
  }

  if (verificacion.loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'sans-serif', color: '#666' }}>
        Verificando tu pago...
      </div>
    );
  }

  if (!verificacion.ok) {
    return <AccesoNoDisponible mensaje={verificacion.error || 'No pudimos verificar tu pago.'} />;
  }

  return (
    <div style={{ padding: '32px', maxWidth: '480px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>Quiero mi tienda en Crisalap</h1>
      <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
        Ya confirmamos tu pago. Cuéntanos de tu negocio para armar tu tienda.
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

        <label style={labelStyle}>Subdominio deseado</label>
        <input
          type="text"
          value={subdominioDeseado}
          onChange={(e) => setSubdominioDeseado(slugificar(e.target.value))}
          required
          style={inputStyle}
        />
        <p style={hintStyle}>Se verá como: {subdominioDeseado || 'nombre-tienda'}.crisalap.com</p>

        <label style={labelStyle}>Nombre de marca (opcional)</label>
        <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Tagline (opcional)</label>
        <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Tu nombre</label>
        <input type="text" value={contactoNombre} onChange={(e) => setContactoNombre(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>WhatsApp / Teléfono</label>
        <input type="tel" value={contactoTelefono} onChange={(e) => setContactoTelefono(e.target.value)} required style={inputStyle} />

        <label style={labelStyle}>Correo de contacto (opcional)</label>
        <input type="email" value={contactoEmail} onChange={(e) => setContactoEmail(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Correo del dueño de la tienda</label>
        <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required style={inputStyle} />
        <p style={hintStyle}>Ahí llegará la invitación para crear su cuenta.</p>

        {!esVendedor && (
          <>
            <label style={labelStyle}>Número de Nequi (opcional)</label>
            <input type="text" value={nequiNumber} onChange={(e) => setNequiNumber(e.target.value)} style={inputStyle} />

            <label style={labelStyle}>Tipo de negocio</label>
            <select value={tipoNegocio} onChange={(e) => setTipoNegocio(e.target.value as 'drogueria' | 'supermercado' | 'tienda_barrio' | 'otro')} style={inputStyle}>
              <option value="tienda_barrio">Tienda de barrio</option>
              <option value="drogueria">Droguería</option>
              <option value="supermercado">Supermercado</option>
              <option value="otro">Otro / Personalizado</option>
            </select>

            {tipoNegocio === 'otro' && (
              <>
                <label style={labelStyle}>Categorías personalizadas (separadas por coma)</label>
                <input type="text" value={customCategories} onChange={(e) => setCustomCategories(e.target.value)} style={inputStyle} placeholder="Ej: Papelería, Juguetes, Regalos" />
              </>
            )}

            <label style={labelStyle}>Costo de domicilio</label>
            <input type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} style={inputStyle} />

            <label style={labelStyle}>Envío gratis desde</label>
            <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} style={inputStyle} />
          </>
        )}

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
