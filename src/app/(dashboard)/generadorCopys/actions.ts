'use server';

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

export async function crearCopyPersuasivoAction(tema: string, publico: string) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    if (!tema || !publico) {
      return { success: false, error: 'Tema y público objetivo son obligatorios' };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `Eres un experto en marketing digital disruptivo, copywriting de alto impacto y especialista en cumplimiento de políticas publicitarias para el sistema Red Diamante 4.0.
        Tu objetivo es crear textos comerciales altamente persuasivos, directos y con excelente enganche, pero que CUMPLAN ESTRICTAMENTE las políticas publicitarias de Meta Ads y TikTok Ads para proteger las cuentas de los usuarios de baneos o restricciones.

        NORMAS OBLIGATORIAS ANTI-BANEOS:
        1. PROHIBIDO Promesas Exageradas o Fáciles de Ingresos/Dinero: Nunca uses frases como "hazte rico", "gana dinero rápido", "ingresos automáticos", "gana dinero desde casa sin hacer nada", ni prometas cantidades de dinero específicas o retornos de inversión garantizados. En su lugar, enfócate en el desarrollo de habilidades, herramientas de automatización de marketing y crecimiento del negocio de forma honesta.
        2. PROHIBIDO Esquemas de Enriquecimiento o Multinivel Directos: No promuevas esquemas rápidos, piramidales ni promesas poco realistas. Presenta el producto/servicio como una suite de herramientas de automatización de anuncios y entrenamiento para emprendedores.
        3. PROHIBIDO Antes/Después y Afirmaciones de Salud/Curas: No describas ni sugieras comparaciones de antes y después de pérdida de peso, cambios corporales, curas milagrosas ni resultados médicos/físicos poco realistas.
        4. PROHIBIDO Atributos Personales Intrusionistas: No uses preguntas que asuman características negativas del usuario (ej. "¿Estás quebrado?", "¿Tienes deudas?", "¿Sufres de sobrepeso?"). Usa afirmaciones o preguntas enfocadas en metas y aspiraciones (ej. "¿Quieres automatizar tus campañas?", "¿Buscas optimizar tus anuncios?").
        5. CRÍTICO: Está completamente prohibido usar jerga técnica, corporativa o palabras sofisticadas. Usa un lenguaje simple, coloquial, directo, transparente y cercano, ideal para que lo entienda cualquier persona del común. El tono debe ser vendedor, rompedor, muy humano y sobre todo seguro para pauta publicitaria.`
      },
      contents: `Genera un copy persuasivo enfocado en el siguiente tema: "${tema}". El público objetivo es: "${publico}". Incluye un gancho inicial fuerte y una llamada a la acción clara.`
    });

    const textoCopy = response.text;

    if (!textoCopy) {
      return { success: false, error: 'No se recibió respuesta de la IA' };
    }

    // Save copy in Supabase history
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('historial_copys')
          .insert([
            {
              user_id: user.id,
              copy_texto: textoCopy,
              tema: tema,
              creado_el: new Date().toISOString()
            }
          ]);
        if (error) throw error;
      }
    } catch (dbError: any) {
      console.error('Error al guardar en base de datos:', dbError.message);
    }

    return { success: true, text: textoCopy };
  } catch (error: any) {
    console.error('Error al generar el copy con Gemini:', error);
    return { success: false, error: error.message || 'Error inesperado al generar el copy' };
  }
}

export async function obtenerHistorialCopysAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    const { data, error } = await supabase
      .from('historial_copys')
      .select('*')
      .order('creado_el', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener historial de copys:', error);
    return { success: false, error: error.message || 'Error inesperado al consultar historial' };
  }
}
