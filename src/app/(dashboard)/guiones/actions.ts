'use server';

import { GoogleGenAI } from '@google/genai';

export async function generarGuionVideoAction(tema: string, publico: string) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    if (!tema || !publico) {
      return { success: false, error: 'El tema y el público objetivo son obligatorios.' };
    }

    const prompt = `Eres un creador de contenido viral y copywriter experto en videos cortos (Reels, TikTok, Shorts).
    Genera un guión estructurado impecable para un video de unos 30 segundos sobre el tema: "${tema}", enfocado al público objetivo: "${publico}".

    El guión debe estructurarse estrictamente en tres partes:
    1. Gancho (0-3 seg): 3 opciones de aperturas ultra disruptivas y llamativas en español para capturar la atención del espectador de inmediato.
    2. Cuerpo (4-30 seg): Desarrollo del contenido paso a paso. Debe estar fragmentado en 3 a 5 secuencias cortas, indicando el texto hablado y notas detalladas sobre qué mostrar visualmente (tomas de apoyo/b-roll, transiciones rápidas, efectos de sonido y zoom).
    3. Llamado a la Acción (CTA) (31-35 seg): 2 opciones del cierre exacto para direccionar el tráfico (ej. "Comenta REGISTRO abajo", "Ve al enlace de mi perfil").

    Devuelve la respuesta estrictamente en formato JSON con la siguiente estructura exacta:
    {
      "ganchos": ["Opción de gancho viral 1", "Opción de gancho viral 2", "Opción de gancho viral 3"],
      "cuerpo": [
        {
          "tiempo": "04-10 seg",
          "texto": "Texto hablado en esta secuencia",
          "visual": "Nota de edición: toma de apoyo del producto, zoom rápido al rostro, texto en pantalla 'ATENCIÓN'"
        },
        {
          "tiempo": "11-20 seg",
          "texto": "Texto hablado en esta secuencia",
          "visual": "Nota de edición: mostrar pantalla de la app en uso, transición por corte rápido, efecto de sonido 'pop'"
        },
        {
          "tiempo": "21-30 seg",
          "texto": "Texto hablado en esta secuencia",
          "visual": "Nota de edición: mirar a cámara con entusiasmo, subtítulo animado, zoom lento hacia adentro"
        }
      ],
      "ctas": ["Opción de cierre viral 1", "Opción de cierre viral 2"]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
      },
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      return { success: false, error: 'No se recibió respuesta de la IA' };
    }

    const data = JSON.parse(text);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al generar guión de video:', error);
    const is429 = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429;
    return { 
      success: false, 
      error: is429 
        ? 'Procesando solicitud, por favor espera unos segundos...' 
        : (error.message || 'Error al procesar el guión de video') 
    };
  }
}
