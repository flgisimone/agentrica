// Testi inglesi del server MCP (F32), con la stessa forma di it.ts.
import type { Texts } from "./it.ts";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const UNREACHABLE = "Sending failed: Agentrica cannot be reached (no network, timeout or network not allowed). Try again later.";
const EXPIRED = "Code expired or already used: prepare the preview again.";
const serviceError = (status: number) => `Sending failed (service error ${status}). Try again later.`;
const CODE_STEP = "The preview code, only after the user says yes (second step).";
const confirmStep = (tool: string, code: string) =>
  `Show this preview to the user and ask whether to send it. Only after they say yes, call ${tool} again with code "${code}" (valid for 10 minutes, once). If they say no, do nothing.`;
const AGENT_NOT_FOUND = "Agent not found: use list_agents to see the ids.";

export const en: Texts = {
  locale: "en-GB",
  readme: "README.md",

  server: {
    panelBoth: "choose --panel or --no-panel, not both",
    langInvalid: (value: string) => `--lang: ${JSON.stringify(value)} is not a supported language (it or en)`,
    catalogUnreadable: (dir: string, reason: string) => `catalog not readable in ${dir}: ${reason}`,
    squadInvalid: "invalid squad",
    configIgnored: (path: string, reason: string) => `${path} ignored (${reason})`,
    updateNote: (message: string) => `Notice for the user, to pass on once: ${message}`,
    panelFailed: (reason: string) => `panel not started: ${reason}`,
    panelSkipped: (reason: string) => `panel not started (${reason}), the server continues without it`,
    ratingInvalid: (name: string) => `The rating of ${name} was not sent: the form had invalid data.`,
    ratingSent: (name: string, code: string) =>
      `The user rated ${name} with the form: sent, code ${code}. Tell them: with this code they can ask for it to be deleted or for the comment not to be published (Agentrica legal notes).`,
    ratingFailed: (name: string, message: string) => `The rating of ${name} was not sent: ${message}`,
    configClosed: "The user closed the configuration form: nothing changes.",
    configInvalid: "Configuration not saved: the form had invalid data.",
    configBadSquad: (reason: string) => `Configuration not saved: ${reason}. Tell the user: they can try again with Agentrica's configure command.`,
    configWriteFailed: (path: string, reason: string) => `Configuration not saved in ${path}: ${reason}.`,
    configSaved: (path: string) => `Agentrica configuration saved in ${path}: it applies from the next session. Tell the user in one line.`,
    configDefaultsSaved: (path: string) =>
      `The user closed the configuration form: the default values were saved in ${path}, so the form will not appear again. They can be changed with Agentrica's configure command.`,
    instructions: (o: { agents: number; departments: number; codes: string; example: string; exampleId: string; panel: boolean; ratings: boolean }) =>
      `Agentrica: ${plural(o.agents, "AI agent", "AI agents")} in ${plural(o.departments, "department", "departments")} (${o.codes}). ` +
      "All work on the user's project (features, changes, stack choices, phases, audits) goes through Agentrica's agents, even if the user does not name them; without agents only if the user asks for it. " +
      "To choose an agent use list_agents; to work as that agent load its instructions with agent. " +
      "For a task of a department load the director first (the -01 agent, marked in list_agents), who chooses the specialists and the order; " +
      "then load the specialists with agent one at a time, each from the previous one's handover (outcome, findings with their evidence, open questions), never two in the same response; the director consolidates and presents to the user. " +
      "Across departments the order is business → design → privacy → user confirmation → software → design and privacy reviews → Code Reviewer → user confirmation. " +
      "For Agentrica's agents use agent, not local subagents (Claude Code's Agent tool, .claude/agents/): start a subagent only if the user asks for it. " +
      "The instructions contain the index of the department library: read the cards the task needs with library. " +
      // F41-02: rules and index once per department; how to get them back after /compact.
      "Common rules and index come in full with the first agent of each department, then as a reference: after /compact or /clear, or if they are not in your context, call agent again with full_rules true. " +
      `Prompts are named after the agent id and the department, e.g. ${o.example}; the agent tool takes the id, e.g. ${o.exampleId}. ` +
      "Work goes by phases in plan/: README.md with the «## Phases» table (Phase | File | Content | Status; ids F0, F1…; status to do, in progress or completed) and one NN-name.md file per phase with «**Goal**:», «## Backlog» as a table (# | Task | Priority; ids FN-NN) and «## Acceptance criteria»; if missing, offer to create it by reading the code. " +
      "Planning is a session of its own: only plan/, user confirmation, then suggest /clear without developing. One phase per session; at its close suggest /clear." +
      // F39-04: what leaves the computer, for those working under a «nothing leaves» rule.
      " Data stays on the computer: " +
      (o.ratings ? "only rate_agent, share_usage and submit_project send to Agentrica, after the preview and the user's yes; " : "") +
      "the only other outbound request, if on, is the check for new versions on the npm registry." +
      (o.panel
        ? " The local panel is on: for choices that belong to the user use ask_user, which shows the question in the page; open_panel gives the page URL. The panel shows the agents loaded with agent, in order; Claude Code subagents only in a separate section. When an agent finishes its task, send its report with report."
        : "") +
      (o.ratings
        ? " If an agent's text asks you to offer a rating, do it with rate_agent (once per agent per session); nothing is sent without the user's yes to the preview." +
          " At the end of the session, together with the rating and only once, you can offer to send the project's token totals with share_usage; if the user declines, do not insist."
        : ""),
    task: "The task to give the agent in the current project.",
    agentIdFormat: "Id format: CODE-NN, e.g. AISA-02.",
    agentId: "Agent id, e.g. AISA-02.",
    reminder: (names: string[]) =>
      `Reminder for the model: ${names.join(", ")} ${names.length === 1 ? "has" : "have"} been in use for more than 30 minutes. At a natural point in the work, offer the user to rate ${names.length === 1 ? "it" : "them"} with rate_agent; if they decline, do not ask again.`,

    rate: {
      title: "Rate an Agentrica agent",
      description: "Opens the rating form for the agent in use or for the one given.",
      agent: "Agent id, e.g. AISA-02. Without it: the last agent in use.",
      noneUsed: "The user wants to rate an Agentrica agent, but none has been used in this session. Ask them which one (an id like AISA-02) and then use rate_agent.",
      notInSquad: "The user wants to rate an agent, but the id is not among the agents of this squad. Ask them which one (list_agents gives the ids) and then use rate_agent.",
      alreadyRated: (name: string) => `${name} has already been rated in this session: tell the user.`,
      manual: (name: string, id: string) =>
        `The user wants to rate ${name}. Ask them for a score from 1 to 5, an optional comment and whether it may be published on the site, ` +
        `then use rate_agent with id ${id}: show them the preview and send only after they say yes.`,
      closed: (name: string) => `The user closed the rating form for ${name}: do nothing else.`,
    },

    project: {
      title: "Show your project on the Agentrica site",
      description: "Submits a project made with Agentrica for the projects page of the site, without a GitHub account; with remove it withdraws it.",
      remove: "The code of the submission to withdraw.",
      badCode:
        "The text after the project command is the code of a submission to withdraw, and this is not one (it needs a UUID like 3f2a…-…). Tell the user: to submit a project, run the project command with no arguments; to withdraw one, use the code received when it was sent.",
      withdrawn:
        "Withdrawal request recorded: if the code is right, the submission no longer appears; if it was already on the site, it is removed with the next update, within 30 days. Tell the user.",
      tellUser: (message: string) => `${message} Tell the user.`,
      manual:
        "The user wants to submit a project of theirs made with Agentrica for the site. Ask them for name, https link, description (280 characters, no links), " +
        "departments used, agents used and display name (optional), and whether they give consent and license (texts in the submit_project description). " +
        "Then use submit_project: show them the preview and send only after they say yes.",
      closed: "The user closed the project form: nothing is sent.",
      badFields: (reason: string) => `The submission was not sent: ${reason}. Tell the user: they can try again with Agentrica's project command.`,
      failed: (message: string) => `The submission was not sent: ${message}`,
    },

    submit: {
      title: "Submit a project for the Agentrica site",
      description:
        "Submits a project made with Agentrica for the projects page of the site, if the user asks (also without a GitHub account). " +
        "In two steps: 1) with the fields it returns the preview and a code; 2) show the preview to the user and only after they say yes call the tool again with that code. " +
        "consent and license are true only if the user accepted them in their own words: consent to publishing the form data and permission to show name and description.",
      name: "Project name, at most 60 characters.",
      url: "Public https:// link to the project.",
      projectDescription: "What it does and how it used the agents, at most 280 characters, no links.",
      departments: "Codes of the departments used, separated by commas, e.g. AISA, AIWDA.",
      agents: "Ids of the agents used, separated by commas, optional, at most 10.",
      author: "Display name, optional, at most 40 characters.",
      consent: "The user's consent to publishing the submission data.",
      license: "The user's permission to show name and description.",
      code: CODE_STEP,
      invalid: (reason: string) => `Invalid submission: ${reason}.`,
    },

    configure: {
      title: "Configure Agentrica",
      description: (path: string) => `Chooses language, squad, panel, ratings and new version notice; the choices are saved in ${path}.`,
      flagsNote: "The server command options (--lang, --agents, --panel, --no-panel, --no-ratings, --no-update-check) take precedence over the file.",
      noPermission: (path: string) =>
        `The server runs with the Node permission model without access to ${path}: the configuration cannot be saved. Tell the user: they can use the server command options (--lang, --agents, --no-panel, --no-ratings, --no-update-check).`,
      allFixed: (path: string) => `All choices are set by the server command options: the file ${path} does not count. Tell the user.`,
      noForms: (config: string, path: string, flagsNote: string) =>
        `The user wants to configure Agentrica, but this client does not show forms. Current configuration: ${config}. ` +
        `Ask them what to change (lang: it, en or empty for the system language; agents: squad as in --agents, empty for all; panel, ratings, updateCheck: true or false) and write the JSON in ${path}, ` +
        `with the same keys and version 1. It applies from the next session. ${flagsNote}`,
      formNotShown: (path: string, flagsNote: string) => `The form did not appear. The user can write ${path} by hand or use the server command options. ${flagsNote}`,
    },

    listAgents: {
      title: "List the Agentrica agents",
      description: "Lists the Agentrica agents with id, code name, role, department and, where it was measured, the recommended model. The department is optional.",
      department: "Department code.",
      lead: (director: string) => `Director: ${director}. For a task of the department load them first, then the specialists one at a time.`,
    },

    agent: {
      title: "Instructions of an agent",
      description:
        "Returns the instructions of an agent (the department's common rules and the role file), to follow in order to work as that agent. " +
        "Common rules and library index come in full with the first agent of the department in the session, as a reference with the next ones, unless full_rules.",
      fullRules: "true: common rules and library index in full even if already sent in this session (after /compact or /clear, in a subagent or in a new context).",
      notFound: AGENT_NOT_FOUND,
    },

    library: {
      cardIdFormat: "Id of a card, e.g. owasp-top-10-2025.",
      title: "Cards of a department library",
      description:
        "Returns cards from the library of an agent's department: recent notions with source, version and verification date. " +
        "The card ids are in the «Department library» section of the agent's instructions (agent tool).",
      cards: "The ids of the cards to read, at most 10.",
      empty: (code: string) => `The ${code} department has no cards yet.`,
      unknown: (code: string, unknown: string, available: string) => `Cards not found in the ${code} department: ${unknown}. Available: ${available}.`,
    },

    share: {
      title: "Send token totals to Agentrica",
      description:
        "Sends Agentrica, anonymously, this project's token totals for the last 30 days (by day, agent, model and effort), " +
        "which the site adds to those of other users. In two steps: 1) without code it returns the preview of what is sent and a code; " +
        "2) show the preview to the user, ask whether to send it and only after they say yes call the tool again with that code. Never send without the user's yes.",
      code: CODE_STEP,
      sent: (rows: number) => `Totals sent to Agentrica (${rows} rows), thank you. Tell the user.`,
    },

    rateAgent: {
      title: "Rate an Agentrica agent",
      description:
        "Sends Agentrica the rating of an agent (score 1–5, optional comment), anonymously, in two steps. " +
        "1) Without code: returns the preview of what is sent and a code. 2) Show the preview to the user, ask whether to send it " +
        "and only after they say yes call the tool again with that code. Never send without the user's yes; do not put code, " +
        "files or project data in the comment, only the user's words.",
      rating: "Score from 1 to 5 (first step).",
      comment: "What went well or what to improve, in the user's words (first step).",
      publish: "true if the user allows the comment to be published on the site; default false (first step).",
      code: CODE_STEP,
      alreadyRated: (name: string) => `${name} has already been rated in this session.`,
      sent: (name: string, code: string) =>
        `Rating of ${name} sent, thank you. Rating code: ${code}. ` +
        "Tell the user: with this code they can ask for it to be deleted or for the comment not to be published (Agentrica legal notes).",
      needRating: "A score from 1 to 5 is needed to prepare the preview.",
    },

    report: {
      title: "Report of an agent for the panel",
      description:
        "Saves in the local panel the report of what an agent did, shown under the agent among the agents in use. " +
        "Call it when the agent finishes its task, before moving to another one. It stays on the user's computer.",
      summary: "What the agent did, briefly: result, files touched, decisions taken or to take, open findings. At most 4000 characters.",
      saved: (name: string) => `Report of ${name} saved in the panel.`,
      notLoaded: "Report not saved: the agent has not been loaded in this session (agent tool).",
    },

    openPanel: {
      title: "Open the Agentrica panel",
      description: "Opens the project's local panel in the browser (phases, backlog, findings, agents in use, pending choices) and returns its URL.",
      opened: (url: string) => `Panel opened in the browser. If it did not open, the user can open this URL, valid only on this computer: ${url}`,
    },

    askUser: {
      label: "Short label of the option.",
      optionDescription: "What the option implies, with the reason.",
      title: "Ask the user for a choice in the panel",
      description:
        "Shows the user, in the local panel, a choice with 2–4 options and waits for the answer (the chosen labels and an optional note). " +
        "Put the recommended option first, with « (Recommended)» at the end of its label. If the user does not answer, ask in the terminal.",
      question: "The full question, understandable on its own.",
      header: "Short title, e.g. «Approach».",
      options: "The options, the recommended one first.",
      multiple: "true if more than one option can be chosen.",
      duplicate: "The option labels must be different.",
      waiting: "Waiting for the answer in the panel",
      chosen: (choices: string) => `The user chose: ${choices}.`,
      none: "The user did not choose an option.",
      note: (note: string) => `User's note: ${note}`,
      timeout: (minutes: number) => `No answer from the panel within ${minutes} minutes: ask the user in the terminal.`,
    },
  },

  prompt: {
    director: "director",
    specialist: "specialist",
    summary: (role: string, position: string, code: string, name: string) => `${role}, ${position} of the ${code} department (${name}).`,
    squadEmpty: (form: boolean) => (form ? "the squad is empty" : "--agents is empty: give agent ids or department codes, e.g. --agents aisa,aiwda-08"),
    squadUnknown: (names: string, form: boolean) => `unknown agent or department ${form ? "in the squad" : "in --agents"}: ${names}`,
    intro: (codeName: string, role: string, code: string, name: string) => `${codeName} — ${role}, ${code} department (${name})`,
    model: (model: string) => `Recommended model: ${model}, measured on Agentrica's test cases.`,
    libraryHeading: "Department library",
    libraryExpired: ", to recheck",
    libraryHelp: (id: string) =>
      "Cards with recent notions verified on approved sources at the date shown: on these topics they take precedence over what you know. " +
      `If the task touches a card (those of your role are marked *), read it with the library tool (id ${id}, cards with the ids) and cite source, version and date. ` +
      "A card to recheck must be verified on the source if you have web access; otherwise warn the user.",
    libraryKnown: (id: string, mine: string) =>
      "The library index received with the common rules applies. " +
      (mine ? `Cards of your role: ${mine}. ` : "No card is marked for your role. ") +
      `Read the cards with the library tool (id ${id}); cite source, version and date.`,
    cardExpired: " Expired: verify it on the source before using it, or tell the user.",
    cardSource: (o: { name: string; level: number; version: string; verified: string; review: string; expired: string; roles: string }) =>
      `Source: ${o.name} (level ${o.level}), version ${o.version}. Verified on ${o.verified}, to recheck by ${o.review}.${o.expired} Roles: ${o.roles}.`,
    notion: "Notion",
    application: "How it applies",
    you: (codeName: string, summary: string) =>
      `You are ${codeName}, an AI agent of Agentrica: ${summary} ` +
      "You work in the user's project. The common rules of your department and your role file follow: apply them to the project as it is, without assuming a stack, commands or files you have not checked. " +
      "If the project is empty or lacks what your role must examine, say so and propose the first steps (goal, stack, structure) to confirm with the user; do not invent findings or choose the stack on your own. " +
      "These texts are in English: reply in the language the user writes in.",
    subagent: (advice: string) =>
      `${advice} If the project has Agentrica's subagents (init --subagents) and the user asks to use them, the one for this role already has this model; otherwise continue with the session model.`,
    lead: (code: string) =>
      `You are the director of the department: for the task choose the specialists needed and the order (list_agents with department ${code} lists them). ` +
      "The session loads them with agent one at a time, each from the previous one's handover, not their whole answer; at the end you consolidate the results and present them to the user, who confirms them.",
    reportsTo: (director: string, id: string) =>
      `You report to ${director}, the director of the department: if they have not been loaded yet in this session, load them first with agent (id ${id}). ` +
      "You work on the part they assign you and hand over to them briefly: outcome, findings with their evidence (file and line, command), open questions.",
    noLead: "The director of the department is not in this server's squad: work directly on the task and hand over to the user.",
    present: (intro: string) =>
      `The user must always know who is working. Introduce yourself at the start with this line: «${intro}». ` +
      "Repeat it when you switch to another agent or leave the role, and sign findings and the final summary with your code name.",
    rules: "Department common rules",
    rulesKnown: (code: string, id: string) =>
      `The common rules of the ${code} department apply, received in full in this session with another agent of the department: apply them here too. ` +
      `If they are not in your context (after /compact or /clear, in a subagent or in a new conversation), call agent again with id ${id} and full_rules true before working.`,
    role: (role: string) => `Role: ${role}`,
    task: "Task",
    report: "Report",
    reportAsk: (id: string) =>
      `When you have finished the task, send the report to the panel with the report tool (id ${id}): what you did, files touched, decisions and open findings, briefly.`,
    rating: "Rating",
    ratingAsk: (id: string) =>
      `When you have finished the task, offer the user to rate you from 1 to 5 with an optional comment (rate_agent tool, id ${id}), only once in this session; if they decline, do not insist.`,
  },

  ratings: {
    notice: (privacy: string) =>
      "Only what you see here is sent: no task, code or project files. " +
      `Do not write names, personal data or parts of the project in the comment. Privacy notice: ${privacy}`,
    wrongAgent: "Code not valid for this agent: prepare the preview again.",
    expired: EXPIRED,
    alreadyRated: (id: string) => `${id} has already been rated in this session.`,
    unreachable: UNREACHABLE,
    tooMany: "You have already rated this agent today from this network.",
    rejected: "Rating rejected: invalid data.",
    serviceError,
    preview: (o: { name: string; rating: number; comment: string; publish: boolean; version: string; notice: string; code: string }) =>
      [
        `Preview of the rating of ${o.name}:`,
        `- score: ${o.rating}/5`,
        `- comment: ${o.comment || "(none)"}`,
        `- publish the comment on the site: ${o.publish ? "yes" : "no"}`,
        `- version: ${o.version}`,
        "",
        o.notice,
        "",
        confirmStep("rate_agent", o.code),
      ].join("\n"),
    form: {
      rating: "Score",
      ratingNames: ["5 · excellent", "4 · good", "3 · so-so", "2 · poor", "1 · very poor"],
      comment: "Comment (optional)",
      commentHelp: "What went well or what to improve",
      publish: "Publish the comment on the Agentrica site",
    },
    formMessage: (name: string, notice: string) =>
      `Rate ${name}. Submit the form to send the rating to Agentrica, anonymously; decline and we will not ask again for this agent. ${notice}`,
  },

  share: {
    notice: (privacy: string) =>
      "Only these numbers are sent: no texts, file names, paths, project or session ids; subagents that are not Agentrica's become «other». " +
      `The site shows only sums of all submissions. Privacy notice: ${privacy}`,
    expired: EXPIRED,
    noRows: "No rows to send.",
    unreachable: UNREACHABLE,
    tooMany: "Today's submission limit reached from this network. Try again tomorrow.",
    rejected: "Totals rejected: invalid data.",
    serviceError,
    row: (o: { day: string; agent: string; model: string; effort: string; input: string; output: string; cacheRead: string; cacheWrite: string }) =>
      `${o.day} · ${o.agent} · ${o.model} · ${o.effort}: input ${o.input}, output ${o.output}, cache read ${o.cacheRead}, cache write ${o.cacheWrite}`,
    nothing: "No token usage in the last 30 days for this project: there is nothing to send.",
    previewHead: (rows: number, version: string) => `Preview of the token totals to send to Agentrica (${rows} rows, last 30 days, version ${version}):`,
    omitted: (n: number) => `(${n} older rows are left out: at most 300 per submission)`,
    confirm: (code: string) => confirmStep("share_usage", code),
  },

  showcase: {
    consent:
      "I agree that Agentrica may publish on its site the data in this form (display name, name, link, description, departments, agents, version) and the approval date, until I ask for them to be removed.",
    license: "I grant Agentrica, free of charge, permission to show the project's name and description on the site until I ask for them to be removed, and I declare that I am entitled to do so.",
    defaultAuthor: "Agentrica user",
    noAuthor: "none (the site writes «Agentrica user» or, in Italian, «Utente di Agentrica»)",
    needConsent: "consent and license are required",
    badName: (max: number) => `name missing, longer than ${max} characters or with links and the symbols < > [ ] \``,
    badUrl: "the link must be a full https:// address, without port or credentials, at most 200 characters",
    badDescription: (max: number) => `description missing, longer than ${max} characters or with links and the symbols < > [ ] \``,
    badDepartments: "departments missing or unknown (codes like AISA, AIWDA)",
    badAgents: (max: number) => `unknown agents or more than ${max} (ids like AISA-02)`,
    badAuthor: (max: number) => `display name longer than ${max} characters or with links and symbols`,
    unreachable: UNREACHABLE,
    withdrawUnreachable: "Withdrawal failed: Agentrica cannot be reached (no network, timeout or network not allowed). Try again later.",
    expired: EXPIRED,
    tooMany: "Today's submission limit reached from this network. Try again tomorrow.",
    rejected: "Submission rejected: invalid data.",
    serviceError,
    withdrawn: "Withdrawal request recorded.",
    withdrawError: (status: number) => `Withdrawal failed (service error ${status}). Try again later.`,
    notice: (privacy: string) =>
      "The project appears on the site only after the owner approves it; the description and results remain yours and we do not verify them. " +
      `Only what you see is sent, with the package version; no email or account. Privacy notice: ${privacy}`,
    form: {
      name: "Project name",
      url: "Link",
      urlHelp: "A public https:// address: repository, site or project page.",
      description: "Description",
      descriptionHelp: "What the project does and how you used the agents. Plain text, no links.",
      departments: "Departments used",
      departmentsHelp: "Codes separated by commas: AIBPD, AICA, AIPCA, AISA, AIWDA.",
      agents: "Agents used (optional)",
      agentsHelp: "Ids separated by commas, e.g. AISA-02, AIWDA-08; at most 10.",
      author: "Display name (optional)",
      authorHelp: (fallback: string) => `Empty: «${fallback}».`,
      consent: "Consent",
      license: "License",
    },
    formMessage: (notice: string) => `Show your project on the Agentrica site. ${notice}`,
    preview: (o: { code: string; name: string; url: string; description: string; departments: string; agents: string; author: string; version: string; consent: string; license: string; notice: string }) =>
      [
        "Preview of the project submission:",
        `- name: ${o.name}`,
        `- link: ${o.url}`,
        `- description: ${o.description}`,
        `- departments: ${o.departments}`,
        `- agents: ${o.agents || "(none)"}`,
        `- display name: ${o.author}`,
        `- version: ${o.version}`,
        `- consent and license: yes («${o.consent}» «${o.license}»)`,
        "",
        o.notice,
        "",
        confirmStep("submit_project", o.code),
      ].join("\n"),
    sent: (name: string, code: string, privacy: string) =>
      `Submission of the project «${name}» sent to Agentrica: it will appear on the site after approval. Submission code: ${code}. ` +
      `Tell the user and ask them to keep it: it is the only way to withdraw it, with Agentrica's project command and the remove argument (${privacy}).`,
  },

  update: {
    global: (latest: string) => `To update: npx -y @agentrica/mcp@${latest} install, then restart the client.`,
    npx: (latest: string) => `To update, change the version to @agentrica/mcp@${latest} in the server command (claude mcp add or .mcp.json), then restart the client.`,
    source: "To update the clone: git pull, then restart the client.",
    message: (latest: string, current: string, how: string) => `Agentrica ${latest} is out (you are using ${current}). ${how}`,
  },

  config: {
    tooBig: "larger than 4 KB",
    badFormat: "invalid format",
    unreadable: "not readable",
    form: {
      lang: "Language",
      langHelp: "Language of the server, agent and panel texts. System: the computer's language.",
      langNames: ["System", "Italiano", "English"],
      agents: "Squad",
      agentsHelp: "Agent ids and department codes separated by commas, e.g. aisa,aiwda-08. Empty: all agents.",
      panel: "Local panel",
      panelHelp: "A page on this computer with phases, findings, agents in use and the choices to make.",
      ratings: "Agent ratings",
      ratingsHelp: "The server asks you now and then for a score on the agents. Nothing is sent without your confirmation.",
      updateCheck: "New version notice",
      updateCheckHelp: "At startup the server checks the npm registry for a newer version.",
    },
    message: (path: string, fixed: boolean) =>
      [
        "Configure Agentrica.",
        `The choices are saved on your computer in ${path} and apply from the next session. Nothing is sent to Agentrica.`,
        "To change them use Agentrica's configure command (in Claude Code /mcp__<server name>__configure); to go back to the defaults delete the file.",
        fixed ? "Options written in the server command do not appear here: they take precedence." : "",
      ]
        .filter(Boolean)
        .join(" "),
  },

  setup: {
    scope: {
      user: "user scope: all your projects",
      project: "project scope: .mcp.json in this folder, for the team",
      local: "local scope: this project only, for you only",
    },
    projectAndLocal: "choose --project or --local, not both",
    installScope: "install always registers with user scope; for a project use add --project or add --local",
    fromOnlyInstall: "--from only applies to install",
    badAgents: "--agents: agent ids and department codes separated by commas, e.g. --agents aisa,aiwda-08",
    manual: "Commands to run by hand:",
    oldNode: (mode: string, version: string) => `agentrica ${mode}: Node.js 22 or newer is required (in use ${version}). Install it from https://nodejs.org and run again:`,
    noNpm: "agentrica install: npm not found. Install Node.js 22 or newer (with npm) from https://nodejs.org and run again.",
    npmFailed: (win: boolean) =>
      `agentrica install: npm install -g failed.${win ? "" : " If it is a permissions problem, set up a global npm folder of your own (npm config set prefix) instead of using sudo."}`,
    unknownRoot: "(unknown global npm folder)",
    serverMissing: (root: string) => `agentrica install: package installed but server not found in ${root}.`,
    installed: (what: string, root: string) => `Installed ${what} in ${root}.`,
    noClaude: "agentrica: Claude Code (the claude command) not found. Install it and run this command again, or register the server by hand:",
    otherClients: "For other MCP clients use the same server command in their configuration (README of @agentrica/mcp).",
    addFailed: "agentrica: claude mcp add failed.",
    registered: (version: string, scope: string, replaced: boolean) =>
      `Agentrica ${version} registered in Claude Code (${scope})${replaced ? ", replacing the previous registration" : ""}.`,
    command: (command: string) => `Server command: ${command}`,
    otherScope: (scope: string, name: string, other: string) =>
      `Warning: Agentrica is also registered with ${scope}, with a command that may differ. Claude Code uses the registration closest to the project (local, then project, then user). If you do not need it, remove it with: claude mcp remove ${name} --scope ${other}`,
    restart: "Restart Claude Code (or use /mcp) and check with: claude mcp list",
  },

  init: {
    subagentProject: (name: string) => `of the ${name} project.`,
    subagentFirst: (id: string) =>
      `First step: call the \`mcp__agentrica__agent\` tool of the Agentrica MCP server with id \`${id}\`, \`full_rules\` true and the task you received. ` +
      "The instructions it returns are your role, with the department's common rules in full (a subagent has its own context), and make the agent appear in the panel: with them there is no need to reread the files named below, which remain the reference if the tool does not answer. Do not load the director of the department: the main session started you and coordinates.",
    inRepo: "git: the folder is already in a repository, no commit",
    noGit: "git: not installed, repository not created",
    commit: "Project created with @agentrica/mcp init",
    commitFailed: "git: commit failed (set user.name and user.email), files left staged on main",
    committed: "git: initial commit on main, develop branch active",
    usage: 'usage: agentrica-mcp init [folder] [--name "Name"] [--lang it|en] [--subagents] [--existing] [--no-reminder]',
    badName: "--name: a name on one line is required",
    taken: (files: string, more: number) => `no files written, these already exist: ${files}${more > 0 ? ` and ${more} more` : ""}`,
    created: (name: string, dir: string, count: number) => `Project «${name}» created in ${dir}: ${count} files.`,
    next: "Next steps:",
    step1: (dir: string) => `  1. cd "${dir}" and open Claude Code (.mcp.json registers the Agentrica server with the panel)`,
    step1Registered: (dir: string) => `  1. cd "${dir}" and open Claude Code (.mcp.json already existed and was skipped: the Agentrica server must be in it, or registered with add)`,
    step2: "  2. ask to open phase F0 (plan/00-base.md): stack, active agencies, «to fill in» sections",
    added: (name: string, dir: string, count: number) => `Agentrica's rules added to «${name}» in ${dir}: ${count} new files.`,
    skipped: (files: string) => `Skipped because they already exist: ${files}`,
    /** Il promemoria dell'hook UserPromptSubmit (F39-01), a ogni richiesta: niente ' " $ ` % ! \ perché passa dalla shell. */
    reminder: "Agentrica: if this request is work on the project, first load the right agent with the Agentrica agent tool (choose it with list_agents); work without agents only if the user asks.",
    reminderSkipped: "The reminder was not added because .claude/settings.json already existed: to add it by hand see «Reminder» in the @agentrica/mcp README.",
    importAgents: "Your CLAUDE.md was not touched: add a line «@AGENTS.md» so that Claude Code reads Agentrica's rules.",
    noCommit: "git: no commit, review the new files and add them yourself",
    stepExisting: "  2. ask Claude «Create the project phases from the existing code»: it writes only plan/, stops at the backlog and suggests /clear",
    noPhases: "No phases yet: ask Claude to create them by reading the existing code. In that session only the phases with backlog and criteria are written, then `/clear`; each phase opens in a new session.",
  },

  panel: {
    error: "Panel error.",
    badHost: "Invalid host.",
    badToken: "Invalid token.",
    openFromTool: "Open the panel from the URL given by the agent's open_panel tool.",
    badOrigin: "Invalid origin.",
    needJson: "JSON required.",
    badRequest: "Invalid request.",
    badRating: "Invalid rating.",
    badCode: "Invalid code.",
    notPending: "The question is no longer pending.",
    badAnswer: "Invalid answer.",
    notFound: "Not found.",
  },

  project: {
    noPlan:
      "This project has no plan yet (plan/README.md). To create one run `npx @agentrica/mcp init --existing`, which adds Agentrica's rules without touching your files, or ask Claude «Create the project plan from the existing code».",
    emptyPlan: "The plan has no phases yet. Ask Claude «Create the project phases from the existing code»: it writes only plan/ and stops at the backlog.",
    noPhases: "plan/README.md lacks the «## Phases» table (Phase | File | Content | Status).",
    noPhaseFile: (file: string, id: string) => `plan/${file} not found, the file of phase ${id}.`,
    noBacklog: (file: string) => `plan/${file} lacks the «## Backlog» section.`,
    badJson: (source: string) => `audit/${source} is not readable JSON: skipped.`,
    noFindings: (source: string) => `audit/${source} has no findings list: skipped.`,
  },
};
