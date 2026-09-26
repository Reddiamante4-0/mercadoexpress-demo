'use client';

import React, { useState } from 'react';
import { createNewStore } from '../actions';

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

type TiendaExistente = {
  id: string;
  name: string;
  brand_name: string | null;
  codigo_referido: string | null;
};

type SolicitudPrefill = {
  id: string;
  nombreNegocio: string;
  contactoTelefono: string | null;
  tipoNegocio: string | null;
  referidoPorId: string | null;
  subdominioDeseado: string | null;
  brandName: string | null;
  tagline: string | null;
  nequiNumber: string | null;
  customCategories: string | null;
  planTipo: string | null;
  shippingFee: number | null;
  freeShippingThreshold: number | null;
  ownerEmail: string | null;
};

const TIPOS_NEGOCIO_VALIDOS = ['drogueria', 'supermercado', 'tienda_barrio', 'otro'] as const;
const PLANES_VALIDOS = ['basica', 'estandar', 'premium', 'vendedor'] as const;

function slugificar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function NuevaTiendaForm({
  tiendasExistentes,
  solicitudPrefill,
}: {
  tiendasExistentes: TiendaExistente[];
  solicitudPrefill?: SolicitudPrefill | null;
}) {
  const tipoNegocioPrefill = TIPOS_NEGOCIO_VALIDOS.find((t) => t === solicitudPrefill?.tipoNegocio);
  const planTipoPrefill = PLANES_VALIDOS.find((p) => p === solicitudPrefill?.planTipo);

  const [ownerEmail, setOwnerEmail] = useState(solicitudPrefill?.ownerEmail || '');
  const [storeName, setStoreName] = useState(solicitudPrefill?.nombreNegocio || '');
  const [slug, setSlug] = useState(
    slugificar(solicitudPrefill?.subdominioDeseado || solicitudPrefill?.nombreNegocio || '')
  );
  const [brandName, setBrandName] = useState(solicitudPrefill?.brandName || '');
  const [tagline, setTagline] = useState(solicitudPrefill?.tagline || '');
  const [whatsappNumber, setWhatsappNumber] = useState(solicitudPrefill?.contactoTelefono || '');
  const [nequiNumber, setNequiNumber] = useState(solicitudPrefill?.nequiNumber || '');
  const [wompiEnabled, setWompiEnabled] = useState(true);
  const [shippingFee, setShippingFee] = useState(solicitudPrefill?.shippingFee ?? 5000);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(solicitudPrefill?.freeShippingThreshold ?? 80000);
  const [businessType, setBusinessType] = useState<'drogueria' | 'supermercado' | 'tienda_barrio' | 'otro'>(tipoNegocioPrefill || 'tienda_barrio');
  const [customCategories, setCustomCategories] = useState(solicitudPrefill?.customCategories || '');
  const [planTipo, setPlanTipo] = useState<'basica' | 'estandar' | 'premium' | 'vendedor'>(planTipoPrefill || 'basica');
  const [referidoPor, setReferidoPor] = useState(solicitudPrefill?.referidoPorId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; slug?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await createNewStore({
        ownerEmail,
        storeName,
        slug,
        brandName,
        tagline,
        whatsappNumber,
        nequiNumber,
        wompiEnabled,
        shippingFee,
        freeShippingThreshold,
        businessType,
        customCategories,
        planTipo,
        referidoPor: referidoPor || null,
        solicitudId: solicitudPrefill?.id || null,
      });
      setResult({ success: true, slug: res.slug });
    } catch (err) {
      setResult({ success: false, error: err instanceof Error ? err.message : 'Error desconocido' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result?.success) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#e6f7ec', border: '1px solid #16a34a', borderRadius: '6px' }}>
        <p style={{ fontWeight: 'bold', color: '#16a34a', marginBottom: '8px' }}>¡Tienda creada exitosamente!</p>
        <p style={{ fontSize: '14px' }}>
          Subdominio: <a href={`https://${result.slug}.crisalap.com`} target="_blank" rel="noopener noreferrer">{result.slug}.crisalap.com</a>
        </p>
        <p style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>
          Le enviamos un correo de invitación al dueño para que defina su propia contraseña.
        </p>
        <button
          onClick={() => setResult(null)}
          style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Crear otra tienda
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {solicitudPrefill && (
        <div style={{ padding: '10px 12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#1e3a8a' }}>
          Datos precargados desde una solicitud con pago verificado.
          {planTipoPrefill && ` Plan pagado detectado: "${planTipoPrefill}".`}
          {' '}Revisa y completa lo que falte antes de crear la tienda.
        </div>
      )}
      {result?.success === false && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #dc2626', borderRadius: '6px', marginBottom: '16px', color: '#991b1b', fontSize: '13px' }}>
          {result.error}
        </div>
      )}

      <label style={labelStyle}>Correo del dueño</label>
      <input type="email" required value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>Nombre del negocio</label>
      <input type="text" required value={storeName} onChange={(e) => setStoreName(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>Subdominio</label>
      <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} style={inputStyle} />
      <p style={hintStyle}>Se verá como: {slug || 'nombre-tienda'}.crisalap.com</p>

      <label style={labelStyle}>Nombre de marca (opcional)</label>
      <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>Tagline (opcional)</label>
      <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>Número de WhatsApp</label>
      <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>Número de Nequi (opcional)</label>
      <input type="text" value={nequiNumber} onChange={(e) => setNequiNumber(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>
        <input type="checkbox" checked={wompiEnabled} onChange={(e) => setWompiEnabled(e.target.checked)} style={{ marginRight: '6px' }} />
        Aceptar pagos en línea con Wompi
      </label>
      <div style={{ marginBottom: '14px' }} />

      <label style={labelStyle}>Costo de domicilio</label>
      <input type="number" value={shippingFee} onChange={(e) => setShippingFee(Number(e.target.value))} style={inputStyle} />

      <label style={labelStyle}>Envío gratis desde</label>
      <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(Number(e.target.value))} style={inputStyle} />

      <label style={labelStyle}>Plan de Vinculación</label>
      <select value={planTipo} onChange={(e) => setPlanTipo(e.target.value as any)} style={inputStyle}>
        <option value="basica">Básica — $250.000 (hasta 75 productos)</option>
        <option value="estandar">Estándar — $300.000 (hasta 150 productos)</option>
        <option value="premium">Premium — $400.000 (hasta 300 productos)</option>
        <option value="vendedor">Vendedor/Afiliado — $80.000 (solo referir, sin catálogo)</option>
      </select>
      <p style={hintStyle}>Todos los planes pagan $40.000 de mensualidad.</p>

      <label style={labelStyle}>¿Quién la refirió? (opcional)</label>
      <select value={referidoPor} onChange={(e) => setReferidoPor(e.target.value)} style={inputStyle}>
        <option value="">Ninguno — venta directa</option>
        {tiendasExistentes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.brand_name || t.name}{t.codigo_referido ? ` (${t.codigo_referido})` : ''}
          </option>
        ))}
      </select>

      <label style={labelStyle}>Tipo de negocio</label>
      <select value={businessType} onChange={(e) => setBusinessType(e.target.value as any)} style={inputStyle}>
        <option value="tienda_barrio">Tienda de barrio</option>
        <option value="drogueria">Droguería</option>
        <option value="supermercado">Supermercado</option>
        <option value="otro">Otro / Personalizado</option>
      </select>

      {businessType === 'otro' && (
        <>
          <label style={labelStyle}>Categorías personalizadas (separadas por coma)</label>
          <input type="text" value={customCategories} onChange={(e) => setCustomCategories(e.target.value)} style={inputStyle} placeholder="Ej: Papelería, Juguetes, Regalos" />
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: '10px 20px',
          backgroundColor: isSubmitting ? '#9ca3af' : '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {isSubmitting ? 'Creando tienda...' : 'Crear Tienda'}
      </button>
    </form>
  );
}
