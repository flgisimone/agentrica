// Testi italiani del server MCP (F32): istruzioni, risposte dei tool, moduli, CLI e messaggi del pannello.
// en.ts ha la stessa forma (tipo Texts); la lingua si sceglie in texts/index.ts. Nessun testo per l'utente resta sparso
// nei moduli del server: qui e in page/texts.it.js per la pagina del pannello.

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const UNREACHABLE = "Invio non riuscito: Agentrica non è raggiungibile (rete assente, timeout o rete non permessa). Riprova più tardi.";
const EXPIRED = "Codice scaduto o già usato: prepara di nuovo l'anteprima.";
const serviceError = (status: number) => `Invio non riuscito (errore ${status} del servizio). Riprova più tardi.`;
const CODE_STEP = "Il codice dell'anteprima, solo dopo il sì dell'utente (secondo passo).";
const confirmStep = (tool: string, code: string) =>
  `Mostra questa anteprima all'utente e chiedigli se inviarla. Solo dopo il suo sì richiama ${tool} con code "${code}" (valido 10 minuti, una volta). Se dice no, non fare nulla.`;
const AGENT_NOT_FOUND = "Agente non trovato: usa list_agents per vedere gli id.";

export const it = {
  /** Locale per numeri e ore. */
  locale: "it-IT",
  readme: "README.it.md",

  server: {
    panelBoth: "scegli --panel o --no-panel, non entrambi",
    langInvalid: (value: string) => `--lang: ${JSON.stringify(value)} non è una lingua ammessa (it o en)`,
    catalogUnreadable: (dir: string, reason: string) => `catalogo non leggibile in ${dir}: ${reason}`,
    squadInvalid: "squadra non valida",
    configIgnored: (path: string, reason: string) => `${path} ignorato (${reason})`,
    updateNote: (message: string) => `Avviso per l'utente, da riferire una volta: ${message}`,
    panelFailed: (reason: string) => `pannello non avviato: ${reason}`,
    panelSkipped: (reason: string) => `pannello non avviato (${reason}), il server continua senza`,
    ratingInvalid: (name: string) => `La valutazione di ${name} non è partita: il modulo aveva dati non validi.`,
    ratingSent: (name: string, code: string) =>
      `L'utente ha valutato ${name} con il modulo: inviata, codice ${code}. Diglielo: con questo codice può chiedere di cancellarla o di non pubblicare il commento (note legali di Agentrica).`,
    ratingFailed: (name: string, message: string) => `La valutazione di ${name} non è partita: ${message}`,
    configClosed: "L'utente ha chiuso il modulo della configurazione: non cambia nulla.",
    configInvalid: "Configurazione non salvata: il modulo aveva dati non validi.",
    configBadSquad: (reason: string) => `Configurazione non salvata: ${reason}. Dillo all'utente: può riprovare con il comando configure di Agentrica.`,
    configWriteFailed: (path: string, reason: string) => `Configurazione non salvata in ${path}: ${reason}.`,
    configSaved: (path: string) => `Configurazione di Agentrica salvata in ${path}: vale dalla prossima sessione. Dillo all'utente in una riga.`,
    configDefaultsSaved: (path: string) =>
      `L'utente ha chiuso il modulo della configurazione: salvati i valori predefiniti in ${path}, il modulo non ricompare. Si cambiano con il comando configure di Agentrica.`,
    instructions: (o: { agents: number; departments: number; codes: string; example: string; exampleId: string; panel: boolean; ratings: boolean }) =>
      `Agentrica: ${plural(o.agents, "agente IA", "agenti IA")} in ${plural(o.departments, "reparto", "reparti")} (${o.codes}). ` +
      "Per scegliere un agente usa list_agents; per lavorare come quell'agente carica le sue istruzioni con agent. " +
      "Per un compito di un reparto carica prima il direttore (l'agente -01, segnato in list_agents), che sceglie gli specialisti e l'ordine; " +
      "poi carica gli specialisti con agent uno alla volta, ognuno dal risultato del precedente, mai due nella stessa risposta; il direttore consolida e presenta all'utente. " +
      "Fra reparti l'ordine è business → design → privacy → conferma dell'utente → software → revisioni di design e privacy → conferma dell'utente. " +
      "Per gli agenti di Agentrica usa agent e non i subagent locali (tool Agent di Claude Code, .claude/agents/): avvia un subagent solo se l'utente lo chiede. " +
      "Le istruzioni contengono l'indice della biblioteca del reparto: le schede che servono al compito si leggono con library. " +
      `I prompt hanno il nome dell'id dell'agente e del reparto, es. ${o.example}; il tool agent vuole l'id, es. ${o.exampleId}.` +
      (o.panel
        ? " Il pannello locale è attivo: per le scelte che spettano all'utente usa ask_user, che mostra la domanda nella pagina; open_panel dà l'URL della pagina. Il pannello mostra in ordine gli agenti caricati con agent; i subagent di Claude Code solo in una sezione a parte. Quando un agente finisce il suo compito, manda il suo resoconto con report."
        : "") +
      (o.ratings
        ? " Se il testo di un agente chiede di proporre la valutazione, fallo con rate_agent (una volta per agente per sessione); niente parte senza il sì dell'utente all'anteprima." +
          " A fine sessione, insieme alla valutazione e una volta sola, puoi proporre di inviare i totali di token del progetto con share_usage; se l'utente rifiuta, non insistere."
        : ""),
    task: "Il compito da affidare all'agente nel progetto corrente.",
    agentIdFormat: "Formato dell'id: SIGLA-NN, es. AISA-02.",
    agentId: "Id dell'agente, es. AISA-02.",
    reminder: (names: string[]) =>
      `Promemoria per il modello: ${names.join(", ")} ${names.length === 1 ? "è" : "sono"} in uso da più di 30 minuti. A un punto naturale del lavoro proponi all'utente di valutarl${names.length === 1 ? "o" : "i"} con rate_agent; se rifiuta, non chiedere più.`,

    rate: {
      title: "Valuta un agente di Agentrica",
      description: "Apre il modulo di valutazione per l'agente in uso o per quello indicato.",
      agent: "Id dell'agente, es. AISA-02. Senza: l'ultimo agente in uso.",
      noneUsed: "L'utente vuole valutare un agente di Agentrica, ma in questa sessione non ne è stato usato nessuno. Chiedigli quale (id come AISA-02) e poi usa rate_agent.",
      notInSquad: "L'utente vuole valutare un agente, ma l'id non è fra gli agenti di questa squadra. Chiedigli quale (list_agents dà gli id) e poi usa rate_agent.",
      alreadyRated: (name: string) => `${name} è già stato valutato in questa sessione: dillo all'utente.`,
      manual: (name: string, id: string) =>
        `L'utente vuole valutare ${name}. Chiedigli il voto da 1 a 5, un commento facoltativo e se permette di pubblicarlo sul sito, ` +
        `poi usa rate_agent con id ${id}: mostragli l'anteprima e invia solo dopo il suo sì.`,
      closed: (name: string) => `L'utente ha chiuso il modulo di valutazione di ${name}: non fare altro.`,
    },

    project: {
      title: "Mostra il tuo progetto sul sito di Agentrica",
      description: "Propone un progetto fatto con Agentrica per la pagina dei progetti del sito, senza account GitHub; con remove lo ritira.",
      remove: "Il codice della proposta da ritirare.",
      badCode:
        "Il testo dopo il comando project è il codice di una proposta da ritirare, e questo non lo è (serve un UUID come 3f2a…-…). Dillo all'utente: per proporre un progetto si lancia il comando project senza argomenti; per ritirarne uno serve il codice ricevuto all'invio.",
      withdrawn:
        "Richiesta di ritiro registrata: se il codice è giusto, la proposta non compare più; se era già sul sito, si toglie con il prossimo aggiornamento, entro 30 giorni. Dillo all'utente.",
      tellUser: (message: string) => `${message} Dillo all'utente.`,
      manual:
        "L'utente vuole proporre un suo progetto fatto con Agentrica per il sito. Chiedigli nome, link https, descrizione (280 caratteri, senza link), " +
        "reparti usati, agenti usati e nome da mostrare (facoltativi), e se dà consenso e licenza (testi nella descrizione di submit_project). " +
        "Poi usa submit_project: mostragli l'anteprima e invia solo dopo il suo sì.",
      closed: "L'utente ha chiuso il modulo del progetto: non parte nulla.",
      badFields: (reason: string) => `La proposta non è partita: ${reason}. Dillo all'utente: può riprovare con il comando project di Agentrica.`,
      failed: (message: string) => `La proposta non è partita: ${message}`,
    },

    submit: {
      title: "Proponi un progetto per il sito di Agentrica",
      description:
        "Propone un progetto fatto con Agentrica per la pagina dei progetti del sito, se l'utente lo chiede (anche senza account GitHub). " +
        "In due passi: 1) con i campi restituisce l'anteprima e un codice; 2) mostra l'anteprima all'utente e solo dopo il suo sì richiama il tool con quel code. " +
        "consent e license sono true solo se l'utente li ha accettati con le sue parole: consenso alla pubblicazione dei dati del modulo e permesso di mostrare nome e descrizione.",
      name: "Nome del progetto, al più 60 caratteri.",
      url: "Link https:// pubblico del progetto.",
      projectDescription: "Cosa fa e come ha usato gli agenti, al più 280 caratteri, senza link.",
      departments: "Sigle dei reparti usati separate da virgole, es. AISA, AIWDA.",
      agents: "Id degli agenti usati separati da virgole, facoltativo, al più 10.",
      author: "Nome da mostrare, facoltativo, al più 40 caratteri.",
      consent: "Consenso dell'utente alla pubblicazione dei dati della proposta.",
      license: "Permesso dell'utente di mostrare nome e descrizione.",
      code: CODE_STEP,
      invalid: (reason: string) => `Proposta non valida: ${reason}.`,
    },

    configure: {
      title: "Configura Agentrica",
      description: (path: string) => `Sceglie lingua, squadra, pannello, valutazioni e avviso di versione; le scelte si salvano in ${path}.`,
      flagsNote: "Le opzioni del comando del server (--lang, --agents, --panel, --no-panel, --no-ratings, --no-update-check) hanno la precedenza sul file.",
      noPermission: (path: string) =>
        `Il server gira con il permission model di Node senza accesso a ${path}: la configurazione non si salva. Dillo all'utente: può usare le opzioni del comando del server (--lang, --agents, --no-panel, --no-ratings, --no-update-check).`,
      allFixed: (path: string) => `Tutte le scelte sono fissate dalle opzioni del comando del server: il file ${path} non conta. Dillo all'utente.`,
      noForms: (config: string, path: string, flagsNote: string) =>
        `L'utente vuole configurare Agentrica, ma questo client non mostra i moduli. Configurazione attuale: ${config}. ` +
        `Chiedigli cosa cambiare (lang: it, en o vuota per la lingua del sistema; agents: squadra come --agents, vuota per tutti; panel, ratings, updateCheck: true o false) e scrivi il JSON in ${path}, ` +
        `con le stesse chiavi e version 1. Vale dalla prossima sessione. ${flagsNote}`,
      formNotShown: (path: string, flagsNote: string) => `Il modulo non è comparso. L'utente può scrivere a mano ${path} o usare le opzioni del comando del server. ${flagsNote}`,
    },

    listAgents: {
      title: "Elenca gli agenti di Agentrica",
      description: "Elenca gli agenti di Agentrica con id, nome in codice, ruolo, reparto e, dove è stato misurato, il modello consigliato. Il reparto è facoltativo.",
      department: "Sigla del reparto.",
      lead: (director: string) => `Direttore: ${director}. Per un compito del reparto si carica per primo, poi gli specialisti uno alla volta.`,
    },

    agent: {
      title: "Istruzioni di un agente",
      description: "Restituisce le istruzioni complete di un agente (regole comuni del reparto e file di ruolo), da seguire per lavorare come quell'agente.",
      notFound: AGENT_NOT_FOUND,
    },

    library: {
      cardIdFormat: "Id di una scheda, es. owasp-top-10-2025.",
      title: "Schede della biblioteca di un reparto",
      description:
        "Restituisce le schede della biblioteca del reparto di un agente: nozioni recenti con fonte, versione e data di verifica. " +
        "Gli id delle schede sono nella sezione «Biblioteca del reparto» delle istruzioni dell'agente (tool agent).",
      cards: "Gli id delle schede da leggere, al più 10.",
      empty: (code: string) => `Il reparto ${code} non ha ancora schede.`,
      unknown: (code: string, unknown: string, available: string) => `Schede non trovate nel reparto ${code}: ${unknown}. Disponibili: ${available}.`,
    },

    share: {
      title: "Invia ad Agentrica i totali di token",
      description:
        "Invia ad Agentrica, in forma anonima, i totali di token di questo progetto negli ultimi 30 giorni (per giorno, agente, modello ed effort), " +
        "che il sito somma a quelli degli altri utenti. In due passi: 1) senza code restituisce l'anteprima di ciò che parte e un codice; " +
        "2) mostra l'anteprima all'utente, chiedigli se inviarla e solo dopo il suo sì richiama il tool con quel code. Non inviare mai senza il sì dell'utente.",
      code: CODE_STEP,
      sent: (rows: number) => `Totali inviati ad Agentrica (${rows} righe), grazie. Dillo all'utente.`,
    },

    rateAgent: {
      title: "Valuta un agente di Agentrica",
      description:
        "Invia ad Agentrica la valutazione di un agente (voto 1–5, commento facoltativo), in forma anonima, in due passi. " +
        "1) Senza code: restituisce l'anteprima di ciò che parte e un codice. 2) Mostra l'anteprima all'utente, chiedigli se inviarla " +
        "e solo dopo il suo sì richiama il tool con quel code. Non inviare mai senza il sì dell'utente; non mettere nel commento codice, " +
        "file o dati del progetto, solo le parole dell'utente.",
      rating: "Voto da 1 a 5 (primo passo).",
      comment: "Cosa è andato bene o cosa migliorare, con le parole dell'utente (primo passo).",
      publish: "true se l'utente permette di pubblicare il commento sul sito; predefinito false (primo passo).",
      code: CODE_STEP,
      alreadyRated: (name: string) => `${name} è già stato valutato in questa sessione.`,
      sent: (name: string, code: string) =>
        `Valutazione di ${name} inviata, grazie. Codice della valutazione: ${code}. ` +
        "Dillo all'utente: con questo codice può chiedere di cancellarla o di non pubblicare il commento (note legali di Agentrica).",
      needRating: "Serve il voto da 1 a 5 per preparare l'anteprima.",
    },

    report: {
      title: "Resoconto di un agente per il pannello",
      description:
        "Salva nel pannello locale il resoconto di ciò che un agente ha fatto, mostrato sotto l'agente fra gli agenti in uso. " +
        "Chiamalo quando l'agente finisce il suo compito, prima di passare a un altro. Resta sul computer dell'utente.",
      summary: "Cosa ha fatto l'agente, in breve: risultato, file toccati, decisioni prese o da prendere, rilievi aperti. Al più 4000 caratteri.",
      saved: (name: string) => `Resoconto di ${name} salvato nel pannello.`,
      notLoaded: "Resoconto non salvato: l'agente non è stato caricato in questa sessione (tool agent).",
    },

    openPanel: {
      title: "Apri il pannello di Agentrica",
      description: "Apre nel browser il pannello locale del progetto (fasi, backlog, rilievi, agenti in uso, scelte in attesa) e ne restituisce l'URL.",
      opened: (url: string) => `Pannello aperto nel browser. Se non si è aperto, l'utente può aprire questo URL, valido solo su questo computer: ${url}`,
    },

    askUser: {
      label: "Etichetta breve dell'opzione.",
      optionDescription: "Cosa comporta l'opzione, con la motivazione.",
      title: "Chiedi una scelta all'utente nel pannello",
      description:
        "Mostra all'utente, nel pannello locale, una scelta con 2–4 opzioni e aspetta la risposta (le etichette scelte e una nota facoltativa). " +
        "Metti per prima l'opzione consigliata, con « (Consigliata)» alla fine dell'etichetta. Se l'utente non risponde, chiedi nel terminale.",
      question: "La domanda completa, comprensibile da sola.",
      header: "Titolo breve, es. «Strada».",
      options: "Le opzioni, la consigliata per prima.",
      multiple: "true se si può scegliere più di un'opzione.",
      duplicate: "Le etichette delle opzioni devono essere diverse.",
      waiting: "In attesa della risposta nel pannello",
      chosen: (choices: string) => `L'utente ha scelto: ${choices}.`,
      none: "L'utente non ha scelto un'opzione.",
      note: (note: string) => `Nota dell'utente: ${note}`,
      timeout: (minutes: number) => `Nessuna risposta dal pannello entro ${minutes} minuti: chiedi all'utente nel terminale.`,
    },
  },

  prompt: {
    director: "direttore",
    specialist: "specialista",
    summary: (role: string, position: string, code: string, name: string) => `${role}, ${position} del reparto ${code} (${name}).`,
    squadEmpty: (form: boolean): string => (form ? "la squadra è vuota" : "--agents è vuoto: indica id di agenti o sigle di reparti, es. --agents aisa,aiwda-08"),
    squadUnknown: (names: string, form: boolean) => `agente o reparto sconosciuto ${form ? "nella squadra" : "in --agents"}: ${names}`,
    intro: (codeName: string, role: string, code: string, name: string) => `${codeName} — ${role}, reparto ${code} (${name})`,
    model: (model: string) => `Modello consigliato: ${model}, misurato sui casi di prova di Agentrica.`,
    libraryHeading: "Biblioteca del reparto",
    libraryExpired: ", da ricontrollare",
    libraryHelp: (id: string) =>
      "Schede con nozioni recenti verificate su fonti ammesse alla data indicata: per questi temi valgono più delle tue conoscenze. " +
      `Se il compito tocca una scheda (con * quelle del tuo ruolo), leggila con il tool library (id ${id}, cards con gli id) e cita fonte, versione e data. ` +
      "Una scheda da ricontrollare va verificata sulla fonte se hai il web, altrimenti avverti l'utente.",
    cardExpired: " Scaduta: verificala sulla fonte prima di usarla, o dillo all'utente.",
    cardSource: (o: { name: string; level: number; version: string; verified: string; review: string; expired: string; roles: string }) =>
      `Fonte: ${o.name} (livello ${o.level}), versione ${o.version}. Verificata il ${o.verified}, da ricontrollare entro il ${o.review}.${o.expired} Ruoli: ${o.roles}.`,
    notion: "Nozione",
    application: "Come si applica",
    you: (codeName: string, summary: string) =>
      `Sei ${codeName}, un agente IA di Agentrica: ${summary} ` +
      "Lavori nel progetto dell'utente. Seguono le regole comuni del tuo reparto e il tuo file di ruolo: applicale al progetto così com'è, senza presumere stack, comandi o file che non hai verificato. " +
      "Se il progetto è vuoto o manca ciò che il tuo ruolo deve esaminare, dillo e proponi i primi passi (obiettivo, stack, struttura) da confermare con l'utente; non inventare rilievi né scegliere lo stack da solo. " +
      "Questi testi sono in italiano: rispondi nella lingua in cui ti scrive l'utente.",
    subagent: (advice: string) =>
      `${advice} Se il progetto ha i subagent di Agentrica (init --subagents) e l'utente chiede di usarli, quello di questo ruolo ha già questo modello; altrimenti continua con il modello della sessione.`,
    lead: (code: string) =>
      `Sei il direttore del reparto: per il compito scegli gli specialisti che servono e l'ordine (list_agents con department ${code} li elenca). ` +
      "La sessione li carica con agent uno alla volta, ognuno dal risultato del precedente; alla fine consolidi i risultati e li presenti all'utente, che li conferma.",
    reportsTo: (director: string, id: string) =>
      `Riporti a ${director}, il direttore del reparto: se in questa sessione non è ancora stato caricato, caricalo prima con agent (id ${id}). ` +
      "Lavori sulla parte che ti assegna, dal risultato dello specialista precedente, e consegni a lui.",
    noLead: "Il direttore del reparto non è nella squadra di questo server: lavori direttamente sul compito e consegni all'utente.",
    present: (intro: string) =>
      `L'utente deve sempre sapere chi sta lavorando. Presentati all'inizio con questa riga: «${intro}». ` +
      "Ripetila quando passi a un altro agente o lasci il ruolo, e firma con il tuo nome in codice i rilievi e il riepilogo finale.",
    rules: "Regole comuni del reparto",
    role: (role: string) => `Ruolo: ${role}`,
    task: "Compito",
    report: "Resoconto",
    reportAsk: (id: string) =>
      `Quando hai finito il compito, manda il resoconto al pannello con il tool report (id ${id}): cosa hai fatto, file toccati, decisioni e rilievi aperti, in breve.`,
    rating: "Valutazione",
    ratingAsk: (id: string) =>
      `Quando hai finito il compito, proponi all'utente di valutarti da 1 a 5 con un commento facoltativo (tool rate_agent, id ${id}), una volta sola in questa sessione; se rifiuta, non insistere.`,
  },

  ratings: {
    notice: (privacy: string) =>
      "Parte solo ciò che vedi qui: niente compito, codice o file del progetto. " +
      `Non scrivere nel commento nomi, dati personali o parti del progetto. Informativa: ${privacy}`,
    wrongAgent: "Codice non valido per questo agente: prepara di nuovo l'anteprima.",
    expired: EXPIRED,
    alreadyRated: (id: string) => `${id} è già stato valutato in questa sessione.`,
    unreachable: UNREACHABLE,
    tooMany: "Hai già valutato questo agente oggi da questa rete.",
    rejected: "Valutazione respinta: dati non validi.",
    serviceError,
    preview: (o: { name: string; rating: number; comment: string; publish: boolean; version: string; notice: string; code: string }) =>
      [
        `Anteprima della valutazione di ${o.name}:`,
        `- voto: ${o.rating}/5`,
        `- commento: ${o.comment || "(nessuno)"}`,
        `- pubblicazione del commento sul sito: ${o.publish ? "sì" : "no"}`,
        `- versione: ${o.version}`,
        "",
        o.notice,
        "",
        confirmStep("rate_agent", o.code),
      ].join("\n"),
    form: {
      rating: "Voto",
      ratingNames: ["5 · benissimo", "4 · bene", "3 · così così", "2 · male", "1 · malissimo"],
      comment: "Commento (facoltativo)",
      commentHelp: "Cosa è andato bene o cosa migliorare",
      publish: "Pubblica il commento sul sito di Agentrica",
    },
    formMessage: (name: string, notice: string) =>
      `Valuta ${name}. Invia il modulo per mandare la valutazione ad Agentrica, in forma anonima; rifiuta e non te la chiediamo più per questo agente. ${notice}`,
  },

  share: {
    notice: (privacy: string) =>
      "Partono solo questi numeri: niente testi, nomi di file, percorsi, progetto né id di sessione; i subagent che non sono di Agentrica diventano «altro». " +
      `Sul sito si vedono solo somme di tutti gli invii. Informativa: ${privacy}`,
    expired: EXPIRED,
    noRows: "Nessuna riga da inviare.",
    unreachable: UNREACHABLE,
    tooMany: "Limite di invii di oggi raggiunto da questa rete. Riprova domani.",
    rejected: "Totali respinti: dati non validi.",
    serviceError,
    row: (o: { day: string; agent: string; model: string; effort: string; input: string; output: string; cacheRead: string; cacheWrite: string }) =>
      `${o.day} · ${o.agent} · ${o.model} · ${o.effort}: ingresso ${o.input}, uscita ${o.output}, letti dalla cache ${o.cacheRead}, scritti in cache ${o.cacheWrite}`,
    nothing: "Nessun consumo di token negli ultimi 30 giorni per questo progetto: non c'è nulla da inviare.",
    previewHead: (rows: number, version: string) => `Anteprima dei totali di token da inviare ad Agentrica (${rows} righe, ultimi 30 giorni, versione ${version}):`,
    omitted: (n: number) => `(${n} righe più vecchie restano fuori: al più 300 per invio)`,
    confirm: (code: string) => confirmStep("share_usage", code),
  },

  showcase: {
    consent:
      "Acconsento a che Agentrica pubblichi sul suo sito i dati di questo modulo (nome da mostrare, nome, link, descrizione, reparti, agenti, versione) e la data di approvazione, finché non chiedo di toglierli.",
    license: "Concedo ad Agentrica, senza compenso, il permesso di mostrare sul sito nome e descrizione del progetto finché non chiedo di toglierli, e dichiaro di poterlo fare.",
    defaultAuthor: "Utente di Agentrica",
    noAuthor: "nessuno (il sito scrive «Utente di Agentrica» o, in inglese, «Agentrica user»)",
    needConsent: "servono il consenso e la licenza",
    badName: (max: number) => `nome mancante, oltre ${max} caratteri o con link e simboli < > [ ] \``,
    badUrl: "il link deve essere un indirizzo https:// completo, senza porta né credenziali, al più 200 caratteri",
    badDescription: (max: number) => `descrizione mancante, oltre ${max} caratteri o con link e simboli < > [ ] \``,
    badDepartments: "reparti mancanti o sconosciuti (sigle come AISA, AIWDA)",
    badAgents: (max: number) => `agenti sconosciuti o più di ${max} (id come AISA-02)`,
    badAuthor: (max: number) => `nome da mostrare oltre ${max} caratteri o con link e simboli`,
    unreachable: UNREACHABLE,
    withdrawUnreachable: "Ritiro non riuscito: Agentrica non è raggiungibile (rete assente, timeout o rete non permessa). Riprova più tardi.",
    expired: EXPIRED,
    tooMany: "Limite di proposte di oggi raggiunto da questa rete. Riprova domani.",
    rejected: "Proposta respinta: dati non validi.",
    serviceError,
    withdrawn: "Richiesta di ritiro registrata.",
    withdrawError: (status: number) => `Ritiro non riuscito (errore ${status} del servizio). Riprova più tardi.`,
    notice: (privacy: string) =>
      "Il progetto compare sul sito solo dopo l'approvazione del titolare; descrizione e risultati restano tuoi e non li verifichiamo. " +
      `Parte solo ciò che vedi, con la versione del pacchetto; niente email né account. Informativa: ${privacy}`,
    form: {
      name: "Nome del progetto",
      url: "Link",
      urlHelp: "Un indirizzo https:// pubblico: repository, sito o pagina del progetto.",
      description: "Descrizione",
      descriptionHelp: "Cosa fa il progetto e come hai usato gli agenti. Testo semplice, senza link.",
      departments: "Reparti usati",
      departmentsHelp: "Sigle separate da virgole: AIBPD, AICA, AIPCA, AISA, AIWDA.",
      agents: "Agenti usati (facoltativo)",
      agentsHelp: "Id separati da virgole, es. AISA-02, AIWDA-08; al più 10.",
      author: "Nome da mostrare (facoltativo)",
      authorHelp: (fallback: string) => `Vuoto: «${fallback}».`,
      consent: "Consenso",
      license: "Licenza",
    },
    formMessage: (notice: string) => `Mostra il tuo progetto sul sito di Agentrica. ${notice}`,
    preview: (o: { code: string; name: string; url: string; description: string; departments: string; agents: string; author: string; version: string; consent: string; license: string; notice: string }) =>
      [
        "Anteprima della proposta del progetto:",
        `- nome: ${o.name}`,
        `- link: ${o.url}`,
        `- descrizione: ${o.description}`,
        `- reparti: ${o.departments}`,
        `- agenti: ${o.agents || "(nessuno)"}`,
        `- nome da mostrare: ${o.author}`,
        `- versione: ${o.version}`,
        `- consenso e licenza: sì («${o.consent}» «${o.license}»)`,
        "",
        o.notice,
        "",
        confirmStep("submit_project", o.code),
      ].join("\n"),
    sent: (name: string, code: string, privacy: string) =>
      `Proposta del progetto «${name}» inviata ad Agentrica: comparirà sul sito dopo l'approvazione. Codice della proposta: ${code}. ` +
      `Dillo all'utente e digli di conservarlo: è l'unico modo per ritirarla, con il comando project di Agentrica e l'argomento remove (${privacy}).`,
  },

  update: {
    global: (latest: string) => `Per aggiornare: npx -y @agentrica/mcp@${latest} install, poi riavvia il client.`,
    npx: (latest: string) => `Per aggiornare cambia la versione in @agentrica/mcp@${latest} nel comando del server (claude mcp add o .mcp.json), poi riavvia il client.`,
    source: "Per aggiornare il clone: git pull, poi riavvia il client.",
    message: (latest: string, current: string, how: string) => `È uscita la versione ${latest} di Agentrica (in uso la ${current}). ${how}`,
  },

  config: {
    tooBig: "più grande di 4 KB",
    badFormat: "formato non valido",
    unreadable: "non leggibile",
    form: {
      lang: "Lingua",
      langHelp: "Lingua dei testi del server, degli agenti e del pannello. Sistema: quella del computer.",
      langNames: ["Sistema", "Italiano", "English"],
      agents: "Squadra",
      agentsHelp: "Id di agenti e sigle di reparti separati da virgole, es. aisa,aiwda-08. Vuoto: tutti gli agenti.",
      panel: "Pannello locale",
      panelHelp: "Una pagina su questo computer con fasi, rilievi, agenti in uso e le scelte da prendere.",
      ratings: "Valutazioni degli agenti",
      ratingsHelp: "Il server ti chiede ogni tanto un voto sugli agenti. Non parte nulla senza la tua conferma.",
      updateCheck: "Avviso di versione nuova",
      updateCheckHelp: "All'avvio il server controlla sul registro npm se c'è una versione più recente.",
    },
    message: (path: string, fixed: boolean) =>
      [
        "Configura Agentrica.",
        `Le scelte si salvano sul tuo computer in ${path} e valgono dalla prossima sessione. Ad Agentrica non arriva nulla.`,
        "Per cambiarle usa il comando configure di Agentrica (in Claude Code /mcp__<nome del server>__configure); per tornare ai valori predefiniti cancella il file.",
        fixed ? "Le opzioni scritte nel comando del server non compaiono qui: hanno la precedenza." : "",
      ]
        .filter(Boolean)
        .join(" "),
  },

  setup: {
    scope: {
      user: "ambito user: tutti i tuoi progetti",
      project: "ambito project: .mcp.json in questa cartella, per il team",
      local: "ambito local: solo questo progetto, solo per te",
    },
    projectAndLocal: "scegli --project o --local, non entrambi",
    installScope: "install registra sempre con ambito user; per un progetto usa add --project o add --local",
    fromOnlyInstall: "--from vale solo per install",
    badAgents: "--agents: id di agenti e sigle di reparti separati da virgole, es. --agents aisa,aiwda-08",
    manual: "Comandi da lanciare a mano:",
    oldNode: (mode: string, version: string) => `agentrica ${mode}: serve Node.js 22 o più recente (in uso ${version}). Installalo da https://nodejs.org e rilancia:`,
    noNpm: "agentrica install: npm non trovato. Installa Node.js 22 o più recente (con npm) da https://nodejs.org e rilancia.",
    npmFailed: (win: boolean) =>
      `agentrica install: npm install -g non riuscito.${win ? "" : " Se è un problema di permessi, configura una cartella globale di npm tua (npm config set prefix) invece di usare sudo."}`,
    unknownRoot: "(cartella globale di npm sconosciuta)",
    serverMissing: (root: string) => `agentrica install: pacchetto installato ma server non trovato in ${root}.`,
    installed: (what: string, root: string) => `Installato ${what} in ${root}.`,
    noClaude: "agentrica: Claude Code (comando claude) non trovato. Installalo e rilancia questo comando, oppure registra il server a mano:",
    otherClients: "Per altri client MCP usa lo stesso comando del server nella loro configurazione (README di @agentrica/mcp).",
    addFailed: "agentrica: claude mcp add non riuscito.",
    registered: (version: string, scope: string, replaced: boolean) =>
      `Agentrica ${version} registrato in Claude Code (${scope})${replaced ? ", al posto della registrazione precedente" : ""}.`,
    command: (command: string) => `Comando del server: ${command}`,
    otherScope: (scope: string, name: string, other: string) =>
      `Attenzione: Agentrica è registrato anche con ${scope}, con un comando che può essere diverso. Claude Code usa la registrazione più vicina al progetto (local, poi project, poi user). Se non ti serve, toglila con: claude mcp remove ${name} --scope ${other}`,
    restart: "Riavvia Claude Code (o usa /mcp) e controlla con: claude mcp list",
  },

  init: {
    /** I subagent di Agentrica nominano il progetto solo in questa frase (lo controlla init.test.ts). */
    subagentProject: (name: string) => `del progetto ${name}.`,
    subagentFirst: (id: string) =>
      `Primo passo: chiama il tool \`mcp__agentrica__agent\` del server MCP di Agentrica con id \`${id}\` e il compito che hai ricevuto. ` +
      "Le istruzioni che restituisce sono il tuo ruolo, con le regole comuni del reparto, e fanno comparire l'agente nel pannello: con quelle non serve rileggere i file indicati qui sotto, che restano il riferimento se il tool non risponde. Non caricare il direttore del reparto: ti ha avviato la sessione principale, che coordina.",
    inRepo: "git: la cartella è già in un repository, nessun commit",
    noGit: "git: non installato, repository non creato",
    commit: "Progetto creato con @agentrica/mcp init",
    commitFailed: "git: commit non riuscito (configura user.name e user.email), file lasciati in stage su main",
    committed: "git: commit iniziale su main, branch develop attivo",
    usage: 'uso: agentrica-mcp init [cartella] [--name "Nome"] [--lang it|en] [--subagents]',
    badName: "--name: serve un nome su una riga",
    taken: (files: string, more: number) => `nessun file scritto, esistono già: ${files}${more > 0 ? ` e altri ${more}` : ""}`,
    created: (name: string, dir: string, count: number) => `Progetto «${name}» creato in ${dir}: ${count} file.`,
    next: "Prossimi passi:",
    step1: (dir: string) => `  1. cd "${dir}" e apri Claude Code (.mcp.json registra il server di Agentrica con il pannello)`,
    step2: "  2. chiedi di aprire la fase F0 (plan/00-base.md): stack, agenzie attive, sezioni «da compilare»",
  },

  panel: {
    error: "Errore del pannello.",
    badHost: "Host non valido.",
    badToken: "Token non valido.",
    openFromTool: "Apri il pannello dall'URL che dà il tool open_panel dell'agente.",
    badOrigin: "Origine non valida.",
    needJson: "Serve JSON.",
    badRequest: "Richiesta non valida.",
    badRating: "Valutazione non valida.",
    badCode: "Codice non valido.",
    notPending: "La domanda non è più in attesa.",
    badAnswer: "Risposta non valida.",
    notFound: "Non trovato.",
  },

  project: {
    noPlan: "Non trovo plan/README.md: il pannello legge il formato creato da `agentrica-mcp init` (vedi il README del pacchetto).",
    noPhases: "In plan/README.md manca la tabella «## Fasi» (Fase | File | Contenuto | Stato).",
    noPhaseFile: (file: string, id: string) => `Non trovo plan/${file}, il file della fase ${id}.`,
    noBacklog: (file: string) => `In plan/${file} manca la sezione «## Backlog».`,
    badJson: (source: string) => `audit/${source} non è un JSON leggibile: saltato.`,
    noFindings: (source: string) => `audit/${source} non ha l'elenco «rilievi»: saltato.`,
  },
};

export type Texts = typeof it;
