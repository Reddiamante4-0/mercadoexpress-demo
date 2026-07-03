import { GoogleGenAI } from '@google/genai';

// 1. Conexión automática con la API Key de Gemini guardada en su .env.local
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Función principal para generar copys disruptivos y persuasivos con Gemini
 * @param {string} tema - El tema del negocio (Ej: "Membresía LiveGood")
 * @param {string} publico - A quién va dirigido (Ej: "Emprendedores digitales")
 */
export async function crearCopyPersuasivo(tema, publico) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // El motor más rápido, moderno y eficiente
      config: {
        systemInstruction: `Eres un experto en marketing digital disruptivo y copywriting de alto impacto para el sistema Red Diamante 4.0. 
        Tu objetivo es crear textos comerciales altamente persuasivos y directos.
        CRÍTICO: Está completamente prohibido usar jerga técnica, corporativa o palabras sofisticadas. Usa un lenguaje simple, coloquial, directo y cercano, ideal para que lo entienda cualquier persona del común. El tono debe ser vendedor, rompedor y muy humano.`
      },
      contents: `Genera un copy persuasivo enfocado en el siguiente tema: "${tema}". El público objetivo es: "${publico}". Incluye un gancho inicial fuerte y una llamada a la acción clara.`
    });

    return response.text;
  } catch (error) {
    console.error('Error al generar el copy con Gemini en el portal:', error);
    throw error;
  }
}