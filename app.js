// ============================================
// JARVIS APP — LÓGICA PRINCIPAL v2
// ============================================

const todayKey = () => new Date().toISOString().split('T')[0];

function loadState() {
  const saved = localStorage.getItem('jarvis_state_' + todayKey());
  const expenses = JSON.parse(localStorage.getItem('jarvis_expenses') || '[]');
  if (saved) {
    const parsed = JSON.parse(saved);
    parsed.expenses = expenses;
    return parsed;
  }
  return {
    tasks: DAILY_TASKS_TEMPLATE.map(t => ({...t, done: false})),
    waterGlasses: 0,
    expenses: expenses,
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

// ============== HISTORIAL PARA GRÁFICAS ==============

function saveHistorySnapshot() {
  const history = JSON.parse(localStorage.getItem('jarvis_history') || '{}');
  const doneCount = state.tasks.filter(t => t.done).length;
  const pct = Math.round((doneCount / state.tasks.length) * 100);
  history[todayKey()] = {
    productivity: pct,
    water: state.waterGlasses,
    date: todayKey()
  };
  localStorage.setItem('jarvis_history', JSON.stringify(history));
}

function getLast7Days() {
  const history = JSON.parse(localStorage.getItem('jarvis_history') || '{}');
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
    days.push({
      key,
      label: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
      productivity: history[key] ? history[key].productivity : (key === todayKey() ? Math.round((state.tasks.filter(t=>t.done).length/state.tasks.length)*100) : null),
      water: history[key] ? history[key].water : (key === todayKey() ? state.waterGlasses : null)
    });
  }
  return days;
}

function getExpensesByWeek() {
  const weeks = {};
  state.expenses.forEach(e => {
    const d = new Date(e.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const wk = weekStart.toISOString().split('T')[0];
    weeks[wk] = (weeks[wk] || 0) + e.amount;
  });
  return weeks;
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
  if (name === 'progreso') renderProgreso();
  if (name === 'jarvis') renderJarvisChat();
}

// ============== PROGRESO (GRÁFICAS) ==============

let chartProductivity, chartWater, chartBody;

function chartTheme() {
  return {
    grid: 'rgba(255,255,255,0.06)',
    text: '#9BA39D',
    font: { family: "'JetBrains Mono', monospace", size: 10 }
  };
}

function renderProgreso() {
  const days = getLast7Days();
  const avgProd = Math.round(days.filter(d=>d.productivity!==null).reduce((s,d)=>s+d.productivity,0) / Math.max(1,days.filter(d=>d.productivity!==null).length));
  const totalWaterWeek = days.reduce((s,d)=>s+(d.water||0),0);
  const weeks = getExpensesByWeek();
  const weekKeys = Object.keys(weeks).sort();
  const lastWeeksSpend = weekKeys.slice(-4);

  document.getElementById('progreso-content').innerHTML = `
    <div class="eyebrow">Evolución y progreso</div>

    <div class="card">
      <div class="ct"><i class="ti ti-trending-up" aria-hidden="true"></i> Productividad — últimos 7 días</div>
      <div class="chart-wrap"><canvas id="chart-productivity"></canvas></div>
      <div class="stat-strip">
        <div class="stat-strip-item"><div class="stat-strip-val" style="color:#2ED679">${avgProd}%</div><div class="stat-strip-label">Promedio</div></div>
        <div class="stat-strip-item"><div class="stat-strip-val">${days.filter(d=>d.productivity!==null).length}</div><div class="stat-strip-label">Días activos</div></div>
      </div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-droplet" aria-hidden="true"></i> Hidratación — últimos 7 días</div>
      <div class="chart-wrap"><canvas id="chart-water"></canvas></div>
      <div class="stat-strip">
        <div class="stat-strip-item"><div class="stat-strip-val" style="color:#4DA3E0">${(totalWaterWeek*0.35).toFixed(1)}L</div><div class="stat-strip-label">Total semana</div></div>
        <div class="stat-strip-item"><div class="stat-strip-val">2.8L</div><div class="stat-strip-label">Meta diaria</div></div>
      </div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-body-scan" aria-hidden="true"></i> Composición corporal</div>
      <div class="chart-wrap"><canvas id="chart-body"></canvas></div>
      <div class="ms" style="margin-top:8px">Última medición: 8 mayo 2026. Actualice cuando tenga nuevos datos de balanza.</div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-coin" aria-hidden="true"></i> Gastos por semana</div>
      ${lastWeeksSpend.length === 0 ? '<div class="ms">Aún no hay suficientes datos de gastos registrados</div>' : `<div class="chart-wrap" style="height:160px"><canvas id="chart-expenses"></canvas></div>`}
    </div>
  `;

  renderProductivityChart(days);
  renderWaterChart(days);
  renderBodyChart();
  if (lastWeeksSpend.length > 0) renderExpensesChart(lastWeeksSpend, weeks);
}

function renderProductivityChart(days) {
  const ctx = document.getElementById('chart-productivity');
  if (chartProductivity) chartProductivity.destroy();
  const theme = chartTheme();
  chartProductivity = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days.map(d => d.label),
      datasets: [{
        data: days.map(d => d.productivity),
        borderColor: '#2ED679',
        backgroundColor: 'rgba(46,214,121,0.1)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#2ED679',
        pointBorderColor: '#0B0D0C',
        pointBorderWidth: 2,
        spanGaps: true
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, grid: { color: theme.grid }, ticks: { color: theme.text, font: theme.font, stepSize: 25 } },
        x: { grid: { display: false }, ticks: { color: theme.text, font: theme.font } }
      }
    }
  });
}

function renderWaterChart(days) {
  const ctx = document.getElementById('chart-water');
  if (chartWater) chartWater.destroy();
  const theme = chartTheme();
  chartWater = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days.map(d => d.label),
      datasets: [{
        data: days.map(d => d.water ? +(d.water*0.35).toFixed(1) : 0),
        backgroundColor: days.map(d => (d.water||0) >= 8 ? '#2ED679' : '#4DA3E0'),
        borderRadius: 4,
        maxBarThickness: 28
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 3, grid: { color: theme.grid }, ticks: { color: theme.text, font: theme.font, callback: v => v+'L' } },
        x: { grid: { display: false }, ticks: { color: theme.text, font: theme.font } }
      }
    }
  });
}

function renderBodyChart() {
  const ctx = document.getElementById('chart-body');
  if (chartBody) chartBody.destroy();
  const theme = chartTheme();
  chartBody = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Grasa actual', 'Grasa meta', 'Músculo actual', 'Músculo meta'],
      datasets: [{
        data: [USER_PROFILE.bodyFat, USER_PROFILE.goals.bodyFatTarget, USER_PROFILE.muscleMass, USER_PROFILE.goals.muscleMassTarget],
        backgroundColor: ['#F0A23D', 'rgba(240,162,61,0.25)', '#2ED679', 'rgba(46,214,121,0.25)'],
        borderRadius: 4,
        maxBarThickness: 36
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: theme.grid }, ticks: { color: theme.text, font: theme.font } },
        y: { grid: { display: false }, ticks: { color: theme.text, font: theme.font } }
      }
    }
  });
}

function renderExpensesChart(weekKeys, weeks) {
  const ctx = document.getElementById('chart-expenses');
  const theme = chartTheme();
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weekKeys.map(k => { const d = new Date(k); return d.getDate()+'/'+(d.getMonth()+1); }),
      datasets: [{
        data: weekKeys.map(k => weeks[k]),
        backgroundColor: '#A78BFA',
        borderRadius: 4,
        maxBarThickness: 32
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: theme.grid }, ticks: { color: theme.text, font: theme.font, callback: v => '$'+v } },
        x: { grid: { display: false }, ticks: { color: theme.text, font: theme.font } }
      }
    }
  });
}

// ============== ANILLO DE PROGRESO ==============

function scoreRing(pct, size) {
  size = size || 120;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = pct >= 80 ? '#2ED679' : pct >= 50 ? '#F0A23D' : '#E05C5C';
  return `
    <div class="ring-wrap">
      <svg class="ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${stroke}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
          stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"
          style="transition:stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)"/>
        <text x="${size/2}" y="${size/2}" transform="rotate(90 ${size/2} ${size/2})"
          text-anchor="middle" dominant-baseline="middle"
          class="ring-label" font-size="${size*0.24}" font-weight="600" fill="${color}">${pct}%</text>
      </svg>
    </div>
  `;
}

// ============== HOY ==============

function renderHoy() {
  const doneCount = state.tasks.filter(t => t.done).length;
  const pct = Math.round((doneCount / state.tasks.length) * 100);
  const waterPct = Math.min(100, Math.round((state.waterGlasses / 8) * 100));
  const waterLiters = (state.waterGlasses * 0.35).toFixed(1);

  document.getElementById('hoy-content').innerHTML = `
    <div class="eyebrow">Estado del día</div>
    <div class="card" style="text-align:center">
      <div class="ct" style="justify-content:center"><i class="ti ti-target" aria-hidden="true"></i> Productividad de hoy</div>
      ${scoreRing(pct)}
      <div class="ms" style="margin-top:6px">${doneCount} de ${state.tasks.length} tareas completadas</div>
    </div>

    <div class="g2">
      <div class="mc"><div class="ml"><i class="ti ti-droplet" aria-hidden="true"></i> Agua</div><div class="mv">${waterLiters}<span style="font-size:13px;color:var(--ink-faint)">/2.8L</span></div><div class="ms">meta diaria</div></div>
      <div class="mc"><div class="ml"><i class="ti ti-flame" aria-hidden="true"></i> Calorías</div><div class="mv">2,400</div><div class="ms">kcal recomp.</div></div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-droplet" aria-hidden="true"></i> Hidratación</div>
      <div class="water-controls">
        <button class="wbtn" onclick="adjWater(-1)" aria-label="quitar vaso">−</button>
        <div><div class="wdisp">${state.waterGlasses}</div><div class="wsub">vasos · 350ml</div></div>
        <button class="wbtn" onclick="adjWater(1)" aria-label="agregar vaso">+</button>
      </div>
      <div class="pb"><div class="pf" style="width:${waterPct}%;background:#4DA3E0"></div></div>
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
        ${t.done?'<i class="ti ti-check" style="font-size:13px;color:#0B0D0C" aria-hidden="true"></i>':''}
      </div>
      <div>
        <div class="tt ${t.done?'done':''}">${t.text}</div>
        <span class="badge ${colors[t.category]||'bg-blue'}" style="margin-top:5px">${t.category}</span>
      </div>
    </div>
  `).join('');
}

function toggleTask(i) {
  state.tasks[i].done = !state.tasks[i].done;
  saveState();
  saveHistorySnapshot();
  renderHoy();
}

function adjWater(delta) {
  state.waterGlasses = Math.max(0, Math.min(12, state.waterGlasses + delta));
  saveState();
  saveHistorySnapshot();
  renderHoy();
}

// ============== ENTRENO ==============

function renderEntreno() {
  const days = [TRAINING_PLAN.day1, TRAINING_PLAN.day2, TRAINING_PLAN.day3, TRAINING_PLAN.day4];
  let html = `
    <div class="eyebrow">Plan de entrenamiento</div>
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

  let cycleTrack = '';
  for (let i = 1; i <= 4; i++) {
    cycleTrack += `<div class="cycle-dot ${i < cycleMonth ? 'filled' : i === cycleMonth ? 'current' : ''}"></div>`;
  }

  document.getElementById('finanzas-content').innerHTML = `
    <div class="eyebrow">Control financiero</div>
    <div class="g2">
      <div class="mc"><div class="ml"><i class="ti ti-wallet" aria-hidden="true"></i> Ingreso</div><div class="mv">$${FINANCE_PROFILE.monthlyIncome}</div><div class="ms">mensual fijo</div></div>
      <div class="mc"><div class="ml"><i class="ti ti-calendar" aria-hidden="true"></i> Ciclo</div><div class="mv">${cycleMonth}<span style="font-size:13px;color:var(--ink-faint)">/4</span></div><div class="ms">${isPeakMonth?'mes pico':'mes normal'}</div></div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-progress" aria-hidden="true"></i> Ciclo de deuda con primo</div>
      <div class="cycle-track">${cycleTrack}</div>
      <div class="ms">Termina 11/10/2026 · $50/mes</div>
    </div>

    <div class="g2">
      <div class="mc"><div class="ml">Gastos fijos</div><div class="mv">$${fixedTotal}</div><div class="ms">comprometido</div></div>
      <div class="mc"><div class="ml">Buffer libre</div><div class="mv" style="color:${buffer>=0?'#2ED679':'#E05C5C'}">$${buffer}</div><div class="ms">disponible</div></div>
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
      <div class="ct"><i class="ti ti-history" aria-hidden="true"></i> Gastos de este mes — $${spentThisMonth}</div>
      <div id="expense-list">${renderExpenseList(monthExpenses)}</div>
    </div>
  `;
}

function renderExpenseList(expenses) {
  if (expenses.length === 0) return '<div style="font-size:12px;color:var(--ink-faint)">Sin gastos registrados aún este mes</div>';
  return expenses.map((e) => `
    <div class="expense-item">
      <span>${e.name}</span>
      <span style="display:flex;align-items:center;gap:10px">
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
    <div class="eyebrow">Hábitos y suplementación</div>
    <div class="card">
      <div class="ct"><i class="ti ti-moon" aria-hidden="true"></i> Sueño</div>
      <div class="dr"><span>Meta diaria</span><strong>7-8 horas</strong></div>
      <div class="dr"><span>Hora de dormir</span><strong>22:30</strong></div>
      <div class="dr"><span>Hora de despertar</span><strong>06:30</strong></div>
      <div class="dr"><span>Protocolo cervical</span><strong>Almohada media</strong></div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-book" aria-hidden="true"></i> Lectura</div>
      <div class="dr"><span>Meta diaria</span><strong>15-20 min</strong></div>
      <div class="dr"><span>Formato</span><strong>Sesiones cortas — TDA</strong></div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-device-mobile" aria-hidden="true"></i> Redes sociales</div>
      <div class="dr"><span>Enfoque</span><strong>Productividad &gt; límite fijo</strong></div>
      <div class="ms" style="margin-top:10px">Jarvis ajusta el límite recomendado según tu reporte diario de productividad.</div>
    </div>

    <div class="card">
      <div class="ct"><i class="ti ti-pill" aria-hidden="true"></i> Suplementación recomendada</div>
      ${USER_PROFILE.supplementsRecommended.map(s => `
        <div class="dr"><span>${s.name}</span><span class="badge ${s.priority===1?'bg-green':s.priority===2?'bg-blue':'bg-amber'}">P${s.priority}</span></div>
      `).join('')}
      <div class="ms" style="margin-top:10px">Prioridad según evidencia y tus necesidades específicas — no suplementos genéricos.</div>
    </div>
  `;
}

// ============== JARVIS CHAT ==============

function renderJarvisChat() {
  document.getElementById('jarvis-content').innerHTML = `
    <div class="eyebrow">Mentor IA</div>
    <div class="ai-box">
      <div class="ai-tag">Jarvis</div>
      <div class="ai-msg" id="jarvis-msg">Buen día, Sr. Sotomayor. Tengo su perfil completo cargado — físico, finanzas, entrenamiento y hábitos. Pregúnteme lo que necesite.</div>
    </div>
    <div class="ai-row">
      <input type="text" id="jarvis-input" placeholder="Escribile a Jarvis..." onkeydown="if(event.key==='Enter')askJarvis()">
      <button onclick="askJarvis()">Enviar</button>
    </div>
    <div style="margin-top:14px">
      <button class="qbtn" onclick="quickAskJarvis('Cómo voy con mis finanzas este mes?')">Finanzas</button>
      <button class="qbtn" onclick="quickAskJarvis('Hoy tengo dolor cervical, ajusta mi plan de hoy')">Dolor cervical</button>
      <button class="qbtn" onclick="quickAskJarvis('Dame consejos para dormir mejor')">Sueño</button>
      <button class="qbtn" onclick="quickAskJarvis('Qué leo hoy para mejorar mi concentración?')">Qué leer</button>
    </div>
  `;
}

async function askJarvis() {
  const input = document.getElementById('jarvis-input');
  const q = input.value.trim();
  if (!q) return;
  input.value = '';
  const box = document.getElementById('jarvis-msg');
  box.textContent = 'Procesando...';

  const currentState = {
    tasksCompleted: state.tasks.filter(t=>t.done).length,
    totalTasks: state.tasks.length,
    waterGlasses: state.waterGlasses,
    cycleMonth: getCurrentCycleMonth()
  };

  try {
    const res = await fetch('/.netlify/functions/jarvis-chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        system: buildJarvisSystemPrompt(currentState),
        messages: [{role: 'user', content: q}]
      })
    });
    const data = await res.json();
    if (data.error) {
      box.textContent = 'Error: ' + data.error;
      return;
    }
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
  document.getElementById('greeting').innerHTML = '<strong>Sr. Sotomayor</strong>' + greet;
}

updateGreeting();
renderHoy();
saveHistorySnapshot();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
