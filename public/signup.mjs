export const NEEDS = ['inventario', 'mantenimiento', 'cronogramas', 'reportes', 'otra'];
export const INTERESTS = ['probar beta', 'recibir demostración', 'conocer precios'];
export function validateSignup(data) {
  if (typeof data.nombre !== 'string' || data.nombre.trim().length < 2 || data.nombre.trim().length > 100) throw new Error('Escribe un nombre de entre 2 y 100 caracteres.');
  if (typeof data.correo !== 'string' || data.correo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) throw new Error('Escribe un correo electrónico válido.');
  if (typeof data.perfil_empresa !== 'string' || !data.perfil_empresa.trim() || data.perfil_empresa.trim().length > 180) throw new Error('Indica tu perfil o establecimiento.');
  if (!NEEDS.includes(data.necesidad) || !INTERESTS.includes(data.interes)) throw new Error('Selecciona tu necesidad principal y tu interés.');
  if (data.consentimiento !== true) throw new Error('Debes aceptar la política de privacidad y el contacto para inscribirte.');
  return { nombre: data.nombre.trim(), correo: data.correo.trim().toLowerCase(), perfil_empresa: data.perfil_empresa.trim(), necesidad: data.necesidad, interes: data.interes, consentimiento: true };
}
export function validateConfig(config) {
  const url = String(config?.supabaseUrl || '').trim().replace(/\/+$/, '');
  const key = String(config?.supabaseKey || '').trim();
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error('La inscripción todavía no está disponible. Inténtalo más tarde.'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('La inscripción todavía no está disponible. Inténtalo más tarde.');
  if (key.startsWith('sb_secret_')) throw new Error('La inscripción todavía no está disponible. Inténtalo más tarde.');
  if (!key.startsWith('sb_publishable_')) {
    try {
      const payload = key.split('.')[1];
      const role = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).role;
      if (role !== 'anon') throw new Error('Clave no pública');
    } catch { throw new Error('La inscripción todavía no está disponible. Inténtalo más tarde.'); }
  }
  return { url, key };
}
export async function submitSignup(config, values, fetcher = globalThis.fetch) {
  const body = validateSignup(values);
  const { url, key } = validateConfig(config);
  const headers = { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
  // Las publishable no son JWT: no se envían como Bearer. La anon heredada sí es JWT.
  if (!key.startsWith('sb_publishable_')) headers.Authorization = `Bearer ${key}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetcher(`${url}/rest/v1/beta_signups`, { method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal });
    if (response.status !== 201 && response.status !== 204) {
      if (response.status === 409) throw new Error('La inscripción no se pudo guardar porque existe un registro en conflicto. Si ya te inscribiste, no necesitas repetirlo.');
      if (response.status === 429) throw new Error('Hay demasiadas solicitudes. Espera un momento antes de intentarlo de nuevo.');
      throw new Error('No se pudo guardar tu inscripción. Inténtalo más tarde.');
    }
    return true;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('No pudimos confirmar la inscripción a tiempo. Puede haberse guardado; revisa con el equipo antes de volver a enviarla.');
    if (error instanceof TypeError) throw new Error('Se interrumpió la conexión y no pudimos confirmar el registro. Puede haberse guardado; revisa con el equipo antes de reenviarlo.');
    throw error;
  } finally { clearTimeout(timeout); }
}
