import { readFile, rm, mkdir, cp, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateConfig } from '../public/signup.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
// Variables locales opcionales; en Vercel se usan las del panel Environment Variables.
try {
  const env = await readFile(path.join(root,'.env'), 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^\s*(SUPABASE_URL|SUPABASE_PUBLISHABLE_KEY|SUPABASE_ANON_KEY)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1,-1);
      process.env[match[1]] = value;
    }
  }
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const config = {supabaseUrl:process.env.SUPABASE_URL || '', supabaseKey:process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || ''};
const preview = process.argv.includes('--preview');
if (preview && !process.env.VERCEL && !config.supabaseUrl && !config.supabaseKey) {
  console.warn('Vista previa sin conexión: el formulario no guardará inscripciones.');
} else {
  try { const validated = validateConfig(config); config.supabaseUrl = validated.url; }
  catch { console.error('Configura SUPABASE_URL (https://TU-PROYECTO.supabase.co) y SUPABASE_PUBLISHABLE_KEY (publishable o anon). Nunca uses secret/service_role.'); process.exit(1); }
}
const dist = path.join(root, 'dist');
await rm(dist, { recursive:true, force:true }); await mkdir(dist, { recursive:true });
await cp(path.join(root,'public'), dist, {recursive:true});
await writeFile(path.join(dist,'config.js'), 'window.BIOGESTION_CONFIG = '+JSON.stringify(config)+';\n');
console.log('Landing preparada en dist/.');
