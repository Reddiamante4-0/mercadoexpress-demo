'use server';

import { GoogleGenAI } from '@google/genai';

export async function generarAnuncioCompletoAction(
  producto: string,
  audiencia: string,
  objetivo: string
) {
  try {
    if (!producto || !audiencia || !objetivo) {
      return { success: false, error: 'Todos los campos son obligatorios.' };
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // 1. Generate Copies and Image Prompts with Anti-Ban Shield
    const promptCopys = `Eres un redactor creativo experto en pauta y cumplimiento de políticas de Meta & TikTok Ads.
    Genera 3 variaciones de copy persuasivo de ventas en español para el siguiente negocio/producto: "${producto}", dirigido a la audiencia: "${audiencia}" y con el objetivo de campaña: "${objetivo}".

    Las variaciones deben usar estas 3 estructuras específicas:
    1. Fórmula AIDA (Atención, Interés, Deseo, Acción)
    2. Fórmula PAS (Problema, Agitación, Solución)
    3. Gancho Directo (Hook de alto impacto inicial y llamada directa al producto)

    REGLAS ESTRICTAS ANTI-BANEOS:
    - Está terminantemente prohibido prometer ingresos fáciles, rápidos, automáticos o cifras de dinero irreales.
    - No uses palabras como "hazte rico", "gana dinero desde casa", "libertad financiera garantizada", ni menciones esquemas piramidales o de enriquecimiento rápido.
    - No sugieras antes/después ni hagas promesas milagrosas.
    - No uses preguntas intrusivas que asuman problemas personales (ej. "¿No tienes dinero?").
    - Enfócate en el desarrollo de habilidades, automatización de marketing, herramientas de negocio y metas de superación transparentes.

    Devuelve la respuesta estrictamente en formato JSON con la siguiente estructura exacta:
    {
      "aida": "Texto estructurado AIDA",
      "pas": "Texto estructurado PAS",
      "gancho": "Texto estructurado Gancho Directo",
      "imagePrompt": "A detailed English prompt for a Facebook/Instagram ad banner related to this product. Describe a high-converting, professional, and visually stunning marketing scene (like a premium photo of the product, workspace, or lifestyle setting matching the audience). Keep it modern, clean, with realistic details, and NO text on the image."
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
      },
      contents: promptCopys,
    });

    const text = response.text;
    if (!text) {
      return { success: false, error: 'No se recibió respuesta de la IA' };
    }

    const result = JSON.parse(text);

    return {
      success: true,
      data: {
        copys: {
          aida: result.aida,
          pas: result.pas,
          gancho: result.gancho,
        },
        imagePrompt: result.imagePrompt || `Professional premium marketing banner for ${producto}, high resolution, modern composition, marketing style`
      },
    };
  } catch (error: any) {
    console.error('Error al generar anuncios creativos:', error);
    const is503 = error.status === 503 || error.message?.includes('503') || error.message?.includes('UNAVAILABLE');
    const is429 = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429;
    return { 
      success: false, 
      error: is503 
        ? '503_UNAVAILABLE' 
        : is429 
          ? 'Procesando solicitud, por favor espera unos segundos...' 
          : (error.message || 'Error al procesar el estudio creativo') 
    };
  }
}
