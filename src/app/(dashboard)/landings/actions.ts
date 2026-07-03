'use server';

import { GoogleGenAI } from '@google/genai';

export async function generarTextosLandingAction(
  producto: string,
  plantilla: string,
  seccion: string
) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    if (!producto || !plantilla || !seccion) {
      return { success: false, error: 'Todos los campos son obligatorios.' };
    }

    const prompt = `Eres un copywriter experto en embudos de conversión y landing pages de alto rendimiento para Red Diamante 4.0.
    Tu tarea es generar textos persuasivos para una landing page de tipo "${plantilla}".
    Específicamente, necesitamos textos para la sección: "${seccion}".
    El producto/servicio a promover es: "${producto}".

    Instrucciones específicas para cada sección:
    - Titular: Genera 3 opciones de titulares llamativos, claros y enfocados en la solución principal.
    - Subtítulo: Genera 3 opciones de subtítulos que complementen al titular, derriben objeciones iniciales o detallen el beneficio principal.
    - Gancho (Hook): Genera 2 párrafos cortos y persuasivos que retengan al lector y despierten curiosidad.
    - CTA (Llamado a la Acción): Genera 3 frases cortas de acción para los botones de compra/registro.

    Devuelve exactamente los textos generados en formato plano con buena estructura para leerlos y copiarlos fácilmente en español.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      return { success: false, error: 'No se recibió respuesta de la IA' };
    }

    return { success: true, text };
  } catch (error: any) {
    console.error('Error al generar textos de landing:', error);
    const is429 = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429;
    return { 
      success: false, 
      error: is429 
        ? 'Procesando solicitud, por favor espera unos segundos...' 
        : (error.message || 'Error al procesar los textos de la landing') 
    };
  }
}
