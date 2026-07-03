import { createClient } from '@supabase/supabase-base-js';

// Conexión automática usando los enlaces que usted ya tiene en su archivo .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Función para guardar el copy generado en la base de datos del portal
 * @param {string} usuarioId - El ID del usuario que pidió el copy
 * @param {string} textoCopy - El texto disruptivo que creó la IA
 * @param {string} campañaTema - El tema de la campaña
 */
export async function guardarCopyEnHistorial(usuarioId, textoCopy, campañaTema) {
  try {
    const { data, error } = await supabase
      .from('historial_copys') // Nombre de la tabla en su bodega de Supabase
      .insert([
        { 
          user_id: usuarioId, 
          copy_texto: textoCopy, 
          tema: campañaTema,
          creado_el: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    console.log('¡Copy guardado con éxito en Supabase para Red Diamante 4.0!');
    return data;
  } catch (error) {
    console.error('Error al guardar en la base de datos:', error.message);
    throw error;
  }
}