// Pagina del pannello: legge /api/state, si aggiorna con /api/events e manda le risposte a /api/answer e i voti a /api/rate.
// I dati del progetto entrano nel DOM solo come testo (textContent), mai come HTML.
"use strict";

const DEPARTMENTS = ["AIBPD", "AICA", "AIPCA", "AISA", "AIWDA"];
const PRIORITIES = ["P0", "P1", "P2", "P3", ""];
const REFRESH_MS = 10_000;
const TITLE = "Agentrica · pannello";

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

const time = (iso) => new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
const empty = (text) => el("p", { class: "empty" }, text);

function renderHeader({ project }) {
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const files = project.git
    ? [
        project.git.changed > 0 && plural(project.git.changed, "file modificato", "file modificati"),
        project.git.untracked > 0 && plural(project.git.untracked, "nuovo", "nuovi"),
      ].filter(Boolean)
    : [];
  const git = project.git ? [` · branch ${project.git.branch}`, ...files].join(" · ") : " · non è un repository git";
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
    box.append(empty("Nessuna scelta in attesa. Quando un agente ha bisogno di te, la domanda compare qui."));
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
        el("strong", {}, option.label.replace(recommended, ""), recommended.test(option.label) && el("span", { class: "recommended" }, "Consigliata")),
        option.description,
      ),
    );
  });
  const form = el(
    "form",
    { class: "question", "data-question": question.id, onsubmit: (event) => submit(event, question, form, error) },
    question.header && el("span", { class: "tag" }, question.header),
    el("fieldset", {}, el("legend", {}, question.question), options),
    el("label", { class: "note" }, "Nota (facoltativa)", note),
    el("button", { type: "submit", class: "send" }, "Invia risposta"),
    error,
  );
  $("announce").textContent = `Nuova scelta da prendere: ${question.question}`;
  return form;
}

async function submit(event, question, form, error) {
  event.preventDefault();
  const choices = [...form.querySelectorAll("input:checked")].map((input) => input.value);
  const note = form.elements.note.value;
  if (choices.length === 0 && note.trim() === "") {
    error.textContent = "Scegli un'opzione o scrivi una nota.";
    error.hidden = false;
    return;
  }
  const response = await fetch("/api/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: question.id, choices, note }),
  }).catch(() => null);
  if (!response || !response.ok) {
    error.textContent = response ? await response.text() : "Il pannello non risponde: la sessione è ancora aperta?";
    error.hidden = false;
    return;
  }
  form.dataset.sent = "true";
  form.replaceChildren(el("p", { class: "sent", role: "status" }, `Risposta inviata: ${[...choices, note.trim()].filter(Boolean).join(", ")}`));
  setTimeout(() => {
    form.remove();
    if (state) renderQuestions(state);
  }, 5000);
}

function renderActivity({ activity }) {
  $("activity").replaceChildren(
    activity.length === 0
      ? empty("Nessun agente usato in questa sessione.")
      : el(
          "ol",
          { class: "activity" },
          activity.map((a, i) =>
            el(
              "li",
              { "data-dept": a.department, class: i === 0 ? "active" : null },
              el("time", { datetime: a.time, class: "mono" }, time(a.time)),
              el("span", { class: "dot" }, el("strong", {}, a.codeName), ` — ${a.role}, reparto ${a.department}`, i === 0 && el("span", { class: "now" }, "attivo")),
              a.task && el("span", { class: "task" }, a.task),
            ),
          ),
        ),
  );
}

// Un modulo per agente usato, creato una volta sola: un aggiornamento non deve cancellare un commento a metà.
function renderRatings({ activity, rating }) {
  const card = $("ratings-card");
  card.hidden = !rating;
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
  if (!box.querySelector("[data-agent]")) box.append(empty("Quando usi un agente, qui puoi dargli un voto."));
}

const ratedNote = (agent) => el("p", { class: "sent", "data-agent": agent.id, "data-dept": agent.department }, el("strong", {}, agent.codeName), " — valutato in questa sessione.");

function rateForm(agent, rating) {
  const name = `r-${agent.id}`;
  const error = el("p", { class: "error", role: "alert", hidden: true });
  const stars = [1, 2, 3, 4, 5].map((n) =>
    el("label", { class: "star" }, el("input", { type: "radio", name, value: String(n) }), el("span", {}, `${n}`)),
  );
  const form = el(
    "form",
    { class: "question", "data-agent": agent.id, "data-dept": agent.department, onsubmit: (event) => sendRating(event, agent, form, error) },
    el(
      "fieldset",
      {},
      el("legend", {}, el("span", { class: "dot" }, el("strong", {}, agent.codeName)), ` — ${agent.role}, reparto ${agent.department}. Voto da 1 a 5:`),
      el("div", { class: "stars" }, stars),
    ),
    el("label", { class: "note" }, "Cosa è andato bene o cosa migliorare (facoltativo)", el("textarea", { name: "comment", maxlength: String(rating.maxComment) })),
    el("label", { class: "check" }, el("input", { type: "checkbox", name: "publish" }), "Puoi pubblicare il mio commento sul sito di Agentrica"),
    el("p", { class: "hint" }, rating.notice),
    el("button", { type: "submit", class: "send" }, "Invia la valutazione"),
    error,
  );
  return form;
}

async function sendRating(event, agent, form, error) {
  event.preventDefault();
  const picked = form.querySelector("input[type=radio]:checked");
  if (!picked) {
    error.textContent = "Scegli un voto da 1 a 5.";
    error.hidden = false;
    return;
  }
  const body = { agentId: agent.id, rating: Number(picked.value), comment: form.elements.comment.value, publish: form.elements.publish.checked };
  const response = await fetch("/api/rate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const result = response ? await response.json().catch(() => null) : null;
  if (!result?.ok) {
    error.textContent = result?.message ?? (response ? "Valutazione non valida." : "Il pannello non risponde: la sessione è ancora aperta?");
    error.hidden = false;
    return;
  }
  form.dataset.sent = "true";
  form.replaceChildren(
    el("p", { class: "sent", role: "status" }, `Valutazione di ${agent.codeName} inviata, grazie. Codice della valutazione: `, el("code", {}, result.usageId), ". Conservalo per chiedere di cancellarla o di non pubblicare il commento."),
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
          el("h3", {}, "Backlog"),
          open.tasks.length
            ? table(
                ["Task", "Descrizione", "Priorità", "Stato"],
                open.tasks.map((t) =>
                  el(
                    "tr",
                    {},
                    el("th", { scope: "row", class: "mono" }, t.id),
                    el("td", {}, inline(t.task)),
                    el("td", {}, t.priority),
                    el("td", { class: t.done ? "status-done" : "" }, t.done ? "Fatto" : "Da fare"),
                  ),
                ),
              )
            : empty("Backlog non ancora scritto."),
          open.criteria.length > 0 && el("h3", {}, "Criteri di accettazione"),
          open.criteria.length > 0 && el("ul", { class: "criteria" }, open.criteria.map((c) => el("li", {}, inline(c)))),
        ]
      : [empty("Nessuna fase in corso: tutte le fasi sono completate, sospese o da aprire.")]),
  );
  $("phases").replaceChildren(
    project.phases.length === 0
      ? empty("Nessuna fase trovata in plan/README.md.")
      : table(
          ["Fase", "Contenuto", "Stato"],
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
        el("button", { type: "button", "data-code": code, onclick: () => ((filter = code), render()) }, code || "Tutti"),
      ),
    );
  }
  for (const button of box.children) button.setAttribute("aria-pressed", String(button.dataset.code === filter));
}

const LABELS = { P0: "P0 · critica", P1: "P1 · alta", P2: "P2 · media", P3: "P3 · bassa", "": "Senza priorità" };

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
    ...(shown.length ? groups.filter(Boolean) : [empty(filter ? `Nessun rilievo di ${filter}.` : "Nessun rilievo.")]),
    el("p", { class: "hint" }, "In ogni gruppo prima i «Rilievi aperti» dei file di fase, poi i rilievi degli audit con il loro stato. Quelli segnati come risolti o chiusi non compaiono."),
  );
}

function renderCounts({ project, questions }) {
  const waiting = questions.length;
  const findings = project.findings.length;
  $("count-sessione").textContent = waiting ? String(waiting) : "";
  $("count-rilievi").textContent = String(findings);
  // Il solo numero non dice cosa conta: il nome completo è per i lettori di schermo.
  $("count-sessione").parentElement.setAttribute("aria-label", waiting ? `Sessione, ${waiting} da decidere` : "Sessione");
  $("count-rilievi").parentElement.setAttribute("aria-label", `Rilievi, ${findings} aperti`);
}

// Una vista per volta, scelta dall'hash: avanti e indietro del browser funzionano senza toccare il server.
const VIEWS = ["sessione", "piano", "rilievi"];

function showView(moveFocus) {
  const name = location.hash.slice(1);
  const current = VIEWS.includes(name) ? name : VIEWS[0];
  for (const view of document.querySelectorAll(".view")) view.hidden = view.dataset.view !== current;
  for (const tab of document.querySelectorAll(".tabs a")) {
    if (tab.dataset.view === current) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  if (moveFocus) document.querySelector(`#view-${current} h1`).focus();
}

function render() {
  if (!state) return;
  renderHeader(state);
  renderCounts(state);
  renderQuestions(state);
  renderActivity(state);
  renderRatings(state);
  renderPhases(state);
  renderFilters();
  renderFindings(state);
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
    link.textContent = "Sessione collegata";
    refresh();
  };
  events.addEventListener("change", refresh);
  events.onerror = () => {
    link.dataset.state = "off";
    link.textContent = "Collegamento con la sessione interrotto. Riavvia la sessione di Claude Code per riaprire il pannello.";
  };
}

window.addEventListener("hashchange", () => showView(true));
showView(false);
connect();
refresh();
setInterval(() => document.visibilityState === "visible" && refresh(), REFRESH_MS);
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && refresh());
