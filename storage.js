// ===================== PERSISTÊNCIA (localStorage) =====================

const STORE_KEYS = {
  logs: "treino_logs_v1",        // { "diaId_exId_semana": { carga, rpeReal } }
  peso: "treino_peso_v1",        // { semana: { real, bf } }
  concluido: "treino_concluido_v1", // { "diaId_semana": true/false }
  startDate: "treino_start_date",
  currentWeekOverride: "treino_week_override",
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Logs de treino ----
function getLog(diaId, exId, semana) {
  const logs = loadJSON(STORE_KEYS.logs, {});
  return logs[`${diaId}_${exId}_${semana}`] || { carga: "", rpeReal: "" };
}

function setLog(diaId, exId, semana, data) {
  const logs = loadJSON(STORE_KEYS.logs, {});
  logs[`${diaId}_${exId}_${semana}`] = data;
  saveJSON(STORE_KEYS.logs, logs);
}

// ---- Treino concluído (checkbox por dia+semana) ----
function getConcluido(diaId, semana) {
  const map = loadJSON(STORE_KEYS.concluido, {});
  return !!map[`${diaId}_${semana}`];
}

function setConcluido(diaId, semana, value) {
  const map = loadJSON(STORE_KEYS.concluido, {});
  map[`${diaId}_${semana}`] = value;
  saveJSON(STORE_KEYS.concluido, map);
}

// ---- Peso corporal ----
function getPesoSemana(semana) {
  const peso = loadJSON(STORE_KEYS.peso, {});
  return peso[semana] || { real: "", bf: "" };
}

function setPesoSemana(semana, data) {
  const peso = loadJSON(STORE_KEYS.peso, {});
  peso[semana] = data;
  saveJSON(STORE_KEYS.peso, peso);
}

function getAllPeso() {
  return loadJSON(STORE_KEYS.peso, {});
}

// ---- Data de início / semana atual ----
function getStartDate() {
  const raw = localStorage.getItem(STORE_KEYS.startDate);
  return raw || null;
}

function setStartDate(dateStr) {
  localStorage.setItem(STORE_KEYS.startDate, dateStr);
}

function getWeekOverride() {
  const raw = localStorage.getItem(STORE_KEYS.currentWeekOverride);
  return raw ? parseInt(raw, 10) : null;
}

function setWeekOverride(week) {
  if (week === null) {
    localStorage.removeItem(STORE_KEYS.currentWeekOverride);
  } else {
    localStorage.setItem(STORE_KEYS.currentWeekOverride, String(week));
  }
}

function calcSemanaAtual() {
  const override = getWeekOverride();
  if (override) return Math.min(Math.max(override, 1), CONFIG.totalSemanas);

  const start = getStartDate();
  if (!start) return 1;
  const startDate = new Date(start + "T00:00:00");
  const today = new Date();
  const diffMs = today - startDate;
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  const semana = diffWeeks + 1;
  return Math.min(Math.max(semana, 1), CONFIG.totalSemanas);
}

// ---- Export / Import completo ----
function exportBackup() {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    logs: loadJSON(STORE_KEYS.logs, {}),
    peso: loadJSON(STORE_KEYS.peso, {}),
    concluido: loadJSON(STORE_KEYS.concluido, {}),
    startDate: getStartDate(),
    weekOverride: getWeekOverride(),
  };
  return JSON.stringify(backup, null, 2);
}

function importBackup(jsonStr) {
  const data = JSON.parse(jsonStr);
  if (data.logs) saveJSON(STORE_KEYS.logs, data.logs);
  if (data.peso) saveJSON(STORE_KEYS.peso, data.peso);
  if (data.concluido) saveJSON(STORE_KEYS.concluido, data.concluido);
  if (data.startDate) setStartDate(data.startDate);
  if (data.weekOverride) setWeekOverride(data.weekOverride);
}

function resetAllData() {
  localStorage.removeItem(STORE_KEYS.logs);
  localStorage.removeItem(STORE_KEYS.peso);
  localStorage.removeItem(STORE_KEYS.concluido);
  localStorage.removeItem(STORE_KEYS.startDate);
  localStorage.removeItem(STORE_KEYS.currentWeekOverride);
}
