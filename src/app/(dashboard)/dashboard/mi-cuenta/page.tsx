'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentStoreId } from '@/lib/supabase-api';
import { getMiCuentaData, MiCuentaData } from '@/lib/mi-cuenta-api';

const ESTADO_PAGO: Record<string, { texto: string; bg: string; color: string }> = {
  suspendida: { texto: '⚫ Suspendida', bg: '#e5e7eb', color: '#374151' },
  vencido: { texto: '🔴 Vencido', bg: '#fee2e2', color: '#991b1b' },
  vence_pronto: { texto: '🟡 Vence pronto', bg: '#fef3c7', color: '#92400e' },
  al_dia: { texto: '🟢 Al día', bg: '#dcfce7', color: '#166534' },
};

const ESTADO_COMISION: Record<string, { texto: string; bg: string; color: string }> = {
  pendiente: { texto: '🟡 Pendiente', bg: '#fef3c7', color: '#92400e' },
  aprobado: { texto: '🔵 Aprobado', bg: '#dbeafe', color: '#1e40af' },
  pagado: { texto: '🟢 Pagado', bg: '#dcfce7', color: '#166534' },
};

export default function MiCuentaPage() {
  const [data, setData] = useState<MiCuentaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const storeId = await getCurrentStoreId();
      if (!storeId) {
        if (active) setLoading(false);
        return;
      }
      const result = await getMiCuentaData(storeId);
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!data) return <div className="p-6">No se pudo cargar la información.</div>;

  let estadoPago = ESTADO_PAGO.al_dia;
  if (!data.store.isActive) {
    estadoPago = ESTADO_PAGO.suspendida;
  } else if (data.store.nextPaymentDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = data.store.nextPaymentDate.split('-').map(Number);
    const dueDate = new Date(y, m - 1, d);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 0) estadoPago = ESTADO_PAGO.vencido;
    else if (daysUntilDue <= 5) estadoPago = ESTADO_PAGO.vence_pronto;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mi Cuenta</h1>

      <div className="bg-white rounded-lg shadow p-5 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Estado de mi suscripción</h2>
        <span
          className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-4"
          style={{ backgroundColor: estadoPago.bg, color: estadoPago.color }}
        >
          {estadoPago.texto}
        </span>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Último pago</p>
            <p className="font-semibold">{data.store.lastPaymentDate || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Próximo vencimiento</p>
            <p className="font-semibold">{data.store.nextPaymentDate || '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
        <h2 className="text-lg font-semibold mb-1">Mis referidos</h2>
        <p className="text-sm text-gray-500 mb-4">
          Tu código de referido: <span className="font-mono font-bold">{data.store.codigoReferido || '—'}</span>
        </p>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-700">Este mes</p>
            <p className="text-xl font-bold text-green-800">${data.totalEsteMes.toLocaleString('es-CO')}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total histórico</p>
            <p className="text-xl font-bold text-gray-800">${data.totalHistorico.toLocaleString('es-CO')}</p>
          </div>
        </div>

        {data.comisiones.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no has referido ninguna tienda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-gray-500">
                <th className="py-2">Tienda</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Monto</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.comisiones.map((c) => {
                const estado = ESTADO_COMISION[c.estado] || ESTADO_COMISION.pendiente;
                return (
                  <tr key={c.id} className="border-b border-gray-100">
                    <td className="py-2">{c.referidaNombre}</td>
                    <td className="py-2">{c.tipo === 'vinculacion' ? 'Vinculación' : 'Mensualidad'}</td>
                    <td className="py-2">${c.monto.toLocaleString('es-CO')}</td>
                    <td className="py-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ backgroundColor: estado.bg, color: estado.color }}
                      >
                        {estado.texto}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
