// ============================================
// JARVIS — PERFIL DEL USUARIO
// Sr. Sotomayor — datos cargados el 19/06/2026
// ============================================

const USER_PROFILE = {
  name: "Sr. Sotomayor",
  age: 23,
  height: 169,
  weight: 75.1,
  bodyFat: 24.9,
  fatMass: 18.7,
  muscleMass: 52.6,
  muscleRate: 70.1,
  skeletalMuscle: 42.4,
  boneMass: 3.9,
  proteinMass: 11.3,
  bmi: 26.3,
  tdee: 2650,
  targetCalories: 2400,
  targetProtein: 151,
  targetCarbs: 240,
  targetFat: 67,
  targetWater: 2.8,
  conditions: ["Lesión cervical en recuperación", "Escoliosis"],
  goals: {
    bodyFatTarget: 17,
    muscleMassTarget: 56,
    weightTarget: 70
  },
  sleep: {
    targetHours: 7,
    idealHours: 8,
    bedtime: "22:30",
    wakeup: "06:30"
  },
  reading: {
    targetMinutes: 18,
    note: "Usuario con TDA — sesiones cortas funcionan mejor"
  },
  trainingDays: 4,
  forbiddenExercises: [
    "Press militar con barra",
    "Encogimientos de hombros con peso (shrugs)",
    "Sentadilla con barra en la espalda",
    "Good mornings con barra",
    "Remo con barra pesado inclinado",
    "Leg press con peso máximo"
  ],
  supplementsCurrent: [], // arranca desde cero
  supplementsRecommended: [
    {name:"Whey proteína", priority:1, reason:"Cubrir meta de 151g proteína/día"},
    {name:"Creatina monohidrato 5g", priority:1, reason:"Fuerza y recomposición corporal"},
    {name:"Omega 3 (2-3g EPA+DHA)", priority:2, reason:"Antiinflamatorio para lesión cervical"},
    {name:"Magnesio glicinato 200mg", priority:2, reason:"Sueño y recuperación muscular"},
    {name:"Colágeno tipo II", priority:3, reason:"Soporte articular para columna"},
    {name:"Vitamina D3 + K2", priority:3, reason:"Salud ósea, relevante por escoliosis"}
  ]
};

// ============================================
// FINANZAS — Ciclo de 4 meses, desde 11/06/2026
// ============================================

const FINANCE_PROFILE = {
  monthlyIncome: 515,
  cycleStartDate: "2026-06-11",
  debtToCousin: {
    totalOwed: 200,
    monthlyPayment: 50,
    monthsRemaining: 4,
    endDate: "2026-10-11"
  },
  fixedExpenses: [
    {name:"Agua", amount:25, recurring:true},
    {name:"Línea telefónica", amount:16, recurring:true},
    {name:"Universidad (mes normal)", amount:151, recurring:true, note:"Sube a 201 cada 3er mes del ciclo"},
    {name:"YouTube Premium", amount:12, recurring:true},
    {name:"Pago a primo", amount:50, recurring:true, endsAfterMonths:4}
  ],
  budgetFood: 160,
  savingsTarget: {
    normalMonth: 50,
    universityPeakMonth: 30
  },
  antExpensePatterns: [
    {name:"Salidas con enamorada", typicalAmount:20, frequency:"variable"},
    {name:"Taxis/transporte extra", typicalAmount:10, frequency:"variable"}
  ],
  philosophy: "Jarvis no prohíbe gastos hormiga. Muestra la consecuencia real antes de decidir: cuánto queda en el mes, qué se sacrifica, y deja que el usuario decida con esa información."
};

// ============================================
// ENTRENAMIENTO — Plan semanal seguro
// ============================================

const TRAINING_PLAN = {
  day1: {
    title: "Espalda + fuerza posterior + movilidad torácica",
    day: "Lunes",
    exercises: [
      {name:"Movilidad torácica con foam roller", detail:"3 series · 60 seg por zona", why:"Libera columna torácica, reduce compensación cervical"},
      {name:"Face pulls en polea baja", detail:"4×15 reps · peso liviano · retracción escapular", why:"Fortalece rotadores y estabilizadores cervicales"},
      {name:"Jalón al pecho agarre neutro", detail:"4×10 reps · agarre en V · sin tirar del cuello", why:"Dorsal y trapecio sin carga cervical"},
      {name:"Remo en polea sentado", detail:"4×12 reps · pecho apoyado · espalda neutra", why:"Romboides y dorsal sin flexión lumbar"},
      {name:"Remo mancuerna apoyo pecho", detail:"3×12 reps c/brazo · banco 45°", why:"Elimina stress lumbar"},
      {name:"Press mancuernas banco plano", detail:"4×10 reps · rango controlado", why:"Pectoral sin carga axial"},
      {name:"Superman / extensión espalda", detail:"3×12 reps · lento · 2seg arriba", why:"Erector espinal y glúteo, frena escoliosis"}
    ]
  },
  day2: {
    title: "Core profundo + glúteo + cadera",
    day: "Miércoles",
    exercises: [
      {name:"Dead bug", detail:"4×8 reps/lado · lumbar pegada al suelo", why:"Core profundo, seguro para escoliosis"},
      {name:"Bird dog", detail:"3×10 reps/lado · columna neutra", why:"Estabilidad lumbar y coordinación"},
      {name:"Hip thrust", detail:"4×12 reps · banco estable", why:"Glúteo mayor sin carga vertical en columna"},
      {name:"Sentadilla goblet", detail:"4×10 reps · mancuerna al pecho", why:"Cuádriceps y glúteo sin carga axial"},
      {name:"Romanian deadlift mancuernas", detail:"3×10 reps · espalda recta", why:"Isquiotibiales y glúteo"},
      {name:"Clamshell con banda", detail:"3×15 reps/lado", why:"Glúteo medio y rotadores de cadera"},
      {name:"Plancha frontal", detail:"4×30-45 seg · columna neutra", why:"Core anterior, protección directa escoliosis"}
    ]
  },
  day3: {
    title: "Fuerza funcional + tren superior + basket",
    day: "Viernes",
    exercises: [
      {name:"Dominadas asistidas o jalón supino", detail:"4×8 reps", why:"Dorsal y bíceps"},
      {name:"Press inclinado mancuernas 30°", detail:"3×10 reps · sin arquear", why:"Pectoral sin sobrecargar cervical"},
      {name:"Press Arnold sentado con respaldo", detail:"3×10 reps · respaldo 90°", why:"Hombro seguro con apoyo lumbar"},
      {name:"Curl bíceps alterno", detail:"3×12 reps", why:"Sin carga en columna"},
      {name:"Tríceps polea (rope)", detail:"3×12 reps", why:"Sin impacto cervical"},
      {name:"Basket — tiro libre y manejo", detail:"30-40 min · sin contacto", why:"Coordinación, cadera, tobillo"}
    ]
  },
  day4: {
    title: "Movilidad activa + recuperación",
    day: "Sábado (opcional)",
    exercises: [
      {name:"Movilidad cervical suave", detail:"Rotaciones, flexión lateral, chin tucks · 10 min", why:"Mantiene rango sin agravar lesión"},
      {name:"Estiramiento cadena posterior", detail:"Isquios, glúteo, piriforme · 20 min", why:"Libera tensión que agrava escoliosis"},
      {name:"Respiración diafragmática", detail:"5 min · solo se mueve el abdomen", why:"Activa transverso, reduce cortisol"}
    ]
  }
};

// ============================================
// TAREAS DIARIAS BASE (Jarvis las ajusta dinámicamente)
// ============================================

const DAILY_TASKS_TEMPLATE = [
  {id:"t1", text:"Movilidad cervical al despertar (chin tucks x10)", category:"cervical"},
  {id:"t2", text:"Primer vaso de agua en ayunas", category:"hidratación"},
  {id:"t3", text:"Desayuno con 40g+ de proteína", category:"nutrición"},
  {id:"t4", text:"Sesión del día (gym / movilidad / descanso)", category:"entreno"},
  {id:"t5", text:"Completar 2.8L de agua", category:"hidratación"},
  {id:"t6", text:"Lectura 15-20 minutos", category:"hábitos"},
  {id:"t7", text:"Respetar límite de redes sociales", category:"hábitos"},
  {id:"t8", text:"Registrar gastos del día", category:"finanzas"},
  {id:"t9", text:"Stretching cervical nocturno", category:"cervical"},
  {id:"t10", text:"Pantallas apagadas 1h antes de dormir", category:"descanso"}
];

// ============================================
// SYSTEM PROMPT PARA JARVIS (mentor IA)
// ============================================

function buildJarvisSystemPrompt(state) {
  return `Eres Jarvis, el mentor personal de IA del Sr. Sotomayor. No eres un chatbot genérico — conoces su perfil completo y respondes con ese contexto siempre.

PERFIL FÍSICO:
23 años, 75.1kg, 169cm, BMI 26.3. Composición: grasa 24.9% (18.7kg), músculo 52.6kg (70.1%), músculo esquelético 42.4%. Condiciones: lesión cervical en recuperación, escoliosis. Objetivo: recomposición corporal (grasa 24.9%→17%, músculo 52.6kg→56kg).

NUTRICIÓN:
TDEE 2650 kcal, meta 2400 kcal (déficit recomposición). Proteína 151g, carbos 240g, grasas 67g. Agua meta: 2.8L/día.

ENTRENAMIENTO:
3-4 días/semana. Enfoque: espalda, core profundo, glúteo, cadera, movilidad — SIN carga axial en columna. Ejercicios PROHIBIDOS: press militar con barra, encogimientos, sentadilla con barra en espalda, good mornings con barra, remo con barra pesado inclinado, leg press máximo.

SUEÑO:
Meta 7-8 horas. Protocolo cervical: almohada media altura, nunca boca abajo, chin tucks al despertar.

LECTURA:
15-20 min/día. Usuario tiene TDA — sesiones cortas funcionan mejor. Sugerir contenido basado en evidencia para mejorar concentración.

FINANZAS (ciclo iniciado 11/06/2026):
Ingreso mensual: $515. Gastos fijos: agua $25, teléfono $16, universidad $151 (sube a $201 cada 3er mes), YouTube Premium $12, pago a primo $50/mes (4 meses, termina 11/10/2026, debe $200 total). Presupuesto comida: $160. Ahorro meta: $50 en meses normales, $30 en mes pico de universidad. Gastos hormiga típicos: salidas con su pareja (~$20), taxis (~$10).
FILOSOFÍA FINANCIERA: No prohibir gastos. Mostrar la consecuencia real antes de que decida — "si gastás esto, te queda X para el resto del mes, tenías planeado Y, ¿vale la pena?"

SUPLEMENTACIÓN:
Filosofía: solo lo que el cuerpo necesita según sus datos, no suplementos porque sí. Prioridad: whey (cubrir proteína), creatina 5g (fuerza), luego omega 3 (antiinflamatorio cervical), magnesio (sueño), colágeno tipo II (articular), vitamina D3+K2 (huesos, relevante por escoliosis).

CÓMO TE COMPORTAS:
- Lo llamas "Sr. Sotomayor"
- Le asignas tareas diarias realistas basadas en cómo reporta sentirse (si dice que tiene dolor cervical o poca energía, ajustas el plan del día)
- Eres directo, práctico, basado en evidencia — no genérico
- En finanzas, no juzgas, pero muestras consecuencias reales con números
- Respondes en español, máximo 4-5 oraciones, sin asteriscos ni markdown
- Si no sabes algo con certeza científica, lo dices en vez de inventar

${state ? `ESTADO ACTUAL DE HOY: ${JSON.stringify(state)}` : ''}`;
}
