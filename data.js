// ===================== DADOS DO PLANO =====================
// Baseado no plano de bulking 6 meses / 26 semanas / Upper-Lower A/B

const CONFIG = {
  pesoInicial: 81,
  pesoMeta: 92,
  totalSemanas: 26,
  startDateKey: "treino_start_date", // Monday of week 1 (yyyy-mm-dd)
};

// Tabela de progressão por semana-do-mesociclo (1-6)
const PARAMETROS = {
  1: { fase: "Reintrodução",     compReps: "8-10", compRPE: 7,   isoReps: "12-15", isoRPE: 7   },
  2: { fase: "Acúmulo",          compReps: "7-9",  compRPE: 7.5, isoReps: "12-15", isoRPE: 7.5 },
  3: { fase: "Acúmulo",          compReps: "6-8",  compRPE: 8,   isoReps: "12-15", isoRPE: 8   },
  4: { fase: "Pico de Volume",   compReps: "5-7",  compRPE: 8.5, isoReps: "12-15", isoRPE: 8.5 },
  5: { fase: "Intensificação",   compReps: "4-6",  compRPE: 9,   isoReps: "10-12", isoRPE: 9   },
  6: { fase: "DELOAD",           compReps: "8-10", compRPE: 5.5, isoReps: "12-15", isoRPE: 5.5 },
};

// tipo: "C" composto | "I" isolamento
const DIAS = {
  "upper-a": {
    label: "Upper A",
    sub: "Ênfase Push",
    exercicios: [
      { id: "ua1", nome: "Supino reto barra",              tipo: "C", descanso: "2:30 min" },
      { id: "ua2", nome: "Supino inclinado halteres",      tipo: "C", descanso: "1:30 min" },
      { id: "ua3", nome: "Desenvolvimento halteres",       tipo: "C", descanso: "2:00 min" },
      { id: "ua4", nome: "Remada curvada",                 tipo: "C", descanso: "2:00 min" },
      { id: "ua5", nome: "Crucifixo peck deck (máquina)",  tipo: "I", descanso: "1:15 min" },
      { id: "ua6", nome: "Elevação lateral",                tipo: "I", descanso: "1:00 min" },
      { id: "ua7", nome: "Tríceps corda",                   tipo: "I", descanso: "1:00 min" },
      { id: "ua8", nome: "Rosca direta",                    tipo: "I", descanso: "1:00 min" },
    ],
  },
  "lower-a": {
    label: "Lower A",
    sub: "Ênfase Quadríceps",
    exercicios: [
      { id: "la1", nome: "Agachamento livre",     tipo: "C", descanso: "3:00 min" },
      { id: "la2", nome: "Leg press",              tipo: "C", descanso: "2:00 min" },
      { id: "la3", nome: "Afundo / avanço",        tipo: "C", descanso: "2:00 min" },
      { id: "la4", nome: "Cadeira extensora",      tipo: "I", descanso: "1:30 min" },
      { id: "la5", nome: "Cadeira flexora",        tipo: "I", descanso: "1:30 min" },
      { id: "la6", nome: "Panturrilha em pé",      tipo: "I", descanso: "1:00 min" },
    ],
  },
  "upper-b": {
    label: "Upper B",
    sub: "Ênfase Pull",
    exercicios: [
      { id: "ub1", nome: "Levantamento terra romeno",     tipo: "C", descanso: "3:00 min" },
      { id: "ub2", nome: "Barra fixa",                     tipo: "C", descanso: "2:00 min" },
      { id: "ub3", nome: "Remada cavalinho",               tipo: "C", descanso: "2:00 min" },
      { id: "ub4", nome: "Desenvolvimento militar barra",  tipo: "C", descanso: "2:00 min" },
      { id: "ub5", nome: "Paralelas (dips)",                tipo: "C", descanso: "1:30 min" },
      { id: "ub6", nome: "Crucifixo inclinado (cabo)",      tipo: "I", descanso: "1:15 min" },
      { id: "ub7", nome: "Elevação lateral (cabo)",         tipo: "I", descanso: "1:00 min" },
      { id: "ub8", nome: "Rosca martelo",                   tipo: "I", descanso: "1:00 min" },
      { id: "ub9", nome: "Face pull",                        tipo: "I", descanso: "0:45 min" },
    ],
  },
  "lower-b": {
    label: "Lower B",
    sub: "Ênfase Posterior / Glúteo",
    exercicios: [
      { id: "lb1", nome: "Levantamento terra convencional", tipo: "C", descanso: "3:00 min" },
      { id: "lb2", nome: "Hack squat / agach. frontal",     tipo: "C", descanso: "2:00 min" },
      { id: "lb3", nome: "Elevação pélvica (glúteo)",        tipo: "C", descanso: "2:00 min" },
      { id: "lb4", nome: "Cadeira flexora",                  tipo: "I", descanso: "2:00 min" },
      { id: "lb5", nome: "Abdução de quadril",               tipo: "I", descanso: "1:00 min" },
      { id: "lb6", nome: "Panturrilha sentado",              tipo: "I", descanso: "1:00 min" },
    ],
  },
};

const ORDEM_DIAS = ["upper-a", "lower-a", "upper-b", "lower-b"];

// ===================== HELPERS DE PERIODIZAÇÃO =====================

function mesocicloDaSemana(semana) {
  if (semana > 24) return "Final";
  return Math.ceil(semana / 6);
}

function semanaNoCiclo(semana) {
  if (semana > 24) return 6; // semanas 25-26 tratadas como deload
  return ((semana - 1) % 6) + 1;
}

function isDeload(semana) {
  return semanaNoCiclo(semana) === 6;
}

function metaExercicio(semana, tipo) {
  const p = PARAMETROS[semanaNoCiclo(semana)];
  if (tipo === "C") return { reps: p.compReps, rpe: p.compRPE, fase: p.fase };
  return { reps: p.isoReps, rpe: p.isoRPE, fase: p.fase };
}

function pesoMetaSemana(semana) {
  const { pesoInicial, pesoMeta, totalSemanas } = CONFIG;
  return pesoInicial + (pesoMeta - pesoInicial) * (semana / totalSemanas);
}
