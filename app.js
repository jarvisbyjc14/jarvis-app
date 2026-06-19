// ============================================
// JARVIS APP — LÓGICA PRINCIPAL
// ============================================

const todayKey = () => new Date().toISOString().split('T')[0];

function loadState() {
  const saved = localStorage.getItem('jarvis_state_' + todayKey());
  if (saved) return JSON.parse(saved);
  return {
    tasks: DAILY_TASKS_TEMPLATE.map(t => ({...t, done: false})),
    waterGlasses: 0,
    expenses: JSON.parse(localStorage.getItem('jarvis_expenses') || '[]'),
    chatHistory: []
  };
}

function saveState() {
  localStorage.setItem('jarvis_state_' + todayKey(), JSON.stringify({
    tasks: state.tasks,
    waterGlasses: state.waterGlasses,
    chatHistory: state.chatHistory
  }));
}

function saveExpenses() {
  localStorage.setItem('jarvis_expenses', JSON.stringify(state.expenses));
}

let state = loadState();

function switchSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-' + name).classList.add('active');
  document.querySelector('.nav-item[data-sec="' + name + '"]').classList.add('active');
  renderSection(name);
}

function renderSection(name) {
  if (name === 'hoy') renderHoy();
  if (name === 'entreno') renderEntreno();
  if (name === 'finanzas') renderFinanzas();
  if (name === 'habitos') renderHabitos();
  if (name === 'jarvis') renderJarvisChat();
}

// ============== HOY ==============

function renderHoy() {
  const doneCount = state.tasks.filter(t => t.done).length;
  const pct = Math.round((doneCount / state.tasks.length) * 100);
  const waterPct = Math.min(100, Math.round((state.waterGlasses / 8) * 100));
  const waterLiters = (state.waterGlasses * 0.35).toFixed(1);

  document.getElementById('hoy-content').innerHTML = `
    <div class="card" style="text-align:center">
      <div class="ct" style="justify-content:center"><i class="ti ti-target" aria-hidden="true"></i> Productividad de hoy</div>
      <div style="font-size:40px;font-weight:700;color:${pct>=80?'#27500A':pct>=50?'#633806':'#791F1F'}">${pct}%</div>
      <div class="ms" style="margin-top:4px">${doneCount} de ${state.tasks.length} tareas completadas</div>
      <div class="pb" style="margin-top:10px"><div class="pf" style="width:${pct}%;background:${pct>=80?'#639922':pct>=50?'#EF9F27':'#E24B4A'}"></div></div>
    </div>

    <div class="g2">
      <div class="mc"><div class="ml"><i class="ti ti-droplet" aria-hidden="true"></i> Agua</div><div class="mv">${waterLiters}/2.8L</div><div class="ms">meta diaria</div></div>
      <div class="mc"><div class="ml"><i class="ti ti-flame" aria-hidden="true"></i> Calorías meta</div><div class="mv">2,400</div><div class="ms">kcal recomp.</div></div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-droplet" aria-hidden="true"></i> Hidratación</div>
      <div class="water-controls">
        <button class="wbtn" onclick="adjWater(-1)" aria-label="quitar vaso">−</button>
        <div><div class="wdisp">${state.waterGlasses}</div><div class="wsub">vasos · 350ml c/u</div></div>
        <button class="wbtn" onclick="adjWater(1)" aria-label="agregar vaso">+</button>
      </div>
      <div class="pb"><div class="pf" style="width:${waterPct}%;background:#378ADD"></div></div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-checklist" aria-hidden="true"></i> Checklist del día</div>
      <div id="task-list"></div>
    </div>
  `;
  renderTaskList();
}

function renderTaskList() {
  const colors = {cervical:'bg-coral', hidratación:'bg-blue', nutrición:'bg-green', entreno:'bg-amber', hábitos:'bg-purple', finanzas:'bg-blue', descanso:'bg-purple'};
  document.getElementById('task-list').innerHTML = state.tasks.map((t, i) => `
    <div class="task-item">
      <div class="tck ${t.done?'done':''}" onclick="toggleTask(${i})" role="checkbox" aria-checked="${t.done}" tabindex="0">
        ${t.done?'<i class="ti ti-check" style="font-size:13px;color:white" aria-hidden="true"></i>':''}
      </div>
      <div>
        <div class="tt ${t.done?'done':''}">${t.text}</div>
        <span class="badge ${colors[t.category]||'bg-blue'}" style="margin-top:4px">${t.category}</span>
      </div>
    </div>
  `).join('');
}

function toggleTask(i) {
  state.tasks[i].done = !state.tasks[i].done;
  saveState();
  renderHoy();
}

function adjWater(delta) {
  state.waterGlasses = Math.max(0, Math.min(12, state.waterGlasses + delta));
  saveState();
  renderHoy();
}

// ============== ENTRENO ==============

function renderEntreno() {
  const days = [TRAINING_PLAN.day1, TRAINING_PLAN.day2, TRAINING_PLAN.day3, TRAINING_PLAN.day4];
  let html = `
    <div class="warn-box">
      <div class="warn-title"><i class="ti ti-alert-triangle" aria-hidden="true"></i> Prohibidos — cervical y escoliosis</div>
      ${USER_PROFILE.forbiddenExercises.map(e => `<div class="warn-item">${e}</div>`).join('')}
    </div>
  `;
  days.forEach(d => {
    html += `
      <div class="card">
        <div class="ct"><i class="ti ti-barbell" aria-hidden="true"></i> ${d.day} — ${d.title}</div>
        ${d.exercises.map(ex => `
          <div class="exer-block">
            <div class="exer-name">${ex.name}</div>
            <div class="exer-detail">${ex.detail}</div>
            <div class="exer-why">${ex.why}</div>
          </div>
        `).join('')}
      </div>
    `;
  });
  document.getElementById('entreno-content').innerHTML = html;
}

// ============== FINANZAS ==============

function getCurrentCycleMonth() {
  const start = new Date(FINANCE_PROFILE.cycleStartDate);
  const now = new Date();
  const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
  return Math.max(1, Math.min(4, monthsDiff));
}

function renderFinanzas() {
  const cycleMonth = getCurrentCycleMonth();
  const isPeakMonth = cycleMonth === 3;
  const uniCost = isPeakMonth ? 201 : 151;
  const fixedTotal = 25 + 16 + uniCost + 12 + 50;
  const savingsTarget = isPeakMonth ? 30 : 50;
  const remaining = FINANCE_PROFILE.monthlyIncome - fixedTotal - FINANCE_PROFILE.budgetFood - savingsTarget;

  const monthExpenses = state.expenses.filter(e => e.month === todayKey().slice(0,7));
  const spentThisMonth = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const buffer = remaining - spentThisMonth;

  document.getElementById('finanzas-content').innerHTML = `
    <div class="g2">
      <div class="mc"><div class="ml">Ingreso mensual</div><div class="mv">$${FINANCE_PROFILE.monthlyIncome}</div><div class="ms">fijo</div></div>
      <div class="mc"><div class="ml">Mes del ciclo</div><div class="mv">${cycleMonth}/4</div><div class="ms">${isPeakMonth?'Mes pico universidad':'Mes normal'}</div></div>
      <div class="mc"><div class="ml">Gastos fijos</div><div class="mv">$${fixedTotal}</div><div class="ms">comprometido</div></div>
      <div class="mc"><div class="ml">Buffer libre</div><div class="mv" style="color:${buffer>=0?'#27500A':'#791F1F'}">$${buffer}</div><div class="ms">disponible</div></div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-list" aria-hidden="true"></i> Gastos fijos este mes</div>
      <div class="dr"><span>Agua</span><strong>$25</strong></div>
      <div class="dr"><span>Línea telefónica</span><strong>$16</strong></div>
      <div class="dr"><span>Universidad</span><strong>$${uniCost} ${isPeakMonth?'(pico)':''}</strong></div>
      <div class="dr"><span>YouTube Premium</span><strong>$12</strong></div>
      <div class="dr"><span>Pago a primo</span><strong>$50</strong></div>
      <div class="dr"><span>Comida e insumos</span><strong>$${FINANCE_PROFILE.budgetFood}</strong></div>
      <div class="dr"><span>Meta de ahorro</span><strong>$${savingsTarget}</strong></div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-receipt" aria-hidden="true"></i> Registrar gasto</div>
      <div class="input-row">
        <input type="text" id="exp-name" placeholder="¿En qué gastaste?">
        <input type="number" id="exp-amount" placeholder="$" style="max-width:80px">
      </div>
      <button class="btn-primary" style="width:100%" onclick="addExpense()">Agregar gasto</button>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-history" aria-hidden="true"></i> Gastos de este mes ($${spentThisMonth})</div>
      <div id="expense-list">${renderExpenseList(monthExpenses)}</div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-credit-card" aria-hidden="true"></i> Deuda con primo</div>
      <div class="dr"><span>Total de la deuda</span><strong>$200</strong></div>
      <div class="dr"><span>Cuota mensual</span><strong>$50</strong></div>
      <div class="dr"><span>Termina</span><strong>11/10/2026</strong></div>
    </div>
  `;
}

function renderExpenseList(expenses) {
  if (expenses.length === 0) return '<div style="font-size:12px;color:var(--text-tertiary)">Sin gastos registrados aún este mes</div>';
  return expenses.map((e, i) => `
    <div class="expense-item">
      <span>${e.name}</span>
      <span style="display:flex;align-items:center;gap:8px">
        <strong>$${e.amount}</strong>
        <span class="expense-del" onclick="deleteExpense('${e.id}')">✕</span>
      </span>
    </div>
  `).join('');
}

function addExpense() {
  const name = document.getElementById('exp-name').value.trim();
  const amount = parseFloat(document.getElementById('exp-amount').value);
  if (!name || !amount || amount <= 0) return;
  state.expenses.push({
    id: Date.now().toString(),
    name, amount,
    month: todayKey().slice(0,7),
    date: todayKey()
  });
  saveExpenses();
  renderFinanzas();
}

function deleteExpense(id) {
  state.expenses = state.expenses.filter(e => e.id !== id);
  saveExpenses();
  renderFinanzas();
}

// ============== HABITOS ==============

function renderHabitos() {
  document.getElementById('habitos-content').innerHTML = `
    <div class="card">
      <div class="ct"><i class="ti ti-moon" aria-hidden="true"></i> Sueño</div>
      <div class="dr"><span>Meta diaria</span><strong>7-8 horas</strong></div>
      <div class="dr"><span>Hora de dormir</span><strong>22:30</strong></div>
      <div class="dr"><span>Hora de despertar</span><strong>06:30</strong></div>
      <div class="dr"><span>Protocolo cervical</span><strong>Almohada media · nunca boca abajo</strong></div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-book" aria-hidden="true"></i> Lectura</div>
      <div class="dr"><span>Meta diaria</span><strong>15-20 min</strong></div>
      <div class="dr"><span>Nota</span><strong>Sesiones cortas — TDA</strong></div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-device-mobile" aria-hidden="true"></i> Redes sociales</div>
      <div class="dr"><span>Enfoque</span><strong>Productividad sobre límite fijo</strong></div>
      <div class="ms" style="margin-top:8px">Jarvis ajusta el límite recomendado según tu reporte diario de productividad.</div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-pill" aria-hidden="true"></i> Suplementación recomendada</div>
      ${USER_PROFILE.supplementsRecommended.map(s => `
        <div class="dr"><span>${s.name}</span><span class="badge ${s.priority===1?'bg-green':s.priority===2?'bg-blue':'bg-amber'}">P${s.priority}</span></div>
      `).join('')}
      <div class="ms" style="margin-top:8px">${FINANCE_PROFILE.philosophy ? '' : ''}Prioridad según evidencia y tus necesidades específicas, no suplementos genéricos.</div>
    </div>
  `;
}

// ============== JARVIS CHAT ==============

function renderJarvisChat() {
  document.getElementById('jarvis-content').innerHTML = `
    <div class="ai-box">
      <div class="ai-msg" id="jarvis-msg">Buen día, Sr. Sotomayor. Tengo su perfil completo cargado — físico, finanzas, entrenamiento y hábitos. Pregúnteme lo que necesite.</div>
    </div>
    <div class="ai-row">
      <input type="text" id="jarvis-input" placeholder="Escribile a Jarvis..." onkeydown="if(event.key==='Enter')askJarvis()">
      <button onclick="askJarvis()">Enviar</button>
    </div>
    <div style="margin-top:12px">
      <button class="qbtn" onclick="quickAskJarvis('Cómo voy con mis finanzas este mes?')">Cómo voy con finanzas</button>
      <button class="qbtn" onclick="quickAskJarvis('Hoy tengo dolor cervical, ajusta mi plan de hoy')">Dolor cervical hoy</button>
      <button class="qbtn" onclick="quickAskJarvis('Dame consejos para dormir mejor')">Consejos de sueño</button>
      <button class="qbtn" onclick="quickAskJarvis('Qué leo hoy para mejorar mi concentración?')">Qué leer hoy</button>
    </div>
  `;
}

async function askJarvis() {
  const input = document.getElementById('jarvis-input');
  const q = input.value.trim();
  if (!q) return;
  input.value = '';
  const box = document.getElementById('jarvis-msg');
  box.textContent = 'Pensando...';

  const currentState = {
    tasksCompleted: state.tasks.filter(t=>t.done).length,
    totalTasks: state.tasks.length,
    waterGlasses: state.waterGlasses,
    cycleMonth: getCurrentCycleMonth()
  };

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: buildJarvisSystemPrompt(currentState),
        messages: [{role: 'user', content: q}]
      })
    });
    const data = await res.json();
    box.textContent = data.content?.[0]?.text || 'No pude procesar eso, intentá de nuevo.';
  } catch(e) {
    box.textContent = 'Error de conexión. Revisá tu internet.';
  }
}

function quickAskJarvis(q) {
  document.getElementById('jarvis-input').value = q;
  askJarvis();
}

// ============== INIT ==============

function updateGreeting() {
  const hour = new Date().getHours();
  let greet = 'Hola';
  if (hour < 12) greet = 'Buenos días';
  else if (hour < 19) greet = 'Buenas tardes';
  else greet = 'Buenas noches';
  document.getElementById('greeting').textContent = greet + ', Sr. Sotomayor';
}

updateGreeting();
renderHoy();

// Registrar service worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
