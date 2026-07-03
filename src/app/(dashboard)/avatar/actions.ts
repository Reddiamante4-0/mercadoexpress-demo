'use server';

import { GoogleGenAI } from '@google/genai';

function getAi() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

export async function analizarAvatarAction(producto: string, nicho: string) {
  try {
    if (!producto || !nicho) {
      return { success: false, error: 'Producto y nicho son obligatorios.' };
    }

    const prompt = `Eres un psicólogo de ventas y experto en marketing de conversión para Red Diamante 4.0.
    Analiza en profundidad al cliente ideal (avatar) para el siguiente Producto/Servicio: "${producto}" en el nicho general: "${nicho}".
    
    Genera un análisis práctico orientado a crear anuncios publicitarios para emprendedores principiantes.
    El JSON de respuesta debe estructurarse estrictamente de la siguiente manera para corresponder con los módulos de visualización:

    Estructura Principal:
    1. "resumenSimple": (Resumen de tu cliente ideal) Explicación de 3-4 líneas sobre quién es el cliente ideal, qué busca y qué le preocupa en lenguaje directo y sencillo.
    2. "dolorPrincipal": (Lo que más le preocupa) Resumen directo en una frase simple del dolor o preocupación más fuerte del cliente.
    3. "deseoPrincipal": (Lo que quiere lograr) Resumen directo del principal resultado o meta de bienestar/ingresos que desea conseguir.
    4. "objecionesTipicas": (Lo que probablemente te va a responder) Lista de objeciones típicas del cliente y las respuestas persuasivas sugeridas.
    5. "anguloRecomendado": (Ángulo recomendado para tu anuncio) Idea clara y directa de cómo enfocar el anuncio publicitario.

    Estructura Secundaria (Ver análisis completo):
    6. "doloresOcultos": Lista de 4 dolores ocultos o miedos inconscientes.
    7. "placeresDeseos": Lista de 4 placeres o metas aspiracionales ocultas.
    8. "segmentacionSugerida": Lista de 5 intereses exactos de segmentación para tus campañas de anuncios (Meta Ads y TikTok Ads).

    Responde únicamente con este formato JSON válido:
    {
      "resumenSimple": "Breve explicación de quién es el cliente ideal, qué busca y qué le preocupa.",
      "dolorPrincipal": "El dolor o preocupación principal del cliente.",
      "deseoPrincipal": "El resultado que el cliente desea conseguir.",
      "anguloRecomendado": "Idea clara de cómo enfocar el anuncio publicitario.",
      "objecionesTipicas": [
        { "objecion": "Objeción 1", "respuesta": "Respuesta sugerida simple" },
        { "objecion": "Objeción 2", "respuesta": "Respuesta sugerida simple" },
        { "objecion": "Objeción 3", "respuesta": "Respuesta sugerida simple" }
      ],
      "doloresOcultos": ["Dolor oculto 1", "Dolor oculto 2", "Dolor oculto 3", "Dolor oculto 4"],
      "placeresDeseos": ["Deseo oculto 1", "Deseo oculto 2", "Deseo oculto 3", "Deseo oculto 4"],
      "segmentacionSugerida": ["Interés 1", "Interés 2", "Interés 3", "Interés 4", "Interés 5"]
    }`;

    const response = await getAi().models.generateContent({
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
    console.error('Error al analizar avatar:', error);
    const is429 = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429;
    return { 
      success: false, 
      error: is429 
        ? 'Procesando solicitud, por favor espera unos segundos...' 
        : (error.message || 'Error al procesar el análisis del avatar') 
    };
  }
}

export async function generarAccionAvatarAction(
  producto: string,
  nicho: string,
  accion: 'copy' | 'guion' | 'whatsapp' | 'hooks'
) {
  try {
    if (!producto || !nicho || !accion) {
      return { success: false, error: 'Producto, nicho y acción son obligatorios.' };
    }

    let instructions = '';
    if (accion === 'copy') {
      instructions = 'Escribe un copy publicitario persuasivo, directo y de alto impacto para anuncios de Facebook/Instagram, utilizando la estructura AIDA (Atención, Interés, Deseo, Acción). Agrega llamadas a la acción claras.';
    } else if (accion === 'guion') {
      instructions = 'Escribe un guion estructurado de 30-60 segundos para un video corto (Reels/TikTok). Divide el guion claramente en: Gancho de inicio (Hook), Cuerpo explicativo de valor, y Llamado a la Acción (CTA).';
    } else if (accion === 'whatsapp') {
      instructions = 'Escribe una plantilla de mensaje comercial para que el prospecto inicie una conversación directa por WhatsApp al hacer clic en tu anuncio. Debe ser natural, directo y comercial.';
    } else if (accion === 'hooks') {
      instructions = 'Escribe exactamente 5 hooks o titulares publicitarios de alto impacto listos para captar la atención de tu avatar en los primeros 3 segundos.';
    }

    const prompt = `Como copywriter experto en marketing digital y psicología de ventas, redacta la siguiente pieza de contenido basada en el cliente ideal (Avatar) del producto:
    - Producto/Servicio: "${producto}"
    - Nicho: "${nicho}"
    
    Instrucción específica de redacción:
    ${instructions}
    
    Devuelve la respuesta estrictamente en formato JSON con la siguiente estructura exacta:
    {
      "resultado": "El texto redactado con saltos de línea (usando saltos de línea normales) listo para usar."
    }`;

    const response = await getAi().models.generateContent({
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
    console.error('Error al generar acción del avatar:', error);
    const is429 = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429;
    return { 
      success: false, 
      error: is429 
        ? 'Procesando solicitud, por favor espera unos segundos...' 
        : (error.message || 'Error al procesar la generación de copys') 
    };
  }
}
