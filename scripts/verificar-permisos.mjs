// Ejecutar DESPUÉS de comprobar una inscripción real en el Table Editor.
// No muestra datos personales ni escribe registros.
import { readFile } from 'node:fs/promises';
import { validateConfig } from '../public/signup.mjs';
const source = await readFile(new URL('../dist/config.js',import.meta.url),'utf8');
const config = JSON.parse(source.replace(/^window\.BIOGESTION_CONFIG\s*=\s*/, '').trim().replace(/;$/, ''));
const {url,key} = validateConfig(config);
const headers = {apikey:key};
if (!key.startsWith('sb_publishable_')) headers.Authorization = `Bearer ${key}`;
const response = await fetch(`${url}/rest/v1/beta_signups?select=id&limit=1`, {headers,signal:AbortSignal.timeout(20000)});
let body; try {body = await response.json();} catch {throw new Error('Respuesta inesperada: prueba no concluyente.');}
if ((response.status === 401 || response.status === 403) && body?.code === '42501') {
  console.log('Lectura pública rechazada por permisos de PostgreSQL. Conserva esta salida como evidencia junto a la inscripción confirmada.');
} else if (response.ok && Array.isArray(body) && body.length === 0) {
  console.log('No hay filas visibles para anon. Solo es evidencia de bloqueo si confirmaste que existe una inscripción en el Table Editor. Revisa también políticas y grants con 02_revisar_configuracion.sql.');
} else if (response.ok && Array.isArray(body) && body.length > 0) {
  console.error('FALLO: hay registros visibles al público. Revisa RLS y permisos antes de difundir la landing. No se mostraron datos.'); process.exitCode = 1;
} else {
  console.error(`Prueba no concluyente (HTTP ${response.status}). Revisa URL, clave, tabla y Data API. Un error de clave no prueba que RLS funcione.`); process.exitCode = 1;
}
