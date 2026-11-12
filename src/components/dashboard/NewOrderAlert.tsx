'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, BellOff, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AvisoPedido {
  key: string;
  cliente: string;
  total: number;
  pago: string;
}

const STORAGE_KEY = 'crisalap_sonido_pedidos';

const formatPrice = (val: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(val);

/**
 * Avisa en el panel cuando entra un pedido nuevo: suena un timbre y muestra
 * un cartel con el cliente y el total. Funciona con el panel abierto en el
 * navegador (aunque sea en segundo plano). Avisa de todo pedido que se
 * registre, esté o no confirmado el pago.
 */
export function NewOrderAlert() {
  const [supabase] = useState(() => createClient());
  const [sonidoActivo, setSonidoActivo] = useState(false);
  const [avisos, setAvisos] = useState<AvisoPedido[]>([]);

  const sonidoRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);
  const tituloOriginalRef = useRef<string>('');

  // --- Audio ---
  const desbloquearAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return;
        audioRef.current = new Ctor();
      }
      if (audioRef.current && audioRef.current.state === 'suspended') {
        audioRef.current.resume().catch(() => {});
      }
    } catch {
      // Sin audio disponible: el cartel igual se muestra.
    }
  }, []);

  const sonarTimbre = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx || ctx.state !== 'running') return;
    const nota = (frecuencia: number, inicio: number, duracion: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frecuencia;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + inicio);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + inicio + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + duracion);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + inicio);
      osc.stop(ctx.currentTime + inicio + duracion + 0.05);
    };
    // Dos "ding-dong" seguidos, para que se alcance a oír.
    nota(880, 0, 0.35);
    nota(1318, 0.3, 0.5);
    nota(880, 1.1, 0.35);
    nota(1318, 1.4, 0.5);
  }, []);

  // Preferencia guardada + desbloqueo con el primer toque en la página
  useEffect(() => {
    tituloOriginalRef.current = document.title;
    let guardado = false;
    try {
      guardado = window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      guardado = false;
    }
    setSonidoActivo(guardado);
    sonidoRef.current = guardado;

    const alPrimerToque = () => {
      if (sonidoRef.current) desbloquearAudio();
    };
    window.addEventListener('pointerdown', alPrimerToque);
    window.addEventListener('keydown', alPrimerToque);
    return () => {
      window.removeEventListener('pointerdown', alPrimerToque);
      window.removeEventListener('keydown', alPrimerToque);
    };
  }, [desbloquearAudio]);

  // Si estaba en otra pestaña, devolver el título original al volver
  useEffect(() => {
    const alVolver = () => {
      if (!document.hidden && tituloOriginalRef.current) {
        document.title = tituloOriginalRef.current;
      }
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => document.removeEventListener('visibilitychange', alVolver);
  }, []);

  const alternarSonido = () => {
    const nuevo = !sonidoRef.current;
    sonidoRef.current = nuevo;
    setSonidoActivo(nuevo);
    try {
      window.localStorage.setItem(STORAGE_KEY, nuevo ? '1' : '0');
    } catch {
      // Si no se puede guardar, solo vale para esta sesión.
    }
    if (nuevo) {
      desbloquearAudio();
      // Pequeña prueba para que el dueño sepa cómo suena
      setTimeout(sonarTimbre, 150);
    }
  };

  // --- Escucha de pedidos nuevos ---
  useEffect(() => {
    let activo = true;
    let canal: ReturnType<typeof supabase.channel> | null = null;

    async function iniciar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !activo) return;

      const { data: tienda } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      if (!tienda || !activo) return;

      canal = supabase
        .channel(`pedidos-nuevos-${tienda.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
            filter: `store_id=eq.${tienda.id}`,
          },
          (payload: any) => {
            const fila = payload.new || {};
            const aviso: AvisoPedido = {
              key: `${fila.id ?? 'pedido'}-${Date.now()}`,
              cliente: fila.customer_name || 'Cliente',
              total: Number(fila.total) || 0,
              pago: fila.payment_method || '',
            };
            setAvisos((prev) => [aviso, ...prev].slice(0, 3));
            setTimeout(() => {
              setAvisos((prev) => prev.filter((a) => a.key !== aviso.key));
            }, 30000);

            if (sonidoRef.current) sonarTimbre();
            if (document.hidden) document.title = '🔔 ¡Nuevo pedido!';
          }
        )
        .subscribe();
    }

    iniciar();
    return () => {
      activo = false;
      if (canal) supabase.removeChannel(canal);
    };
  }, [supabase, sonarTimbre]);

  return (
    <>
      {/* Carteles de pedido nuevo */}
      <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))]">
        {avisos.map((a) => (
          <div
            key={a.key}
            className="bg-white border border-green-300 shadow-xl rounded-2xl p-4 flex items-start gap-3"
            role="status"
          >
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-black text-slate-800">¡Nuevo pedido!</p>
              <p className="text-xs text-slate-600 truncate">
                {a.cliente} · {formatPrice(a.total)}
              </p>
              {a.pago && <p className="text-[11px] text-slate-400 truncate">{a.pago}</p>}
              <Link
                href="/dashboard/pedidos"
                onClick={() => setAvisos((prev) => prev.filter((x) => x.key !== a.key))}
                className="inline-block mt-1.5 text-xs font-bold text-green-600 hover:text-green-700"
              >
                Ver pedidos
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setAvisos((prev) => prev.filter((x) => x.key !== a.key))}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Botón para activar o silenciar el sonido */}
      <button
        type="button"
        onClick={alternarSonido}
        className={`fixed bottom-4 right-4 z-[10000] flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95 ${
          sonidoActivo
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 animate-pulse'
        }`}
        title={sonidoActivo ? 'Silenciar el timbre de pedidos' : 'Activar el timbre de pedidos'}
      >
        {sonidoActivo ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        <span>{sonidoActivo ? 'Timbre de pedidos activo' : 'Activar timbre de pedidos'}</span>
      </button>
    </>
  );
}
