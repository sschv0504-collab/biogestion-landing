import { submitSignup } from './signup.mjs';
const equipment = [
  {id:'BIO-001',name:'Monitor multiparámetro',area:'UCI',state:'Operativo',model:'Monitor M-01 (ficticio)',date:'15 de octubre de 2026'},
  {id:'BIO-002',name:'Bomba de infusión',area:'Hospitalización',state:'Operativo',model:'Bomba I-02 (ficticio)',date:'18 de octubre de 2026'},
  {id:'BIO-003',name:'Desfibrilador',area:'Emergencias',state:'En mantenimiento',model:'Desfibrilador D-03 (ficticio)',date:'08 de octubre de 2026 · vencido'},
  {id:'BIO-004',name:'Electrocardiógrafo',area:'Consulta externa',state:'Operativo',model:'ECG E-04 (ficticio)',date:'22 de octubre de 2026'},
  {id:'BIO-005',name:'Ventilador mecánico',area:'UCI',state:'Operativo',model:'Ventilador V-05 (ficticio)',date:'03 de noviembre de 2026'},
  {id:'BIO-006',name:'Autoclave',area:'Esterilización',state:'En mantenimiento',model:'Autoclave A-06 (ficticio)',date:'28 de octubre de 2026'},
  {id:'BIO-007',name:'Ecógrafo',area:'Diagnóstico',state:'Operativo',model:'Ecógrafo E-07 (ficticio)',date:'05 de noviembre de 2026'},
  {id:'BIO-008',name:'Oxímetro de pulso',area:'Emergencias',state:'Operativo',model:'Oxímetro O-08 (ficticio)',date:'10 de noviembre de 2026'},
  {id:'BIO-009',name:'Centrífuga',area:'Laboratorio',state:'Fuera de servicio',model:'Centrífuga C-09 (ficticio)',date:'Pendiente de reprogramación'},
  {id:'BIO-010',name:'Aspirador quirúrgico',area:'Quirófano',state:'Operativo',model:'Aspirador A-10 (ficticio)',date:'12 de noviembre de 2026'},
  {id:'BIO-011',name:'Incubadora neonatal',area:'Neonatología',state:'Operativo',model:'Incubadora I-11 (ficticio)',date:'16 de noviembre de 2026'},
  {id:'BIO-012',name:'Lámpara quirúrgica',area:'Quirófano',state:'Operativo',model:'Lámpara L-12 (ficticio)',date:'20 de noviembre de 2026'}
];
let currentEquipment = equipment[0];
const tabs = [...document.querySelectorAll('[role="tab"]')];
function showView(name, focus = false) {
  tabs.forEach(tab => { const active = tab.dataset.view === name; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
  document.querySelectorAll('[role="tabpanel"]').forEach(panel => { panel.hidden = panel.id !== `view-${name}`; });
  if (focus) document.getElementById(`view-${name}`).focus({preventScroll:true});
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showView(tab.dataset.view));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); tabs[next].focus(); showView(tabs[next].dataset.view); }
  });
});
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showView(button.dataset.go, true)));
function renderDetail() {
  document.getElementById('detail-name').textContent = currentEquipment.name;
  const detail = document.getElementById('detail-data');
  detail.replaceChildren();
  [['Código',currentEquipment.id],['Ubicación',currentEquipment.area],['Estado',currentEquipment.state],['Modelo',currentEquipment.model],['Próximo mantenimiento',currentEquipment.date],['Origen de los datos','Ejemplo ficticio']].forEach(([label,value]) => {
    const dl = document.createElement('dl'); const dt = document.createElement('dt'); const dd = document.createElement('dd');
    dt.textContent = label; dd.textContent = value; dl.append(dt,dd); detail.append(dl);
  });
  document.getElementById('history-title').textContent = `${currentEquipment.id} · ${currentEquipment.name} · historial ficticio`;
  const history = document.getElementById('history-list'); history.replaceChildren();
  [['10 de septiembre de 2026','Mantenimiento preventivo','Revisión visual y verificación de funcionamiento registradas en este ejemplo.'],['10 de junio de 2026','Inspección técnica','Ficha inicial y estado documentados con fines ilustrativos.']].forEach(([date,title,description]) => {
    const article = document.createElement('article'); article.className = 'history-card';
    const heading = document.createElement('h4'); heading.textContent = title;
    const small = document.createElement('small'); small.textContent = `${date} · Técnico de ejemplo`;
    const p = document.createElement('p'); p.textContent = description;
    article.append(heading,small,p); history.append(article);
  });
}
function openEquipment(id) { currentEquipment = equipment.find(item => item.id === id) || equipment[0]; renderDetail(); showView('detail', true); }
document.querySelectorAll('[data-open-equipment]').forEach(button => button.addEventListener('click', () => openEquipment(button.dataset.openEquipment)));
function renderInventory(query = '') {
  const normalized = query.trim().toLocaleLowerCase('es');
  const visible = equipment.filter(item => `${item.id} ${item.name}`.toLocaleLowerCase('es').includes(normalized));
  const tbody = document.getElementById('equipment-rows'); tbody.replaceChildren();
  visible.forEach(item => {
    const row = document.createElement('tr'); const name = document.createElement('td'); name.textContent = item.id;
    const small = document.createElement('small'); small.textContent = item.name; name.append(small);
    const area = document.createElement('td'); area.textContent = item.area;
    const state = document.createElement('td'); const pill = document.createElement('span'); pill.className = `status${item.state === 'Operativo' ? '' : ' attention'}`; pill.textContent = item.state; state.append(pill);
    const action = document.createElement('td'); const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Ver ficha ↗'; button.setAttribute('aria-label', `Ver ficha de ${item.name}, ${item.id}`); button.addEventListener('click', () => openEquipment(item.id)); action.append(button);
    row.append(name,area,state,action); tbody.append(row);
  });
  document.getElementById('search-result').textContent = visible.length ? `${visible.length} de ${equipment.length} equipos ficticios.` : 'No hay equipos de ejemplo que coincidan con la búsqueda.';
}
document.getElementById('equipment-search').addEventListener('input', event => renderInventory(event.target.value));
renderInventory(); renderDetail();
const dialog = document.getElementById('privacy-dialog');
document.querySelectorAll('[data-privacy]').forEach(button => button.addEventListener('click', () => dialog.showModal()));
document.getElementById('privacy-close').addEventListener('click', () => dialog.close());
document.getElementById('privacy-done').addEventListener('click', () => dialog.close());
const form = document.getElementById('signup-form'); const status = document.getElementById('form-status'); const submit = document.getElementById('submit-button');
const idleButton = submit.innerHTML; let busy = false;
form.addEventListener('submit', async event => {
  event.preventDefault(); if (busy || !form.reportValidity()) return;
  busy = true; submit.disabled = true; form.setAttribute('aria-busy', 'true'); submit.textContent = 'Enviando…'; status.dataset.state = 'pending'; status.textContent = 'Estamos guardando tu inscripción.';
  const data = new FormData(form);
  try {
    await submitSignup(window.BIOGESTION_CONFIG, { nombre:data.get('nombre'), correo:String(data.get('correo')).trim(), perfil_empresa:data.get('perfil_empresa'), necesidad:data.get('necesidad'), interes:data.get('interes'), consentimiento:document.getElementById('consentimiento').checked });
    status.dataset.state = 'success'; status.textContent = '¡Tu inscripción quedó registrada! El equipo podrá contactarte sobre la beta y el interés que seleccionaste.'; form.reset();
  } catch (error) { status.dataset.state = 'error'; status.textContent = error.message; }
  finally { busy = false; submit.disabled = false; submit.innerHTML = idleButton; form.removeAttribute('aria-busy'); status.focus({preventScroll:true}); }
});
