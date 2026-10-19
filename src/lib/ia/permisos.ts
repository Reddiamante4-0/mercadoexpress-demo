'use server';

import { herramientasIaPermitidas } from '@/lib/ia/guard';

// El menú lateral pregunta aquí qué herramientas de IA puede ver quien está
// conectado. La regla vive en guard.ts, la misma que protege cada acción.
export async function obtenerHerramientasIaAction(): Promise<string[]> {
  try {
    return await herramientasIaPermitidas();
  } catch (error) {
    console.error('Error al consultar las herramientas de IA:', error);
    return [];
  }
}
