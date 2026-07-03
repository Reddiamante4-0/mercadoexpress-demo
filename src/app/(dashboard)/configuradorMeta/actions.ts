'use server';

import { GoogleGenAI } from '@google/genai';

function getAi() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

function handleActionError(error: any, context: string) {
  console.error(`Error en ${context}:`, error);
  const is429 = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429;
  return { 
    success: false, 
    error: is429 
      ? 'Procesando solicitud, por favor espera unos segundos...' 
      : (error.message || `Error al procesar ${context}`) 
  };
}

export async function generarIdentidadMarcaAction(
  nombre: string,
  tipo: string,
  cliente: string,
  tono: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!tipo) {
      return { success: false, error: 'El tipo de negocio/nicho es obligatorio.' };
    }

    const prompt = `Basándote en la siguiente información de negocio:
    - Nombre propuesto inicial: '${nombre || 'N/A'}'
    - Tipo de negocio / Nicho principal: '${tipo}'
    - Cliente ideal: '${cliente || 'Público general interesado en el nicho'}'
    - Tono de voz: '${tono || 'profesional'}'

    Genera los siguientes elementos persuasivos de marketing 100% enfocados en texto para la FanPage de Facebook:
    1. Tres (3) opciones de nombres comerciales y profesionales gancheros para el negocio en este nicho.
    2. Una Biografía Corta y persuasiva de menos de 255 caracteres (límite oficial de Facebook).
    3. Una sección de Información General (un párrafo descriptivo, emotivo y vendedor para el perfil).
    4. Un prompt de imagen muy detallado (en inglés) para la Portada (Banner) de Facebook (851x315 px), ideal para herramientas externas como Midjourney o Bing Image Creator, describiendo estilos visuales, iluminación de marketing y composición. Sin texto.
    5. Un prompt de imagen detallado (en inglés) para la Foto de Perfil (Profile Picture), ideal para herramientas externas como Midjourney o Bing Image Creator, que represente un logo o avatar corporativo elegante. Sin texto.

    Devuelve la respuesta estrictamente en formato JSON con la siguiente estructura exacta:
    {
      "nombres": ["Opción 1", "Opción 2", "Opción 3"],
      "bio": "Biografía persuasiva de menos de 255 caracteres",
      "descripcion": "Párrafo de descripción para el perfil",
      "promptPortada": "Prompt detallado en inglés para la portada (Midjourney/Bing)",
      "promptPerfil": "Prompt detallado en inglés para el perfil (Midjourney/Bing)"
    }`;

    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
      },
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error('No se recibió respuesta de Gemini');

    const result = JSON.parse(text);
    return { success: true, data: result };
  } catch (error: any) {
    return handleActionError(error, 'identidad de marca');
  }
}

export async function obtenerDirectricesSeguridadAction(
  pais: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!pais) {
      return { success: false, error: 'El país es obligatorio' };
    }

    const prompt = `Eres un experto en cumplimiento de políticas publicitarias y protección de activos en Meta Ads. Para el país '${pais}', proporciona las directrices recomendadas de configuración del Administrador Comercial para establecer una infraestructura segura y cumplir con las normas de Meta.
    Sugiere la zona horaria y moneda local adecuadas, y detalla 3 pasos obligatorios de seguridad y buenas prácticas (2FA, verificación de correo, administrador de respaldo).
    Devuelve la respuesta estrictamente en formato JSON con la estructura:
    {
      "zonaHoraria": "ej. America/Bogota",
      "moneda": "ej. COP (Peso Colombiano)",
      "directrices": ["Directriz 1", "Directriz 2", "Directriz 3"]
    }`;

    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
      },
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error('No se recibió respuesta de Gemini');

    const result = JSON.parse(text);
    return { success: true, data: result };
  } catch (error: any) {
    return handleActionError(error, 'directrices de seguridad');
  }
}

export async function obtenerEscudoFinancieroAction(
  pais: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!pais) {
      return { success: false, error: 'El país es obligatorio' };
    }

    const prompt = `Eres un asesor financiero de tráfico de Meta Ads. Para el país '${pais}', proporciona recomendaciones de qué tipos de tarjetas bancarias locales (crédito, débito, prepago) y bancos son aceptados por Meta y cuáles suelen dar problemas de rechazo.
    Detalla el fondo mínimo necesario que debe tener la tarjeta para pasar la verificación de seguridad inicial sin problemas.
    Devuelve la respuesta estrictamente en formato JSON con la estructura:
    {
      "tarjetasAceptadas": "Descripción de tarjetas y bancos recomendados en el país",
      "tarjetasRechazadas": "Descripción de tarjetas o bancos que suelen fallar en el país",
      "fondoMinimo": "Monto de fondo mínimo sugerido en moneda local y dólares",
      "recomendaciones": ["Recomendación 1", "Recomendación 2"]
    }`;

    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
      },
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error('No se recibió respuesta de Gemini');

    const result = JSON.parse(text);
    return { success: true, data: result };
  } catch (error: any) {
    return handleActionError(error, 'escudo financiero');
  }
}

export async function explicarPixelAction(
  pixelId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!pixelId) {
      return { success: false, error: 'El ID del píxel es obligatorio' };
    }

    const prompt = `Explica de forma muy sencilla, en exactamente dos frases, qué es el píxel de Meta (con el ID '${pixelId}') y cómo actúa en el embudo de ventas para rastrear a los clientes.
    Devuelve la respuesta estrictamente en formato JSON con la estructura:
    {
      "explicacion": "Las dos frases explicativas de alta claridad"
    }`;

    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
      },
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error('No se recibió respuesta de Gemini');

    const result = JSON.parse(text);
    return { success: true, data: result };
  } catch (error: any) {
    return handleActionError(error, 'explicación del píxel');
  }
}

export async function generarWhatsAppMensajesAction(
  numero: string,
  negocio: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!numero || !negocio) {
      return { success: false, error: 'El número y el negocio son obligatorios' };
    }

    const prompt = `Crea exactamente 3 opciones de mensajes de bienvenida cortos, persuasivos y naturales que los clientes usarán para enviar un mensaje al negocio '${negocio}' al hacer clic en un anuncio (ej. 'Hola, vi tu anuncio en Facebook y me interesa obtener la membresía...').
    El número telefónico is '${numero}'.
    Devuelve la respuesta estrictamente en formato JSON con la estructura:
    {
      "mensajes": ["Mensaje de opción 1", "Mensaje de opción 2", "Mensaje de opción 3"]
    }`;

    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
      },
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error('No se recibió respuesta de Gemini');

    const result = JSON.parse(text);
    return { success: true, data: result };
  } catch (error: any) {
    return handleActionError(error, 'mensajes de WhatsApp');
  }
}

export async function generarEstructuraLandingAction(
  negocio: string,
  producto: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!negocio || !producto) {
      return { success: false, error: 'El nombre del negocio y la oferta son obligatorios' };
    }

    const prompt = `Como copywriter experto en conversión, crea una estructura y copia base para la página de destino (landing page) o descripción del grupo de prospección para el negocio '${negocio}' que ofrece '${producto}'.
    La estructura debe contener:
    1. Un Titular de Impacto (Hook) que llame la atención.
    2. Un Subtitular aclaratorio y persuasivo.
    3. Una sección del Problema principal (2 líneas).
    4. Una sección de Solución y beneficios clave (3 viñetas).
    5. Un Llamado a la Acción (CTA) fuerte.
    
    Devuelve la respuesta estrictamente en formato JSON con la estructura:
    {
      "titular": "Titular de alto impacto",
      "subtitular": "Subtitular persuasivo",
      "problema": "Descripción corta del dolor o problema que resuelve",
      "beneficios": ["Beneficio 1", "Beneficio 2", "Beneficio 3"],
      "cta": "Llamado a la acción recomendado"
    }`;

    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
      },
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error('No se recibió respuesta de Gemini');

    const result = JSON.parse(text);
    return { success: true, data: result };
  } catch (error: any) {
    return handleActionError(error, 'estructura de landing');
  }
}

