import { supabase } from '@/lib/supabase-api';

export interface MiCuentaData {
  store: {
    name: string;
    brandName: string | null;
    isActive: boolean;
    lastPaymentDate: string | null;
    nextPaymentDate: string | null;
    planTipo: string | null;
    codigoReferido: string | null;
  };
  comisiones: {
    id: string;
    referidaNombre: string;
    tipo: string;
    monto: number;
    periodo: string;
    estado: string;
  }[];
  totalHistorico: number;
  totalEsteMes: number;
}

export async function getMiCuentaData(storeId: string): Promise<MiCuentaData | null> {
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('name, brand_name, is_active, last_payment_date, next_payment_date, plan_tipo, codigo_referido')
    .eq('id', storeId)
    .single();

  if (storeError || !store) return null;

  const { data: comisionesData } = await supabase
    .from('comisiones')
    .select('id, tipo, monto, periodo, estado, referida:store_referida_id(name, brand_name)')
    .eq('store_beneficiaria_id', storeId)
    .order('created_at', { ascending: false });

  const comisiones = (comisionesData || []).map((c: any) => ({
    id: c.id,
    referidaNombre: c.referida?.brand_name || c.referida?.name || '—',
    tipo: c.tipo,
    monto: c.monto,
    periodo: c.periodo,
    estado: c.estado,
  }));

  const totalHistorico = comisiones.reduce((sum, c) => sum + c.monto, 0);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const totalEsteMes = comisiones
    .filter((c) => c.periodo.startsWith(currentMonth))
    .reduce((sum, c) => sum + c.monto, 0);

  return {
    store: {
      name: store.name,
      brandName: store.brand_name,
      isActive: store.is_active,
      lastPaymentDate: store.last_payment_date,
      nextPaymentDate: store.next_payment_date,
      planTipo: store.plan_tipo,
      codigoReferido: store.codigo_referido,
    },
    comisiones,
    totalHistorico,
    totalEsteMes,
  };
}
