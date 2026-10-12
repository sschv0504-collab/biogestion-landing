import test from 'node:test';
import assert from 'node:assert/strict';
import {validateSignup,validateConfig,submitSignup} from '../public/signup.mjs';
const config = {supabaseUrl:'https://example.supabase.co',supabaseKey:'sb_publishable_TEST_ONLY'};
const data = {nombre:' Ejemplo ',correo:'EJEMPLO@example.com',perfil_empresa:'Profesional independiente',necesidad:'inventario',interes:'probar beta',consentimiento:true};
test('inserta los seis campos correctos sin solicitar SELECT',async () => {
  let options;
  const result = await submitSignup(config,data,async (url,input) => {assert.equal(url,'https://example.supabase.co/rest/v1/beta_signups');options=input;return {status:201};});
  assert.equal(result,true);assert.equal(options.method,'POST');assert.equal(options.headers.Prefer,'return=minimal');assert.equal(options.headers.Authorization,undefined);
  assert.deepEqual(JSON.parse(options.body),{...data,nombre:'Ejemplo',correo:'ejemplo@example.com'});
});
test('acepta confirmación 204',async () => {assert.equal(await submitSignup(config,data,async()=>({status:204})),true);});
test('rechaza respuestas fallidas y respuestas 200 ambiguas',async () => {
  for (const status of [200,400,401,403,409,429,500]) await assert.rejects(submitSignup(config,data,async()=>({status})),Error);
});
test('fallo de red no se presenta como éxito',async () => {await assert.rejects(submitSignup(config,data,async()=>{throw new TypeError('network');}),/no pudimos confirmar/);});
test('validación evita enviar payload inválido',async () => {
  for (const changes of [{nombre:' '},{correo:'mal'},{perfil_empresa:' '},{consentimiento:false},{necesidad:'inválida'},{interes:'inválido'}]) {
    let called=false;await assert.rejects(submitSignup(config,{...data,...changes},async()=>{called=true;return {status:201};}));assert.equal(called,false);
  }
});
test('rechaza claves secret y service_role y URL inválida', () => {
  const serviceKey = 'eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.test';
  for (const changes of [{supabaseKey:'sb_secret_foo'},{supabaseKey:serviceKey},{supabaseKey:''},{supabaseUrl:'http://example.com'},{supabaseUrl:'https://user:pass@example.com'},{supabaseUrl:'https://example.com/rest/v1'}]) assert.throws(()=>validateConfig({...config,...changes}));
});
test('acepta anon heredada y usa Authorization Bearer',async () => {
  const key = 'eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({role:'anon'})).toString('base64url')+'.test';
  await submitSignup({...config,supabaseKey:key},data,async(_,options)=>{assert.equal(options.headers.Authorization,`Bearer ${key}`);return {status:201};});
});
test('conserva únicamente campos de inscripción',()=>{assert.equal(validateSignup({...data,id:'otro',fecha_inscripcion:'ayer'}).id,undefined);});
