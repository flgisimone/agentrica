// Pagina del pannello (i testi in TEXTS, da texts.<lingua>.js che il server serve come /texts.js): legge /api/state (con l'avviso di versione nuova, F23), si aggiorna con /api/events e manda le risposte a /api/answer, i voti a /api/rate e, da F27, i totali di token a /api/share.
// I dati del progetto entrano nel DOM solo come testo (textContent), mai come HTML.
"use strict";

const DEPARTMENTS = ["AIBPD", "AICA", "AIPCA", "AISA", "AIWDA"];
const PRIORITIES = ["P0", "P1", "P2", "P3", ""];
const REFRESH_MS = 10_000;
const TITLE = TEXTS.title;

let state = null;
let filter = "";
let prioFilter = "";
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

/** Cambia il testo solo se è diverso: una regione live non si rilegge a ogni aggiornamento (F46-08). */
function setText(node, text) {
  if (node.textContent !== text) node.textContent = text;
}

function renderHeader({ project, version }) {
  const files = project.git
    ? [project.git.changed > 0 && TEXTS.changed(project.git.changed), project.git.untracked > 0 && TEXTS.untracked(project.git.untracked)].filter(Boolean)
    : [];
  const git = project.git ? [TEXTS.branch(project.git.branch), ...files].join(" · ") : TEXTS.noGit;
  setText($("project"), project.name + git);
  setText($("version"), version ? `v${version}` : "");
}

// Avvisi (F46-02): una zona sola sopra le viste, una riga per tipo con titolo, conteggio e azione suggerita; i punti
// file:riga a scomparsa, come testo da copiare. Versione nuova (F23), plan/ senza agente (F39-02), piano da creare (F35),
// errori di formato e contraddizioni (F42, F44-06). Si ridisegna solo quando cambia, e annuncia solo i tipi nuovi.
const openAlerts = new Set();
let alertsKey = null;

function renderAlerts({ project, update, noAgent }) {
  const { problems, contradictions } = project;
  const alerts = [
    update && { kind: "update", title: TEXTS.newVersion, text: update },
    noAgent && { kind: "agent", title: TEXTS.noAgent, text: TEXTS.noAgentAction },
    project.notice && { kind: "notice", title: TEXTS.noPlan, text: project.notice },
    problems.length > 0 && { kind: "error", title: TEXTS.formatErrors(problems.length), text: TEXTS.formatAction, items: problems },
    contradictions.length > 0 && { kind: "contradiction", title: TEXTS.contradictions(contradictions.length), text: TEXTS.contradictionsAction, items: contradictions },
  ].filter(Boolean);
  const key = JSON.stringify(alerts);
  if (key === alertsKey) return;
  // Al primo caricamento non si annuncia nulla: la zona è già la prima cosa della pagina.
  const before = alertsKey === null ? null : new Set(JSON.parse(alertsKey).map((a) => a.kind));
  const added = before ? alerts.filter((a) => !before.has(a.kind)) : [];
  if (added.length > 0) $("announce").textContent = added.map((a) => TEXTS.newAlert(a.title)).join(". ");
  alertsKey = key;
  $("alerts").hidden = alerts.length === 0;
  $("alert-list").replaceChildren(...alerts.map(alertItem));
}

function alertItem(a) {
  return el(
    "li",
    { class: "alert", "data-kind": a.kind },
    el("p", {}, el("strong", {}, a.title), ". ", a.text),
    a.items &&
      el(
        "details",
        { open: openAlerts.has(a.kind), ontoggle: (e) => (e.currentTarget.open ? openAlerts.add(a.kind) : openAlerts.delete(a.kind)) },
        el("summary", {}, TEXTS.where(a.items.length)),
        el("ul", { class: "issues mono" }, a.items.map((item) => el("li", {}, item))),
      ),
  );
}

/** Gli agenti usati e non ancora valutati: zero con le valutazioni spente. */
const pendingRatings = ({ activity, rating }) => (rating ? new Set(activity.map((a) => a.id).filter((id) => !rating.rated.includes(id))).size : 0);

// Le domande non si ridisegnano a ogni aggiornamento: una scelta a metà resterebbe persa.
// In cima alla Sessione (F46-03) il riquadro di attenzione: domande aperte e agenti da valutare, solo quando ci sono.
function renderQuestions(s) {
  const { questions } = s;
  const box = $("questions");
  const ids = new Set(questions.map((q) => q.id));
  for (const node of [...box.querySelectorAll("[data-question]")]) {
    if (!ids.has(node.dataset.question) && !node.dataset.sent) node.remove();
  }
  for (const question of questions) {
    if (!box.querySelector(`[data-question="${CSS.escape(question.id)}"]`)) box.append(questionCard(question));
  }
  const waiting = questions.length;
  const toRate = pendingRatings(s);
  const asking = Boolean(box.querySelector("[data-question]"));
  $("rate-hint").hidden = toRate === 0;
  setText($("rate-link"), toRate ? TEXTS.rateLink(toRate) : "");
  $("attention").hidden = !asking && toRate === 0;
  $("calm").hidden = asking;
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

// Gli agenti in uso (F34-07): una scheda per chiamata, con il numero d'ordine, il direttore segnato, l'ultimo attivo,
// il compito e il resoconto. La Sessione mostra le ultime tre; la pagina Agenti tutte, per reparto o in una mappa (F52).
const RECENT = 3;

/** Lo stato del resoconto: il testo, «coordina il reparto» per un direttore il cui reparto lavora ancora, o la mancanza. */
function reportBlock(a, i, chain) {
  const key = `r ${a.id} ${a.time}`;
  if (a.report) {
    return el(
      "details",
      { class: "report", open: openTasks.has(key), ontoggle: (e) => (e.currentTarget.open ? openTasks.add(key) : openTasks.delete(key)) },
      el("summary", {}, TEXTS.report),
      el("p", {}, a.report),
    );
  }
  if (i === chain.length - 1) return null;
  if (a.director && dept(chain[chain.length - 1]) === dept(a)) return el("span", { class: "task muted" }, TEXTS.coordinating);
  return el("span", { class: "task muted" }, TEXTS.noReport);
}

/** La scheda di una chiamata; con `calls` (F52-02) è la riga di un agente: i numeri di tutte le sue chiamate e ×N. */
function agentCard(a, i, chain, calls) {
  const last = i === chain.length - 1;
  const n = calls ? calls.length : 1;
  return el(
    "article",
    { class: `agent${last ? " active" : ""}`, "data-dept": dept(a), "aria-label": calls ? TEXTS.rowLabel(a.codeName, n) : TEXTS.cardLabel(i + 1, a.codeName) },
    el(
      "p",
      { class: "agent-head" },
      n === 1 && [el("span", { class: "order mono" }, `#${i + 1}`), " "],
      el("strong", { class: "dot" }, a.codeName),
      n > 1 && [" ", el("span", { class: "times mono", "aria-hidden": "true" }, `×${n}`)],
      // Lo spazio separa le parole anche nel testo copiato e per i lettori di schermo (il margine non basta).
      a.director && [" ", el("span", { class: "tag" }, TEXTS.director)],
      last && [" ", el("span", { class: "now" }, TEXTS.active)],
    ),
    // I numeri di tutte le chiamate su una riga a parte: nell'intestazione spezzerebbero il nome.
    n > 1 && el("p", { class: "order mono" }, calls.map(([, k]) => `#${k + 1}`).join(" · ")),
    el("p", { class: "agent-role" }, `${a.role}${TEXTS.department(a.department)} · `, el("time", { datetime: a.time }, time(a.time))),
    a.task && taskBlock(`${a.id} ${a.time}`, a.task),
    reportBlock(a, i, chain),
    n > 1 && earlierCalls(a.id, calls.slice(0, -1), chain),
  );
}

/** Le chiamate prima dell'ultima, a scomparsa: orario, compito e resoconto di ognuna. */
function earlierCalls(id, calls, chain) {
  const key = `e ${id}`;
  return el(
    "details",
    { class: "earlier", open: openTasks.has(key), ontoggle: (e) => (e.currentTarget.open ? openTasks.add(key) : openTasks.delete(key)) },
    el("summary", {}, TEXTS.earlier(calls.length)),
    el(
      "ol",
      {},
      calls.map(([a, i]) =>
        el(
          "li",
          {},
          el("p", { class: "agent-role" }, el("span", { class: "order mono" }, `#${i + 1}`), " · ", el("time", { datetime: a.time }, time(a.time))),
          a.task && taskBlock(`${a.id} ${a.time}`, a.task),
          reportBlock(a, i, chain),
        ),
      ),
    ),
  );
}

function renderActivity({ activity }) {
  const chain = [...activity].reverse();
  const from = Math.max(0, chain.length - RECENT);
  $("activity").replaceChildren(
    ...(chain.length === 0
      ? [empty(TEXTS.noActivity)]
      : [
          el("ol", { class: "cards" }, chain.slice(from).map((a, k) => el("li", {}, agentCard(a, from + k, chain)))),
          el("p", { class: "more" }, el("a", { href: "#agents" }, TEXTS.allAgents(chain.length))),
        ]),
  );
  // La pagina Agenti si ridisegna solo quando cambiano le chiamate: il focus e lo scorrimento della mappa restano (F52-01).
  const key = JSON.stringify(activity);
  if (key === agentsKey) return;
  agentsKey = key;
  renderTree(chain);
  renderMap(chain);
}

let agentsKey = null;

/**
 * Per reparto (F52-02): una colonna per reparto, nell'ordine in cui è entrato, anche se torna (i ritorni sono nella mappa);
 * dentro una riga per agente, nell'ordine della prima chiamata, con l'ultima chiamata intera e le precedenti a scomparsa.
 * La pagina cresce con gli agenti, non con le chiamate.
 */
function renderTree(chain) {
  const columns = new Map();
  chain.forEach((a, i) => {
    if (!columns.has(dept(a))) columns.set(dept(a), { dept: dept(a), name: a.department, agents: new Map() });
    const agents = columns.get(dept(a)).agents;
    if (!agents.has(a.id)) agents.set(a.id, []);
    agents.get(a.id).push([a, i]);
  });
  $("tree").replaceChildren(
    columns.size === 0
      ? empty(TEXTS.noActivity)
      : el(
          "ol",
          { class: "tree" },
          [...columns.values()].map((c) =>
            el(
              "li",
              { class: "column", "data-dept": c.dept },
              el("h3", {}, c.name),
              el(
                "ol",
                { class: "cards" },
                [...c.agents.values()].map((calls) => {
                  const [a, i] = calls[calls.length - 1];
                  return el("li", {}, agentCard(a, i, chain, calls));
                }),
              ),
            ),
          ),
        ),
  );
}

// Mappa (F52-03): una corsia per reparto, un cerchio per chiamata da sinistra a destra, frecce fra un passaggio e il
// successivo. Il disegno è nascosto ai lettori di schermo: lo ripete l'elenco «I passaggi in ordine». Il contenitore che
// scorre si crea una volta sola e resta, così un aggiornamento non toglie il focus.
const SVG_NS = "http://www.w3.org/2000/svg";
const LANE = 44;
const STEP = 46;
const PAD = 26;
const R = 14;

function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  node.append(...children.filter(Boolean));
  return node;
}

function mapShell() {
  const box = $("map");
  if (!box.firstChild) {
    const summary = el("summary", {});
    box.append(
      el(
        "div",
        { class: "map", id: "map-body" },
        el("ol", { class: "lanes", id: "map-lanes", "aria-hidden": "true" }),
        el("div", { class: "map-scroll", id: "map-scroll", tabindex: "0", role: "region", "aria-label": TEXTS.mapLabel }),
      ),
      el(
        "details",
        { class: "steps", open: openTasks.has("steps"), ontoggle: (e) => (e.currentTarget.open ? openTasks.add("steps") : openTasks.delete("steps")) },
        summary,
        el("ol", { id: "map-steps" }),
      ),
      el("p", { class: "empty", id: "map-empty" }, TEXTS.noActivity),
      el("p", { class: "hint", id: "map-limit", hidden: true }, TEXTS.mapLimit),
    );
  }
  return box;
}

function renderMap(chain) {
  const box = mapShell();
  const lanes = [...new Set(chain.map(dept))];
  $("map-empty").hidden = chain.length > 0;
  $("map-body").hidden = chain.length === 0;
  box.querySelector(".steps").hidden = chain.length === 0;
  // Il server tiene le ultime 100 chiamate (MAX_ACTIVITY in panel.ts): oltre, i primi passaggi non ci sono più.
  $("map-limit").hidden = chain.length < 100;
  if (chain.length === 0) return;
  const at = (i) => [PAD + i * STEP, lanes.indexOf(dept(chain[i])) * LANE + LANE / 2];
  const width = PAD * 2 + (chain.length - 1) * STEP;
  const height = lanes.length * LANE;
  const edges = chain.slice(1).map((_, k) => {
    const [x1, y1] = at(k);
    const [x2, y2] = at(k + 1);
    const d = y1 === y2 ? `M${x1 + R} ${y1}H${x2 - R - 2}` : `M${x1 + R} ${y1}C${x1 + R + 14} ${y1} ${x2 - R - 16} ${y2} ${x2 - R - 2} ${y2}`;
    return svg("path", { d, class: "map-edge", "marker-end": "url(#map-arrow)" });
  });
  const nodes = chain.map((a, i) => {
    const [x, y] = at(i);
    return svg(
      "g",
      { class: i === chain.length - 1 ? "map-node active" : "map-node", "data-dept": dept(a) },
      svg("title", {}, `#${i + 1} ${a.codeName} — ${a.role} · ${time(a.time)}`),
      a.director && svg("circle", { cx: x, cy: y, r: R + 4, class: "map-ring" }),
      svg("circle", { cx: x, cy: y, r: R }),
      svg("text", { x, y, "text-anchor": "middle", "dominant-baseline": "central" }, `${i + 1}`),
    );
  });
  const drawing = svg(
    "svg",
    { width, height, viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true", focusable: "false" },
    svg("defs", {}, svg("marker", { id: "map-arrow", viewBox: "0 0 8 8", refX: 7, refY: 4, markerWidth: 6, markerHeight: 6, orient: "auto" }, svg("path", { d: "M0 0L8 4L0 8z", class: "map-arrowhead" }))),
    ...lanes.map((_, n) => svg("rect", { x: 0, y: n * LANE, width, height: LANE, class: n % 2 ? "map-lane" : "map-lane odd" })),
    ...edges,
    ...nodes,
  );
  const scroll = $("map-scroll");
  // Chi guarda l'ultimo passaggio continua a vederlo quando ne arriva uno nuovo.
  const atEnd = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 4;
  // Prima le sigle: una corsia nuova allarga la loro colonna e restringe l'area che scorre (prova di QA di F52).
  $("map-lanes").replaceChildren(...lanes.map((d) => el("li", { "data-dept": d }, el("span", { class: "dot" }, d))));
  scroll.replaceChildren(drawing);
  if (atEnd) scroll.scrollLeft = scroll.scrollWidth;
  setText(box.querySelector(".steps summary"), TEXTS.steps(chain.length));
  $("map-steps").replaceChildren(
    ...chain.map((a, i) => {
      const back = i > 0 && dept(chain[i - 1]) !== dept(a) && chain.slice(0, i).some((b) => dept(b) === dept(a));
      const marks = [a.director && TEXTS.director, back && TEXTS.back, i === chain.length - 1 && TEXTS.active].filter(Boolean);
      return el(
        "li",
        { "data-dept": dept(a) },
        el("strong", { class: "dot" }, a.codeName),
        ` — ${a.role}${TEXTS.department(a.department)} · `,
        el("time", { datetime: a.time }, time(a.time)),
        marks.length > 0 && ` · ${marks.join(" · ")}`,
      );
    }),
  );
}

// Per reparto o Mappa, dall'indirizzo (#agents/dept o #agents/map): la scelta resta dopo gli aggiornamenti e, tornando
// con la scheda «Agenti» (#agents), anche dopo aver visto un'altra pagina.
let agentsSub = "dept";

function showAgentsView(sub) {
  if (sub === "map" || sub === "dept") agentsSub = sub;
  const map = agentsSub === "map";
  $("agents-dept").hidden = map;
  $("agents-map").hidden = !map;
  for (const button of $("agents-views").querySelectorAll("button")) button.setAttribute("aria-pressed", String((button.dataset.sub === "map") === map));
  const scroll = $("map-scroll");
  if (map && scroll) scroll.scrollLeft = scroll.scrollWidth;
}

// I subagent di Claude Code (F34-06), a parte: non passano dal server, il pannello li legge dai file di Claude Code.
// Se Claude Code cambia il formato dei suoi file (F34-R3) il subagent compare lo stesso, con una nota: non sparisce.
function renderSubagents({ subagents = [] }) {
  const unknown = subagents.filter((s) => !s.recognized).length;
  const state = (s) => (!s.recognized ? TEXTS.subagentUnknown : s.finished ? TEXTS.subagentDone : TEXTS.subagentRunning);
  // replaceChildren, a differenza di el(), scriverebbe «false»: i nodi assenti si tolgono prima.
  const note = unknown > 0 ? [el("p", { class: "problems" }, TEXTS.subagentFormat(unknown))] : [];
  $("subagents").replaceChildren(
    ...note,
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

/** `classes[i]` va sull'intestazione della colonna i (le celle lo ripetono da sé): «extra» la nasconde sul telefono. */
function table(head, rows, classes = []) {
  return el(
    "div",
    { class: "scroll" },
    el("table", {}, el("thead", {}, el("tr", {}, head.map((h, i) => el("th", { scope: "col", class: classes[i] }, h)))), el("tbody", {}, rows)),
  );
}

// Lo stato di una fase vale per la prima parola: «completata (0.10.0)» è completata (F46-UX-01).
const COMPLETED = /^(completata|completed)\b/i;

/** Avanzamento (F46-05): il conteggio scritto e una barra che lo ripete, nascosta ai lettori di schermo. */
function progress(done, total, label) {
  return el("div", { class: "progress" }, el("p", {}, label), el("progress", { max: String(total), value: String(done), "aria-hidden": "true" }));
}

/** La priorità del backlog: il codice nella sua colonna, la motivazione («P1 — …») sotto l'attività. */
function splitPriority(text) {
  const match = /^(P[0-3])\s*[—–-]?\s*(.*)$/.exec(text);
  return match ? [match[1], match[2]] : [text, ""];
}

function renderPhases({ project }) {
  const open = project.openPhase;
  const doneTasks = open ? open.tasks.filter((t) => t.done).length : 0;
  $("open-phase").replaceChildren(
    ...(open
      ? [
          el("h3", {}, inline(open.title), ` — ${open.status}`),
          open.goal && el("p", { class: "goal" }, inline(open.goal)),
          el("h3", {}, TEXTS.backlog),
          open.tasks.length > 0 && progress(doneTasks, open.tasks.length, TEXTS.tasksProgress(doneTasks, open.tasks.length)),
          open.tasks.length
            ? table(
                TEXTS.taskHead,
                open.tasks.map((t) => {
                  const [code, why] = splitPriority(t.priority);
                  return el(
                    "tr",
                    {},
                    el("th", { scope: "row", class: "mono" }, t.id),
                    el("td", {}, inline(t.task), why && el("span", { class: "finding-meta" }, inline(why))),
                    el("td", {}, code),
                    el("td", { class: t.done ? "state status-done" : "state" }, t.done ? `✓ ${TEXTS.done}` : TEXTS.todo),
                  );
                }),
              )
            : empty(TEXTS.noBacklog),
          open.criteria.length > 0 && el("h3", {}, TEXTS.criteria),
          open.criteria.length > 0 && el("ul", { class: "criteria" }, open.criteria.map((c) => el("li", {}, inline(c)))),
        ]
      : [empty(TEXTS.noOpenPhase)]),
  );
  const completed = project.phases.filter((p) => COMPLETED.test(p.status)).length;
  $("phases-progress").replaceChildren(
    project.phases.length === 0 ? empty(TEXTS.noPhases) : progress(completed, project.phases.length, TEXTS.phasesProgress(completed, project.phases.length)),
  );
  $("phases-list").hidden = project.phases.length === 0;
  $("phases").replaceChildren(
    project.phases.length === 0
      ? ""
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
// Da F46-06 anche per priorità, accanto al reparto.
function renderFilters() {
  const groups = [
    [$("filters"), TEXTS.byDepartment, ["", ...DEPARTMENTS], TEXTS.all, () => filter, (code) => (filter = code)],
    [$("prio-filters"), TEXTS.byPriority, ["", "P0", "P1", "P2", "P3"], TEXTS.allPriorities, () => prioFilter, (code) => (prioFilter = code)],
  ];
  for (const [box, label, codes, all, current, pick] of groups) {
    if (!box.firstChild) {
      // L'etichetta visibile ripete quella del gruppo (aria-label): per i lettori di schermo basta una volta.
      box.append(
        el("span", { class: "filter-label", "aria-hidden": "true" }, label),
        ...codes.map((code) => el("button", { type: "button", "data-code": code, onclick: () => (pick(code), render()) }, code || all)),
      );
    }
    for (const button of box.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.code === current()));
  }
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
  const shown = project.findings.filter((f) => (!filter || f.department === filter) && (!prioFilter || f.priority === prioFilter));
  const fromPhases = (f) => !f.source.endsWith(".json");
  const groups = PRIORITIES.map((priority) => {
    const items = shown.filter((f) => f.priority === priority).sort((a, b) => fromPhases(b) - fromPhases(a));
    if (items.length === 0) return null;
    const details = el(
      "details",
      // Con il filtro per priorità il solo gruppo rimasto è aperto.
      { open: Boolean(prioFilter || opened[priority]), ontoggle: () => prioFilter || (opened[priority] = details.open) },
      el("summary", {}, el("span", { class: `prio prio-${priority}` }, LABELS[priority]), ` (${items.length})`),
      el("ul", { class: "findings" }, items.map(findingItem)),
    );
    return details;
  });
  $("findings").replaceChildren(
    ...(shown.length ? groups.filter(Boolean) : [empty(filter || prioFilter ? TEXTS.noFindingsHere : TEXTS.noFindings)]),
    el("p", { class: "hint" }, TEXTS.findingsHint),
  );
}

function renderCounts({ project, questions, activity, rating }) {
  const waiting = questions.length;
  const findings = project.findings.length;
  // Valutazioni (pagina propria): gli agenti usati non ancora valutati; la scheda c'è solo con le valutazioni accese.
  const toRate = pendingRatings({ activity, rating });
  $("tab-ratings").hidden = !rating;
  setText($("count-ratings"), toRate ? String(toRate) : "");
  $("count-ratings").parentElement.setAttribute("aria-label", TEXTS.ratingsLabel(toRate));
  setText($("count-agents"), activity.length ? String(activity.length) : "");
  setText($("count-session"), waiting ? String(waiting) : "");
  setText($("count-findings"), String(findings));
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

// F46-07: la colonna del risparmio del modello c'è solo se qualche riga ha un valore; sul telefono si vedono chiave,
// token, cache e costo, i due risparmi dalla larghezza media («extra»).
function usageTable(rows, label, keyLabel) {
  if (rows.length === 0) return empty(TEXTS.noData);
  const max = Math.max(...rows.map((r) => spent(r.totals)), 1);
  const model = rows.some((r) => r.totals.modelSavingUsd > 0);
  const head = TEXTS.usageHead(keyLabel).slice(0, model ? 6 : 5);
  return table(
    head,
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
        el("td", { class: "extra" }, usd(r.totals.cacheSavingUsd)),
        model && el("td", { class: "extra" }, r.totals.modelSavingUsd > 0 ? usd(r.totals.modelSavingUsd) : "—"),
      ),
    ),
    ["", "", "", "", "extra", "extra"],
  );
}

// Il dettaglio a schede (F46-07): una tabella per volta; il rapporto resta in memoria fino al prossimo «Aggiorna».
let usage = null;
let usageGroup = "byDay";
const shortSession = (key) => (/^[0-9a-f-]{36}$/.test(key) ? key.slice(0, 8) : key);
const USAGE_GROUPS = {
  byDay: [(k) => k, TEXTS.day],
  byAgent: [(k) => (k === "sessione" ? TEXTS.mainConversation : k), TEXTS.agent],
  byModel: [(k) => k, TEXTS.model],
  bySession: [shortSession, TEXTS.session],
};

function renderUsageDetail() {
  for (const button of $("usage-groups").children) button.setAttribute("aria-pressed", String(button.dataset.group === usageGroup));
  if (!usage) return;
  const [label, keyLabel] = USAGE_GROUPS[usageGroup];
  const rows = usageGroup === "bySession" ? usage.bySession.slice(0, 15) : usage[usageGroup];
  $("usage-detail").replaceChildren(usageTable(rows, label, keyLabel));
}

async function renderUsage() {
  const response = await fetch("/api/usage").catch(() => null);
  const report = response && response.ok ? await response.json() : null;
  usage = report;
  if (!report) {
    $("usage-summary").replaceChildren(empty(TEXTS.usageUnreadable));
    $("usage-detail").replaceChildren();
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
          t.modelSavingUsd > 0 && tile(TEXTS.tileModelSaving, usd(t.modelSavingUsd), TEXTS.tileModelSavingNote),
        ),
    el("p", { class: "hint" }, TEXTS.pricesHint(report.prices.date)),
    ...(report.skipped > 0 ? [el("p", { class: "hint" }, TEXTS.skipped(report.skipped))] : []),
  );
  renderUsageDetail();
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
const VIEWS = ["session", "agents", "plan", "findings", "ratings", "usage"];

function showView(moveFocus) {
  const [name, sub] = location.hash.slice(1).split("/");
  showAgentsView(sub);
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
let lastToRate = null;

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
  const toRate = pendingRatings({ activity, rating });
  if (seen) {
    const added = activity.filter((a) => !seen.has(`${a.id} ${a.time}`));
    if (added.length > 0) notify(TEXTS.newAgent(added[0].codeName));
    else if (toRate > lastToRate) notify(TEXTS.toRate(toRate));
  }
  seen = keys;
  lastToRate = toRate;
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
  renderAlerts(state);
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
  // L'ora dei dati, non dell'ultimo disegno: un clic su un filtro non la cambia.
  setText($("updated"), TEXTS.updatedAt(time(new Date().toISOString())));
  render();
}

function connect() {
  const link = $("link");
  const events = new EventSource("/api/events");
  events.onopen = () => {
    link.dataset.state = "ok";
    setText(link, TEXTS.linked);
    refresh();
  };
  events.addEventListener("change", refresh);
  events.onerror = () => {
    link.dataset.state = "off";
    setText(link, TEXTS.unlinked);
  };
}

window.addEventListener("hashchange", () => showView(true));
$("notify").addEventListener("click", () => Notification.requestPermission().then(renderNotifyButton));
$("usage-refresh").addEventListener("click", renderUsage);
$("share-preview").addEventListener("click", previewShare);
$("usage-groups").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-group]");
  if (!button) return;
  usageGroup = button.dataset.group;
  renderUsageDetail();
});
// replaceState non fa scattare hashchange: il focus resta sul pulsante premuto.
$("agents-views").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-sub]");
  if (!button) return;
  history.replaceState(null, "", `#agents/${button.dataset.sub}`);
  showAgentsView(button.dataset.sub);
});
showView(false);
connect();
refresh();
setInterval(() => document.visibilityState === "visible" && refresh(), REFRESH_MS);
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && refresh());
