// Pagina del pannello (i testi in TEXTS, da texts.<lingua>.js che il server serve come /texts.js): legge /api/state (con l'avviso di versione nuova, F23), si aggiorna con /api/events e manda le risposte a /api/answer, i voti a /api/rate e, da F27, i totali di token a /api/share.
// I dati del progetto entrano nel DOM solo come testo (textContent), mai come HTML.
"use strict";

const DEPARTMENTS = ["AIBPD", "AICA", "AIPCA", "AISA", "AIWDA"];
const PRIORITIES = ["P0", "P1", "P2", "P3", ""];
const REFRESH_MS = 10_000;
const TITLE = TEXTS.title;

let state = null;
let filter = "";
const $ = (id) => document.getElementById(id);

/** Crea un elemento con attributi e figli (stringhe o nodi). */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (key === "class") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

/** Testo dei file Markdown: `codice` diventa <code>, link e grassetti restano solo testo. */
function inline(text) {
  const plain = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
  return plain.split("`").map((part, i) => (i % 2 ? el("code", {}, part) : part));
}

/** La sigla del reparto dall'id dell'agente («AISA-02» → «AISA»): è il valore di data-dept che colora il reparto. */
const dept = (agent) => agent.id.split("-")[0];

// Compiti aperti dall'utente: la lista si ridisegna a ogni aggiornamento e non deve richiuderli.
const openTasks = new Set();

/** Il compito: la prima riga in vista, il testo intero in un <details> se è più lungo. */
function taskBlock(key, text) {
  const first = text.split("\n")[0];
  if (first === text && text.length <= 120) return el("span", { class: "task" }, text);
  return el(
    "details",
    { class: "task", open: openTasks.has(key), ontoggle: (e) => (e.currentTarget.open ? openTasks.add(key) : openTasks.delete(key)) },
    el("summary", {}, first.length > 120 ? `${first.slice(0, 119)}…` : first),
    el("p", { class: "full" }, text),
  );
}

const time = (iso) => new Date(iso).toLocaleTimeString(TEXTS.locale, { hour: "2-digit", minute: "2-digit" });
const empty = (text) => el("p", { class: "empty" }, text);

function renderHeader({ project, update }) {
  const banner = $("update");
  banner.hidden = !update;
  banner.textContent = update ?? "";
  const files = project.git
    ? [project.git.changed > 0 && TEXTS.changed(project.git.changed), project.git.untracked > 0 && TEXTS.untracked(project.git.untracked)].filter(Boolean)
    : [];
  const git = project.git ? [TEXTS.branch(project.git.branch), ...files].join(" · ") : TEXTS.noGit;
  $("project").textContent = project.name + git;
  const problems = $("problems");
  problems.hidden = project.problems.length === 0;
  problems.textContent = project.problems.join("\n");
}

// Le domande non si ridisegnano a ogni aggiornamento: una scelta a metà resterebbe persa.
function renderQuestions({ questions }) {
  const box = $("questions");
  const ids = new Set(questions.map((q) => q.id));
  for (const node of [...box.querySelectorAll("[data-question]")]) {
    if (!ids.has(node.dataset.question) && !node.dataset.sent) node.remove();
  }
  for (const question of questions) {
    if (!box.querySelector(`[data-question="${CSS.escape(question.id)}"]`)) box.append(questionCard(question));
  }
  const waiting = questions.length;
  box.querySelector(".empty")?.remove();
  if (!box.querySelector("[data-question]")) {
    box.append(empty(TEXTS.noQuestions));
  }
  document.title = waiting ? `(${waiting}) ${TITLE}` : TITLE;
}

function questionCard(question) {
  const name = `q-${question.id}`;
  const type = question.multiple ? "checkbox" : "radio";
  const error = el("p", { class: "error", role: "alert", hidden: true });
  const note = el("textarea", { name: "note", maxlength: "2000" });
  const options = question.options.map((option) => {
    const recommended = /\s*\((Recommended|Consigliata)\)\s*$/i;
    return el(
      "label",
      { class: "option" },
      el("input", { type, name, value: option.label }),
      el(
        "span",
        {},
        el("strong", {}, option.label.replace(recommended, ""), recommended.test(option.label) && el("span", { class: "recommended" }, TEXTS.recommended)),
        option.description,
      ),
    );
  });
  const form = el(
    "form",
    { class: "question", "data-question": question.id, onsubmit: (event) => submit(event, question, form, error) },
    question.header && el("span", { class: "tag" }, question.header),
    el("fieldset", {}, el("legend", {}, question.question), options),
    el("label", { class: "note" }, TEXTS.note, note),
    el("button", { type: "submit", class: "send" }, TEXTS.sendAnswer),
    error,
  );
  $("announce").textContent = TEXTS.newQuestion(question.question);
  return form;
}

async function submit(event, question, form, error) {
  event.preventDefault();
  const choices = [...form.querySelectorAll("input:checked")].map((input) => input.value);
  const note = form.elements.note.value;
  if (choices.length === 0 && note.trim() === "") {
    error.textContent = TEXTS.pickOrNote;
    error.hidden = false;
    return;
  }
  const response = await fetch("/api/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: question.id, choices, note }),
  }).catch(() => null);
  if (!response || !response.ok) {
    error.textContent = response ? await response.text() : TEXTS.noResponse;
    error.hidden = false;
    return;
  }
  form.dataset.sent = "true";
  form.replaceChildren(el("p", { class: "sent", role: "status" }, TEXTS.answerSent([...choices, note.trim()].filter(Boolean).join(", "))));
  setTimeout(() => {
    form.remove();
    if (state) renderQuestions(state);
  }, 5000);
}

// La catena degli agenti (F34-07): in ordine di chiamata, il direttore segnato, l'ultimo caricato attivo.
function renderActivity({ activity }) {
  const chain = [...activity].reverse();
  $("activity").replaceChildren(
    chain.length === 0
      ? empty(TEXTS.noActivity)
      : el(
          "ol",
          { class: "activity" },
          chain.map((a, i) =>
            el(
              "li",
              { "data-dept": dept(a), class: i === chain.length - 1 ? "active" : null },
              el("time", { datetime: a.time, class: "mono" }, time(a.time)),
              el(
                "span",
                { class: "dot" },
                el("strong", {}, a.codeName),
                ` — ${a.role}${TEXTS.department(a.department)}`,
                // Lo spazio separa le parole anche nel testo copiato e per i lettori di schermo (il margine non basta).
                a.director && [" ", el("span", { class: "tag" }, TEXTS.director)],
                i === chain.length - 1 && [" ", el("span", { class: "now" }, TEXTS.active)],
              ),
              a.task && taskBlock(`${a.id} ${a.time}`, a.task),
              // Il resoconto dal tool report; per l'agente attivo, che lavora ancora, non si segnala la mancanza.
              a.report
                ? el("div", { class: "report" }, el("strong", {}, TEXTS.report), el("p", {}, a.report))
                : i < chain.length - 1 && el("span", { class: "task muted" }, TEXTS.noReport),
            ),
          ),
        ),
  );
}

// I subagent di Claude Code (F34-06), a parte: non passano dal server, il pannello li legge dai file di Claude Code.
// Se Claude Code cambia il formato dei suoi file (F34-R3) il subagent compare lo stesso, con una nota: non sparisce.
function renderSubagents({ subagents = [] }) {
  const unknown = subagents.filter((s) => !s.recognized).length;
  const state = (s) => (!s.recognized ? TEXTS.subagentUnknown : s.finished ? TEXTS.subagentDone : TEXTS.subagentRunning);
  $("subagents").replaceChildren(
    unknown > 0 && el("p", { class: "problems" }, TEXTS.subagentFormat(unknown)),
    subagents.length === 0
      ? empty(TEXTS.noSubagents)
      : el(
          "ol",
          { class: "activity" },
          subagents.map((s) =>
            el(
              "li",
              {},
              el("time", { datetime: s.time, class: "mono" }, time(s.time)),
              el("span", {}, el("strong", {}, s.type), ` — ${state(s)}`),
              s.description && el("span", { class: "task" }, s.description),
            ),
          ),
        ),
  );
}

// Un modulo per agente usato, creato una volta sola: un aggiornamento non deve cancellare un commento a metà.
function renderRatings({ activity, rating }) {
  if (!rating) return;
  const box = $("ratings");
  const agents = [...new Map(activity.map((a) => [a.id, a])).values()];
  for (const agent of agents) {
    const node = box.querySelector(`[data-agent="${CSS.escape(agent.id)}"]`);
    const done = rating.rated.includes(agent.id);
    if (!node) box.append(done ? ratedNote(agent) : rateForm(agent, rating));
    else if (done && node.tagName === "FORM" && !node.dataset.sent) node.replaceWith(ratedNote(agent));
  }
  box.querySelector(".empty")?.remove();
  if (!box.querySelector("[data-agent]")) box.append(empty(TEXTS.rateEmpty));
}

const ratedNote = (agent) => el("p", { class: "sent", "data-agent": agent.id, "data-dept": dept(agent) }, el("strong", {}, agent.codeName), TEXTS.rated);

function rateForm(agent, rating) {
  const name = `r-${agent.id}`;
  const error = el("p", { class: "error", role: "alert", hidden: true });
  const stars = [1, 2, 3, 4, 5].map((n) =>
    el("label", { class: "star" }, el("input", { type: "radio", name, value: String(n) }), el("span", {}, `${n}`)),
  );
  const form = el(
    "form",
    { class: "question", "data-agent": agent.id, "data-dept": dept(agent), onsubmit: (event) => sendRating(event, agent, form, error) },
    el(
      "fieldset",
      {},
      el("legend", {}, el("span", { class: "dot" }, el("strong", {}, agent.codeName)), TEXTS.scoreLegend(agent.role, agent.department)),
      el("div", { class: "stars" }, stars),
    ),
    el("label", { class: "note" }, TEXTS.comment, el("textarea", { name: "comment", maxlength: String(rating.maxComment) })),
    el("label", { class: "check" }, el("input", { type: "checkbox", name: "publish" }), TEXTS.publish),
    el("p", { class: "hint" }, rating.notice),
    el("button", { type: "submit", class: "send" }, TEXTS.sendRating),
    error,
  );
  return form;
}

async function sendRating(event, agent, form, error) {
  event.preventDefault();
  const picked = form.querySelector("input[type=radio]:checked");
  if (!picked) {
    error.textContent = TEXTS.pickScore;
    error.hidden = false;
    return;
  }
  const body = { agentId: agent.id, rating: Number(picked.value), comment: form.elements.comment.value, publish: form.elements.publish.checked };
  const response = await fetch("/api/rate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const result = response ? await response.json().catch(() => null) : null;
  if (!result?.ok) {
    error.textContent = result?.message ?? (response ? TEXTS.badRating : TEXTS.noResponse);
    error.hidden = false;
    return;
  }
  form.dataset.sent = "true";
  form.replaceChildren(
    el("p", { class: "sent", role: "status" }, TEXTS.ratingSent(agent.codeName), el("code", {}, result.usageId), TEXTS.keepCode),
  );
}

function table(head, rows) {
  return el(
    "div",
    { class: "scroll" },
    el("table", {}, el("thead", {}, el("tr", {}, head.map((h) => el("th", { scope: "col" }, h)))), el("tbody", {}, rows)),
  );
}

function renderPhases({ project }) {
  const open = project.openPhase;
  $("open-phase").replaceChildren(
    ...(open
      ? [
          el("h3", {}, inline(open.title), ` — ${open.status}`),
          open.goal && el("p", { class: "goal" }, inline(open.goal)),
          el("h3", {}, TEXTS.backlog),
          open.tasks.length
            ? table(
                TEXTS.taskHead,
                open.tasks.map((t) =>
                  el(
                    "tr",
                    {},
                    el("th", { scope: "row", class: "mono" }, t.id),
                    el("td", {}, inline(t.task)),
                    el("td", {}, t.priority),
                    el("td", { class: t.done ? "status-done" : "" }, t.done ? TEXTS.done : TEXTS.todo),
                  ),
                ),
              )
            : empty(TEXTS.noBacklog),
          open.criteria.length > 0 && el("h3", {}, TEXTS.criteria),
          open.criteria.length > 0 && el("ul", { class: "criteria" }, open.criteria.map((c) => el("li", {}, inline(c)))),
        ]
      : [empty(TEXTS.noOpenPhase)]),
  );
  $("phases").replaceChildren(
    project.phases.length === 0
      ? empty(TEXTS.noPhases)
      : table(
          TEXTS.phaseHead,
          project.phases.map((p) =>
            el(
              "tr",
              { class: open && p.id === open.id ? "current" : "" },
              el("th", { scope: "row" }, p.id),
              el("td", {}, inline(p.summary)),
              el("td", {}, p.status),
            ),
          ),
        ),
  );
}

// I pulsanti si creano una volta sola: ricrearli a ogni aggiornamento toglierebbe il focus da tastiera.
function renderFilters() {
  const box = $("filters");
  if (!box.firstChild) {
    box.append(
      ...["", ...DEPARTMENTS].map((code) =>
        el("button", { type: "button", "data-code": code, onclick: () => ((filter = code), render()) }, code || TEXTS.all),
      ),
    );
  }
  for (const button of box.children) button.setAttribute("aria-pressed", String(button.dataset.code === filter));
}

const LABELS = TEXTS.priorities;

function findingItem(f) {
  return el(
    "li",
    {},
    f.id && el("strong", { class: "mono" }, `${f.id} `),
    inline(f.title),
    el("span", { class: "finding-meta" }, [f.department, f.source, f.status].filter(Boolean).join(" · ")),
  );
}

// Un gruppo per priorità, richiudibile: P0 e P1 aperti, gli altri chiusi; si ricorda la scelta dell'utente.
const opened = { P0: true, P1: true };

function renderFindings({ project }) {
  const shown = project.findings.filter((f) => !filter || f.department === filter);
  const fromPhases = (f) => !f.source.endsWith(".json");
  const groups = PRIORITIES.map((priority) => {
    const items = shown.filter((f) => f.priority === priority).sort((a, b) => fromPhases(b) - fromPhases(a));
    if (items.length === 0) return null;
    const details = el(
      "details",
      { open: Boolean(opened[priority]), ontoggle: () => (opened[priority] = details.open) },
      el("summary", {}, el("span", { class: `prio prio-${priority}` }, LABELS[priority]), ` (${items.length})`),
      el("ul", { class: "findings" }, items.map(findingItem)),
    );
    return details;
  });
  $("findings").replaceChildren(
    ...(shown.length ? groups.filter(Boolean) : [empty(filter ? TEXTS.noFindingsOf(filter) : TEXTS.noFindings)]),
    el("p", { class: "hint" }, TEXTS.findingsHint),
  );
}

function renderCounts({ project, questions, activity, rating }) {
  const waiting = questions.length;
  const findings = project.findings.length;
  // Valutazioni (pagina propria): gli agenti usati non ancora valutati; la scheda c'è solo con le valutazioni accese.
  const toRate = rating ? new Set(activity.map((a) => a.id).filter((id) => !rating.rated.includes(id))).size : 0;
  $("tab-ratings").hidden = !rating;
  $("count-ratings").textContent = toRate ? String(toRate) : "";
  $("count-ratings").parentElement.setAttribute("aria-label", TEXTS.ratingsLabel(toRate));
  $("count-session").textContent = waiting ? String(waiting) : "";
  $("count-findings").textContent = String(findings);
  // Il solo numero non dice cosa conta: il nome completo è per i lettori di schermo.
  $("count-session").parentElement.setAttribute("aria-label", TEXTS.sessionLabel(waiting));
  $("count-findings").parentElement.setAttribute("aria-label", TEXTS.findingsLabel(findings));
}

// Consumo (F24): tabelle con una barra per riga, così grafico e tabella equivalente sono la stessa cosa.
// I token sono misurati; i dollari sono equivalenti ai prezzi API del listino; il risparmio del modello è una stima.
const nf = new Intl.NumberFormat(TEXTS.locale);
const tokens = (n) => (n >= 1e6 ? `${(n / 1e6).toLocaleString(TEXTS.locale, { maximumFractionDigits: 1 })} M` : n >= 1e3 ? `${Math.round(n / 1e3)} k` : nf.format(n));
const usd = (n) => n.toLocaleString(TEXTS.locale, { style: "currency", currency: "USD", maximumFractionDigits: n < 1 ? 3 : 2 });
const pct = (n) => `${Math.round(n * 100)}%`;
const spent = (t) => t.totalInput + t.output;

function tile(label, value, note) {
  return el("div", { class: "tile" }, el("span", { class: "tile-label" }, label), el("strong", { class: "tile-value" }, value), note && el("span", { class: "tile-note" }, note));
}

// La CSP del pannello blocca gli attributi style: la larghezza passa dal CSSOM, che è permesso.
function bar(share) {
  const node = el("span", { class: "bar", "aria-hidden": "true" });
  node.style.setProperty("--w", `${(share * 100).toFixed(1)}%`);
  return node;
}

function usageTable(rows, label, keyLabel) {
  if (rows.length === 0) return empty(TEXTS.noData);
  const max = Math.max(...rows.map((r) => spent(r.totals)), 1);
  return table(
    TEXTS.usageHead(keyLabel),
    rows.map((r) =>
      el(
        "tr",
        {},
        el("th", { scope: "row", class: "mono" }, label(r.key)),
        el(
          "td",
          { class: "bar-cell" },
          bar(spent(r.totals) / max),
          el("span", { class: "bar-value" }, tokens(spent(r.totals))),
        ),
        el("td", {}, pct(r.totals.cacheShare)),
        el("td", {}, usd(r.totals.costUsd)),
        el("td", {}, usd(r.totals.cacheSavingUsd)),
        el("td", {}, r.totals.modelSavingUsd > 0 ? usd(r.totals.modelSavingUsd) : "—"),
      ),
    ),
  );
}

async function renderUsage() {
  const response = await fetch("/api/usage").catch(() => null);
  const report = response && response.ok ? await response.json() : null;
  if (!report) {
    $("usage-summary").replaceChildren(empty(TEXTS.usageUnreadable));
    return;
  }
  const t = report.total;
  $("usage-summary").replaceChildren(
    t.requests === 0
      ? empty(TEXTS.noClaudeFiles)
      : el(
          "div",
          { class: "tiles" },
          tile(TEXTS.tileSpent, tokens(spent(t)), TEXTS.tileSpentNote(nf.format(t.requests))),
          tile(TEXTS.tileCache, pct(t.cacheShare), TEXTS.tileCacheNote),
          tile(TEXTS.tileCacheSaving, usd(t.cacheSavingUsd), TEXTS.tileCacheSavingNote),
          tile(TEXTS.tileModelSaving, t.modelSavingUsd > 0 ? usd(t.modelSavingUsd) : "—", TEXTS.tileModelSavingNote),
        ),
    el("p", { class: "hint" }, TEXTS.pricesHint(report.prices.date)),
    ...(report.skipped > 0 ? [el("p", { class: "hint" }, TEXTS.skipped(report.skipped))] : []),
  );
  const short = (key) => (/^[0-9a-f-]{36}$/.test(key) ? key.slice(0, 8) : key);
  $("usage-day").replaceChildren(usageTable(report.byDay, (k) => k, TEXTS.day));
  $("usage-agent").replaceChildren(usageTable(report.byAgent, (k) => (k === "sessione" ? TEXTS.mainConversation : k), TEXTS.agent));
  $("usage-model").replaceChildren(usageTable(report.byModel, (k) => k, TEXTS.model));
  $("usage-session").replaceChildren(usageTable(report.bySession.slice(0, 15), short, TEXTS.session));
}

// Totali di token (F27): l'anteprima mostra le righe esatte; «Conferma l'invio» manda solo il codice dell'anteprima.
const post = (path, body) =>
  fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    .then((r) => r.json())
    .catch(() => null);

async function previewShare() {
  const preview = await post("/api/share/preview", {});
  if (!preview) {
    $("share-body").replaceChildren(el("p", { class: "error", role: "alert" }, TEXTS.noResponse));
    return;
  }
  if (preview.rows.length === 0) {
    $("share-body").replaceChildren(empty(TEXTS.nothingToShare));
    return;
  }
  const status = el("p", { role: "status" });
  const confirm = el("button", { type: "button", class: "send" }, TEXTS.confirmShare);
  confirm.addEventListener("click", async () => {
    confirm.disabled = true;
    const result = await post("/api/share", { code: preview.code });
    status.className = result?.ok ? "sent" : "error";
    status.textContent = result?.ok ? TEXTS.shared(result.rows) : (result?.message ?? TEXTS.noResponse);
  });
  $("share-body").replaceChildren(
    el("p", {}, TEXTS.shareHead(preview.rows.length, preview.version)),
    table(
      TEXTS.shareColumns,
      preview.rows.map((r) =>
        el("tr", {}, el("th", { scope: "row", class: "mono" }, r.day), ...[r.agent, r.model, r.effort].map((v) => el("td", {}, v)), ...[r.input, r.output, r.cacheRead, r.cacheWrite].map((v) => el("td", {}, nf.format(v)))),
      ),
    ),
    ...(preview.omitted > 0 ? [el("p", { class: "hint" }, TEXTS.shareOmitted(preview.omitted))] : []),
    el("p", { class: "hint" }, preview.notice),
    confirm,
    status,
  );
}

// Una vista per volta, scelta dall'hash: avanti e indietro del browser funzionano senza toccare il server.
const VIEWS = ["session", "plan", "findings", "ratings", "usage"];

function showView(moveFocus) {
  const name = location.hash.slice(1);
  // Senza valutazioni (--no-ratings) la pagina non c'è: il suo indirizzo porta alla sessione.
  const allowed = VIEWS.filter((v) => v !== "ratings" || !state || state.rating);
  const current = allowed.includes(name) ? name : VIEWS[0];
  for (const view of document.querySelectorAll(".view")) view.hidden = view.dataset.view !== current;
  for (const tab of document.querySelectorAll(".tabs a")) {
    if (tab.dataset.view === current) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  if (moveFocus) document.querySelector(`#view-${current} h1`).focus();
  if (current === "usage") renderUsage();
  if (state) $("share").hidden = !state.rating;
}

// Avvisi (F34): un agente nuovo in uso o un agente in più da valutare. Nella pagina sempre; con il permesso del browser
// anche come notifica di sistema, quando la scheda del pannello non è in vista.
let seen = null;
let pendingRatings = null;

function notify(text) {
  const toast = $("toast");
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => (toast.hidden = true), 8000);
  if (document.visibilityState !== "visible" && "Notification" in window && Notification.permission === "granted") {
    new Notification(TITLE, { body: text });
  }
}

function watchChanges({ activity, rating }) {
  const keys = new Set(activity.map((a) => `${a.id} ${a.time}`));
  const toRate = rating ? new Set(activity.map((a) => a.id).filter((id) => !rating.rated.includes(id))).size : 0;
  if (seen) {
    const added = activity.filter((a) => !seen.has(`${a.id} ${a.time}`));
    if (added.length > 0) notify(TEXTS.newAgent(added[0].codeName));
    else if (toRate > pendingRatings) notify(TEXTS.toRate(toRate));
  }
  seen = keys;
  pendingRatings = toRate;
}

function renderNotifyButton() {
  const button = $("notify");
  button.hidden = !("Notification" in window) || Notification.permission !== "default";
}

function render() {
  if (!state) return;
  watchChanges(state);
  renderNotifyButton();
  renderHeader(state);
  renderCounts(state);
  renderQuestions(state);
  renderActivity(state);
  renderSubagents(state);
  renderRatings(state);
  renderPhases(state);
  if (location.hash === "#ratings" && !state.rating) showView(false);
  renderFilters();
  renderFindings(state);
  $("share").hidden = !state.rating;
}

async function refresh() {
  const response = await fetch("/api/state").catch(() => null);
  if (!response || !response.ok) return;
  state = await response.json();
  render();
}

function connect() {
  const link = $("link");
  const events = new EventSource("/api/events");
  events.onopen = () => {
    link.dataset.state = "ok";
    link.textContent = TEXTS.linked;
    refresh();
  };
  events.addEventListener("change", refresh);
  events.onerror = () => {
    link.dataset.state = "off";
    link.textContent = TEXTS.unlinked;
  };
}

window.addEventListener("hashchange", () => showView(true));
$("notify").addEventListener("click", () => Notification.requestPermission().then(renderNotifyButton));
$("usage-refresh").addEventListener("click", renderUsage);
$("share-preview").addEventListener("click", previewShare);
showView(false);
connect();
refresh();
setInterval(() => document.visibilityState === "visible" && refresh(), REFRESH_MS);
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && refresh());
