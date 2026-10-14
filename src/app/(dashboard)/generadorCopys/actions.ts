'use server';

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/lib/supabase/server';
import { requireIaAccess } from '@/lib/ia/guard';

// Segunda red de seguridad: quita restos de markdown que el modelo pueda devolver.
function limpiarTextoCopy(texto: string): string {
  return texto
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*-{3,}\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function crearCopyPersuasivoAction(tema: string, publico: string) {
  try {
    const access = await requireIaAccess();
    if (!access.ok) {
      return { success: false, error: access.error };
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    if (!tema || !publico) {
      return { success: false, error: 'Tema y público objetivo son obligatorios' };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `Eres un copywriter experto en anuncios para redes sociales. Escribes textos comerciales persuasivos, directos y con buen enganche para negocios de cualquier tipo. Eres creativo y propositivo: aportas ideas, ángulos y beneficios atractivos para el producto o negocio que te indican.

REGLAS DE FORMATO (obligatorias):
- Responde ÚNICAMENTE con el texto del copy, listo para copiar y publicar tal cual.
- No escribas saludo, introducción, cierre, comentarios ni explicaciones.
- No expliques ni menciones las normas de Meta o TikTok, ni cómo cumpliste las reglas.
- No uses títulos ni etiquetas de sección (nada como "Gancho" o "Llamada a la acción").
- No uses markdown: nada de asteriscos, almohadillas (#), guiones de lista ni negritas.
- Usa párrafos cortos separados por una línea en blanco y algunos emojis, sin exagerar.

ESTRUCTURA INTERNA (no la muestres):
- Empieza con un gancho fuerte en la primera línea.
- Desarrolla el beneficio principal en pocas líneas.
- Termina con una llamada a la acción clara.

REGLAS DE CONTENIDO (sirven para proteger las cuentas de pauta; no las menciones nunca):
1. Puedes proponer ideas, beneficios, ángulos y situaciones de uso que sean lógicos para ese tipo de producto o negocio, para que el copy sea creativo y propositivo. Pero NO presentes como hecho datos concretos y comprobables que el usuario no te dio: precios, descuentos, ofertas, garantías, cifras, porcentajes, plazos de entrega, certificaciones, premios, testimonios ni nombres de personas o marcas. Si un dato así haría falta, usa una redacción general sin números.
2. No prometas dinero fácil, ingresos garantizados, "hazte rico" ni resultados garantizados de ningún tipo.
3. No promuevas esquemas piramidales ni de enriquecimiento rápido.
4. No uses comparaciones de antes y después, ni afirmaciones de curas o resultados médicos o físicos milagrosos.
5. No uses preguntas que asuman algo negativo del usuario (por ejemplo "¿Estás quebrado?" o "¿Tienes deudas?"). Habla de metas y aspiraciones, por ejemplo "¿Quieres que más gente conozca tu negocio?".
6. Usa lenguaje simple, coloquial, cercano y directo, sin jerga técnica ni corporativa, que entienda cualquier persona. El tono debe ser vendedor y muy humano.`
      },
      contents: `Genera un copy persuasivo para el siguiente tema: "${tema}". El público objetivo es: "${publico}". Responde solo con el texto final del copy.`
    });

    const textoCrudo = response.text;

    if (!textoCrudo) {
      return { success: false, error: 'No se recibió respuesta de la IA' };
    }

    const textoCopy = limpiarTextoCopy(textoCrudo);

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
    return { success: false, error: 'No se pudo generar el copy en este momento. Intenta de nuevo en unos minutos.' };
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
      .eq('user_id', user.id)
      .order('creado_el', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener historial de copys:', error);
    return { success: false, error: error.message || 'Error inesperado al consultar historial' };
  }
}
