// ===================== APP STATE / ROUTING =====================

let currentView = "overview";
let currentSemana = calcSemanaAtual();

const viewRoot = document.getElementById("viewRoot");

const VIEW_LABELS = {
  overview: "Visão Geral",
  "upper-a": "Treino · Upper A",
  "lower-a": "Treino · Lower A",
  "upper-b": "Treino · Upper B",
  "lower-b": "Treino · Lower B",
  peso: "Peso Corporal",
  ajustes: "Ajustes",
};

function updateContentLabel() {
  const label = document.getElementById("contentLabel");
  if (label) label.textContent = VIEW_LABELS[currentView] || "";
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll(".nav-link, .tab-link").forEach((el) => {
    el.classList.toggle("active", el.dataset.view === view);
  });
  render();
  updateContentLabel();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-link, .tab-link").forEach((el) => {
  el.addEventListener("click", () => switchView(el.dataset.view));
});

function showToast(msg) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.getElementById("tpl-toast").content.firstElementChild.cloneNode(true);
    document.body.appendChild(toast);
  }
  toast.textContent = "";
  toast.appendChild(document.createTextNode(msg));
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

// ===================== WEEK RAIL (assinatura) =====================

function renderWeekRail() {
  const rail = document.getElementById("weekRail");
  rail.innerHTML = "";
  for (let s = 1; s <= CONFIG.totalSemanas; s++) {
    const meso = mesocicloDaSemana(s);
    const mesoClass = meso === "Final" ? "meso-final" : `meso-${meso}`;
    const el = document.createElement("div");
    el.className = "rail-week " + mesoClass;
    if (isDeload(s)) el.classList.add("is-deload");
    if (s === currentSemana) el.classList.add("is-current");
    if (s < currentSemana) el.classList.add("is-past");

    const semanaCompleta = ORDEM_DIAS.every((d) => getConcluido(d, s));
    if (semanaCompleta) el.classList.add("is-week-done");

    const plate = document.createElement("div");
    plate.className = "rail-plate";
    el.appendChild(plate);

    const num = document.createElement("div");
    num.className = "rail-num";
    num.textContent = s;
    el.appendChild(num);

    const tip = document.createElement("div");
    tip.className = "rail-tooltip";
    const mesoLabel = meso === "Final" ? "Deload Final" : `Mesociclo ${meso}`;
    tip.textContent = `Semana ${s} · ${mesoLabel}${isDeload(s) ? " · DELOAD" : ""}${semanaCompleta ? " · ✓ completa" : ""}`;
    el.appendChild(tip);

    el.addEventListener("click", () => {
      currentSemana = s;
      setWeekOverride(s);
      renderWeekRail();
      render();
    });

    rail.appendChild(el);
  }

  // scroll to current week
  const currentEl = rail.querySelector(".is-current");
  if (currentEl) {
    currentEl.scrollIntoView({ inline: "center", block: "nearest" });
  }
}

// ===================== VIEW: OVERVIEW =====================

function renderOverview() {
  const meso = mesocicloDaSemana(currentSemana);
  const deload = isDeload(currentSemana);
  const semCiclo = semanaNoCiclo(currentSemana);
  const fase = PARAMETROS[semCiclo].fase;
  const pesoTarget = pesoMetaSemana(currentSemana);

  const pesoData = getAllPeso();
  const pesosOrdenados = Object.keys(pesoData)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((s) => pesoData[s].real !== "" && pesoData[s].real != null);
  const ultimoPesoReal = pesosOrdenados.length
    ? pesoData[pesosOrdenados[pesosOrdenados.length - 1]].real
    : null;
  const diffParaMeta = ultimoPesoReal ? (CONFIG.pesoMeta - ultimoPesoReal).toFixed(1) : null;

  const diaHoje = ORDEM_DIAS[(currentSemana - 1) % ORDEM_DIAS.length]; // sugestão simples
  const hojeConcluido = getConcluido(diaHoje, currentSemana);

  const semanaConcluidos = ORDEM_DIAS.filter((d) => getConcluido(d, currentSemana)).length;

  const badgeIcon = diaHoje.startsWith("upper") ? "💪" : "🦵";
  const badgeLetter = diaHoje.endsWith("a") ? "A" : "B";

  viewRoot.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Visão Geral</h1>
        <p class="page-sub">Bulking de 26 semanas · 81kg → 92kg</p>
      </div>
      <span class="pill ${deload ? "pill-deload" : "pill-accent"}">
        ${deload ? "DELOAD" : `MESOCICLO ${meso}`} · SEMANA ${currentSemana}/${CONFIG.totalSemanas}
      </span>
    </div>

    <div class="card today-card">
      <div class="today-left">
        <div class="today-badge">${badgeIcon}<span class="today-badge-letter">${badgeLetter}</span></div>
        <div>
          <p class="today-title">Próximo treino sugerido: ${DIAS[diaHoje].label} ${hojeConcluido ? '<span class="pill pill-good" style="margin-left:8px">✓ Concluído</span>' : ""}</p>
          <p class="today-meta">${DIAS[diaHoje].sub} · Fase: ${fase}${deload ? " (recuperação ativa)" : ""}</p>
        </div>
      </div>
      <button class="btn btn-primary" data-goto="${diaHoje}">Abrir treino →</button>
    </div>

    <div class="grid grid-4">
      <div class="card stat-card">
        <span class="stat-label">Semana Atual</span>
        <span class="stat-value">${currentSemana}<span> / ${CONFIG.totalSemanas}</span></span>
        <span class="stat-hint">Sem. ${semCiclo}/6 do mesociclo</span>
      </div>
      <div class="card stat-card">
        <span class="stat-label">Treinos na Semana</span>
        <span class="stat-value">${semanaConcluidos}<span> / 4</span></span>
        <span class="stat-hint">${semanaConcluidos === 4 ? "Semana completa 💪" : "Concluídos até agora"}</span>
      </div>
      <div class="card stat-card">
        <span class="stat-label">Peso Meta (semana)</span>
        <span class="stat-value">${pesoTarget.toFixed(1)}<span>kg</span></span>
        <span class="stat-hint">Meta final: ${CONFIG.pesoMeta}kg</span>
      </div>
      <div class="card stat-card">
        <span class="stat-label">Último Peso Real</span>
        <span class="stat-value">${ultimoPesoReal ? ultimoPesoReal + "<span>kg</span>" : "—"}</span>
        <span class="stat-hint">${diffParaMeta ? `Faltam ${diffParaMeta}kg para a meta` : "Registre seu peso"}</span>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <h3 class="section-title">Estrutura Semanal</h3>
        <table class="data-table">
          <tbody>
            <tr><td>Segunda</td><td>Upper A — ênfase push</td></tr>
            <tr><td>Terça</td><td>Lower A — ênfase quadríceps</td></tr>
            <tr><td>Quarta</td><td>Descanso / Cardio LISS</td></tr>
            <tr><td>Quinta</td><td>Upper B — ênfase pull</td></tr>
            <tr><td>Sexta</td><td>Lower B — ênfase posterior/glúteo</td></tr>
            <tr><td>Sábado</td><td>Descanso / Cardio LISS</td></tr>
            <tr><td>Domingo</td><td>Descanso total</td></tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <h3 class="section-title">Mesociclos</h3>
        <table class="data-table">
          <tbody>
            <tr class="${meso === 1 ? "is-current" : ""}"><td>Mesociclo 1</td><td>Semanas 1-6</td><td>Adaptação</td></tr>
            <tr class="${meso === 2 ? "is-current" : ""}"><td>Mesociclo 2</td><td>Semanas 7-12</td><td>Progressão</td></tr>
            <tr class="${meso === 3 ? "is-current" : ""}"><td>Mesociclo 3</td><td>Semanas 13-18</td><td>Progressão</td></tr>
            <tr class="${meso === 4 ? "is-current" : ""}"><td>Mesociclo 4</td><td>Semanas 19-24</td><td>Push final</td></tr>
            <tr class="${meso === "Final" ? "is-current" : ""}"><td>Final</td><td>Semanas 25-26</td><td>Deload + reavaliação</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  viewRoot.querySelector("[data-goto]").addEventListener("click", (e) => {
    switchView(e.target.dataset.goto);
  });
}

// ===================== VIEW: DIA DE TREINO =====================

function renderDia(diaId) {
  const dia = DIAS[diaId];
  const deload = isDeload(currentSemana);
  const semCiclo = semanaNoCiclo(currentSemana);
  const fase = PARAMETROS[semCiclo].fase;
  const concluido = getConcluido(diaId, currentSemana);

  const exercisesHtml = dia.exercicios
    .map((ex, idx) => {
      const meta = metaExercicio(currentSemana, ex.tipo);
      const log = getLog(diaId, ex.id, currentSemana);
      const filled = log.carga !== "" && log.carga != null;
      return `
      <div class="ex-card" data-ex="${ex.id}">
        <div class="ex-order">${idx + 1}</div>
        <div class="ex-main">
          <div class="ex-name-row">
            <span class="ex-name">${ex.nome}</span>
            <span class="tag ${ex.tipo === "C" ? "tag-c" : "tag-i"}">${ex.tipo === "C" ? "Composto" : "Isolamento"}</span>
          </div>
          <div class="ex-meta">
            <span class="ex-meta-item">Meta: <b>${meta.reps} reps @ RPE ${meta.rpe}</b></span>
            <span class="ex-meta-item">Descanso: <b>${ex.descanso}</b></span>
          </div>
        </div>
        <div class="ex-inputs">
          <div class="field">
            <label>Carga (kg)</label>
            <input type="number" inputmode="decimal" step="0.5" class="input-carga" value="${log.carga}">
          </div>
          <div class="field">
            <label>RPE Real</label>
            <input type="number" inputmode="decimal" step="0.5" min="1" max="10" class="input-rpe" value="${log.rpeReal}">
          </div>
          <div class="save-check ${filled ? "filled" : ""}">${filled ? "✓" : "—"}</div>
        </div>
      </div>
    `;
    })
    .join("");

  viewRoot.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">${dia.label}</h1>
        <p class="page-sub">${dia.sub}</p>
      </div>
      <span class="pill ${deload ? "pill-deload" : "pill-accent"}">SEMANA ${currentSemana}/${CONFIG.totalSemanas}</span>
    </div>

    <div class="meso-banner ${deload ? "is-deload" : ""}">
      ${deload
        ? `⚠ Semana de <b>DELOAD</b> — mesmas séries, reps sobem, RPE cai para ~5.5. Não force carga.`
        : `Fase atual: <b>${fase}</b> · Semana ${semCiclo}/6 do mesociclo · Séries fixas, progressão via reps/RPE`
      }
    </div>

    <label class="complete-toggle ${concluido ? "is-done" : ""}" id="completeToggle">
      <input type="checkbox" id="concluidoCheckbox" ${concluido ? "checked" : ""}>
      <span class="complete-box">${concluido ? "✓" : ""}</span>
      <span class="complete-label">${concluido ? "Treino concluído" : "Marcar treino como concluído"}</span>
    </label>

    <div class="ex-list">${exercisesHtml}</div>
  `;

  document.getElementById("concluidoCheckbox").addEventListener("change", (e) => {
    const val = e.target.checked;
    setConcluido(diaId, currentSemana, val);
    const toggle = document.getElementById("completeToggle");
    toggle.classList.toggle("is-done", val);
    toggle.querySelector(".complete-box").textContent = val ? "✓" : "";
    toggle.querySelector(".complete-label").textContent = val ? "Treino concluído" : "Marcar treino como concluído";
    showToast(val ? "Treino marcado como concluído" : "Marcação removida");
    renderWeekRail();
  });

  // bind inputs
  viewRoot.querySelectorAll(".ex-card").forEach((card) => {
    const exId = card.dataset.ex;
    const cargaInput = card.querySelector(".input-carga");
    const rpeInput = card.querySelector(".input-rpe");
    const check = card.querySelector(".save-check");

    function persist() {
      setLog(diaId, exId, currentSemana, {
        carga: cargaInput.value,
        rpeReal: rpeInput.value,
      });
      const filled = cargaInput.value !== "";
      check.classList.toggle("filled", filled);
      check.textContent = filled ? "✓" : "—";
    }

    cargaInput.addEventListener("change", () => { persist(); showToast("Carga salva"); });
    rpeInput.addEventListener("change", () => { persist(); showToast("RPE salvo"); });
  });
}

// ===================== VIEW: PESO CORPORAL =====================

function renderPeso() {
  const log = getPesoSemana(currentSemana);
  const pesoTarget = pesoMetaSemana(currentSemana);
  const allPeso = getAllPeso();

  const rowsHtml = [];
  for (let s = 1; s <= CONFIG.totalSemanas; s++) {
    const p = allPeso[s] || { real: "", bf: "" };
    const target = pesoMetaSemana(s).toFixed(1);
    const diff = p.real !== "" && p.real != null ? (Number(p.real) - target).toFixed(1) : "—";
    rowsHtml.push(`
      <tr class="${isDeload(s) ? "is-deload" : ""} ${s === currentSemana ? "is-current" : ""}">
        <td>${s}</td>
        <td>${target}kg</td>
        <td>${p.real !== "" && p.real != null ? p.real + "kg" : "—"}</td>
        <td>${p.bf !== "" && p.bf != null ? p.bf + "%" : "—"}</td>
        <td>${diff !== "—" ? (diff > 0 ? "+" : "") + diff + "kg" : "—"}</td>
      </tr>
    `);
  }

  viewRoot.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Peso Corporal</h1>
        <p class="page-sub">Meta: ${CONFIG.pesoInicial}kg → ${CONFIG.pesoMeta}kg em ${CONFIG.totalSemanas} semanas</p>
      </div>
      <span class="pill pill-accent">META SEMANA ${currentSemana}: ${pesoTarget.toFixed(1)}kg</span>
    </div>

    <div class="card">
      <h3 class="section-title">Registrar peso — Semana ${currentSemana}</h3>
      <div class="peso-form">
        <div class="field">
          <label>Peso médio (kg)</label>
          <input type="number" step="0.1" id="pesoRealInput" value="${log.real}">
        </div>
        <div class="field">
          <label>%BF (opcional)</label>
          <input type="number" step="0.1" id="pesoBfInput" value="${log.bf}">
        </div>
        <button class="btn btn-primary btn-sm" id="salvarPesoBtn">Salvar</button>
      </div>
      <p class="muted" style="margin-top:10px">Pese-se 3-4x na semana em jejum e registre a média. Ritmo ideal: 0,25 a 0,40kg/semana.</p>
    </div>

    <div class="card">
      <h3 class="section-title">Progresso de Peso</h3>
      <div class="chart-wrap" id="chartWrap"></div>
    </div>

    <div class="card">
      <h3 class="section-title">Histórico completo</h3>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Semana</th><th>Meta</th><th>Real</th><th>%BF</th><th>Diferença</th></tr></thead>
          <tbody>${rowsHtml.join("")}</tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("salvarPesoBtn").addEventListener("click", () => {
    const real = document.getElementById("pesoRealInput").value;
    const bf = document.getElementById("pesoBfInput").value;
    setPesoSemana(currentSemana, { real, bf });
    showToast("Peso registrado");
    renderPeso();
  });

  renderPesoChart();
}

function renderPesoChart() {
  const wrap = document.getElementById("chartWrap");
  const W = Math.max(wrap.clientWidth || 640, 640);
  const H = 220;
  const padL = 40, padR = 16, padT = 16, padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const allPeso = getAllPeso();
  const semanas = Array.from({ length: CONFIG.totalSemanas }, (_, i) => i + 1);
  const targets = semanas.map((s) => pesoMetaSemana(s));
  const reals = semanas.map((s) => (allPeso[s] && allPeso[s].real !== "" ? Number(allPeso[s].real) : null));

  const minY = Math.floor(Math.min(CONFIG.pesoInicial, ...reals.filter((v) => v != null)) - 1);
  const maxY = Math.ceil(Math.max(CONFIG.pesoMeta, ...reals.filter((v) => v != null)) + 1);

  const xFor = (s) => padL + ((s - 1) / (CONFIG.totalSemanas - 1)) * plotW;
  const yFor = (v) => padT + (1 - (v - minY) / (maxY - minY)) * plotH;

  const targetPath = semanas.map((s, i) => `${i === 0 ? "M" : "L"} ${xFor(s)} ${yFor(targets[i])}`).join(" ");

  let realPath = "";
  let realPts = "";
  let started = false;
  semanas.forEach((s, i) => {
    if (reals[i] == null) return;
    realPath += `${started ? "L" : "M"} ${xFor(s)} ${yFor(reals[i])} `;
    started = true;
    realPts += `<circle cx="${xFor(s)}" cy="${yFor(reals[i])}" r="3.5" fill="var(--good)" />`;
  });

  // gridlines
  const gridLines = [];
  const step = Math.ceil((maxY - minY) / 5);
  for (let v = minY; v <= maxY; v += step) {
    gridLines.push(`
      <line x1="${padL}" y1="${yFor(v)}" x2="${W - padR}" y2="${yFor(v)}" stroke="var(--border-soft)" stroke-width="1" />
      <text x="${padL - 8}" y="${yFor(v) + 4}" fill="var(--text-faint)" font-size="10" font-family="var(--font-mono)" text-anchor="end">${v}</text>
    `);
  }

  // deload band markers
  let deloadBands = "";
  semanas.forEach((s) => {
    if (isDeload(s)) {
      deloadBands += `<rect x="${xFor(s) - (plotW / (CONFIG.totalSemanas - 1)) / 2}" y="${padT}" width="${plotW / (CONFIG.totalSemanas - 1)}" height="${plotH}" fill="var(--deload-soft)" opacity="0.5" />`;
    }
  });

  const currentX = xFor(currentSemana);

  wrap.innerHTML = `
    <svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" height="${H}">
      ${deloadBands}
      ${gridLines.join("")}
      <path d="${targetPath}" fill="none" stroke="var(--steel)" stroke-width="2" stroke-dasharray="4 4" />
      <path d="${realPath}" fill="none" stroke="var(--good)" stroke-width="2.5" />
      ${realPts}
      <line x1="${currentX}" y1="${padT}" x2="${currentX}" y2="${H - padB}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 3" />
    </svg>
    <div class="rail-legend">
      <span class="rail-legend-item"><span class="rail-legend-dot" style="background:var(--steel)"></span>Meta projetada</span>
      <span class="rail-legend-item"><span class="rail-legend-dot" style="background:var(--good)"></span>Peso real registrado</span>
      <span class="rail-legend-item"><span class="rail-legend-dot" style="background:var(--deload-soft)"></span>Semana de deload</span>
      <span class="rail-legend-item"><span class="rail-legend-dot" style="background:var(--accent)"></span>Semana atual</span>
    </div>
  `;
}

// ===================== VIEW: AJUSTES =====================

function renderAjustes() {
  const start = getStartDate() || "";
  const override = getWeekOverride();

  viewRoot.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Ajustes</h1>
        <p class="page-sub">Configuração do ciclo e backup de dados</p>
      </div>
    </div>

    <div class="card">
      <div class="settings-row">
        <div>
          <div class="settings-label">Data de início (Segunda da Semana 1)</div>
          <div class="settings-hint">Usada para calcular automaticamente a semana atual</div>
        </div>
        <div class="settings-control">
          <input type="date" id="startDateInput" value="${start}">
          <button class="btn btn-primary btn-sm" id="saveStartBtn">Salvar</button>
        </div>
      </div>

      <div class="settings-row">
        <div>
          <div class="settings-label">Forçar semana manualmente</div>
          <div class="settings-hint">Sobrepõe o cálculo automático (útil se viajou, pulou treino, etc.)</div>
        </div>
        <div class="settings-control">
          <input type="number" id="weekOverrideInput" min="1" max="${CONFIG.totalSemanas}" value="${override || ""}" placeholder="auto">
          <button class="btn btn-ghost btn-sm" id="saveOverrideBtn">Aplicar</button>
          <button class="btn btn-ghost btn-sm" id="clearOverrideBtn">Limpar</button>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="section-title">Backup de dados</h3>
      <p class="muted">Os dados ficam salvos apenas neste navegador/dispositivo. Exporte regularmente para não perder o histórico.</p>
      <div style="display:flex; gap:10px; margin: 14px 0;">
        <button class="btn btn-primary btn-sm" id="exportBtn">Exportar backup (.json)</button>
        <button class="btn btn-ghost btn-sm" id="importBtn">Importar backup</button>
      </div>
      <textarea class="backup-area" id="backupArea" placeholder="Cole aqui o conteúdo do backup para importar..."></textarea>
    </div>

    <div class="card">
      <h3 class="section-title">Zona de risco</h3>
      <div class="settings-row">
        <div>
          <div class="settings-label">Apagar todos os dados</div>
          <div class="settings-hint">Remove cargas, RPEs, pesos e configurações salvas neste dispositivo</div>
        </div>
        <button class="btn btn-danger btn-sm" id="resetBtn">Apagar tudo</button>
      </div>
    </div>
  `;

  document.getElementById("saveStartBtn").addEventListener("click", () => {
    const val = document.getElementById("startDateInput").value;
    if (!val) return;
    setStartDate(val);
    setWeekOverride(null);
    currentSemana = calcSemanaAtual();
    showToast("Data de início salva");
    renderWeekRail();
    render();
  });

  document.getElementById("saveOverrideBtn").addEventListener("click", () => {
    const val = parseInt(document.getElementById("weekOverrideInput").value, 10);
    if (!val) return;
    setWeekOverride(val);
    currentSemana = calcSemanaAtual();
    showToast(`Semana ajustada para ${val}`);
    renderWeekRail();
    render();
  });

  document.getElementById("clearOverrideBtn").addEventListener("click", () => {
    setWeekOverride(null);
    currentSemana = calcSemanaAtual();
    document.getElementById("weekOverrideInput").value = "";
    showToast("Cálculo automático restaurado");
    renderWeekRail();
    render();
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const data = exportBackup();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ciclo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup exportado");
  });

  document.getElementById("importBtn").addEventListener("click", () => {
    const raw = document.getElementById("backupArea").value.trim();
    if (!raw) { showToast("Cole o JSON do backup primeiro"); return; }
    try {
      importBackup(raw);
      showToast("Backup importado com sucesso");
      currentSemana = calcSemanaAtual();
      renderWeekRail();
      render();
    } catch (e) {
      showToast("Erro ao importar — verifique o JSON");
    }
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Tem certeza? Isso vai apagar todos os dados salvos neste dispositivo.")) {
      resetAllData();
      currentSemana = calcSemanaAtual();
      showToast("Dados apagados");
      renderWeekRail();
      render();
    }
  });
}

// ===================== ROUTER =====================

function render() {
  if (currentView === "overview") return renderOverview();
  if (currentView === "peso") return renderPeso();
  if (currentView === "ajustes") return renderAjustes();
  if (DIAS[currentView]) return renderDia(currentView);
  return renderOverview();
}

// ===================== INIT =====================

(function init() {
  if (!getStartDate()) {
    // default: assume a semana 1 começou na segunda-feira mais recente
    const today = new Date();
    const day = today.getDay(); // 0 = domingo
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    setStartDate(monday.toISOString().slice(0, 10));
    currentSemana = calcSemanaAtual();
  }
  renderWeekRail();
  render();
  updateContentLabel();
})();

window.addEventListener("resize", () => {
  if (currentView === "peso") renderPesoChart();
});
