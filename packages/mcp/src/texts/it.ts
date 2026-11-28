// Testi italiani del server MCP (F32): istruzioni, risposte dei tool, moduli, CLI e messaggi del pannello.
// en.ts ha la stessa forma (tipo Texts); la lingua si sceglie in texts/index.ts. Nessun testo per l'utente resta sparso
// nei moduli del server: qui e in page/texts.it.js per la pagina del pannello.

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const UNREACHABLE = "Invio non riuscito: AIgentrica non è raggiungibile (rete assente, timeout o rete non permessa). Riprova più tardi.";
const EXPIRED = "Codice scaduto o già usato: prepara di nuovo l'anteprima.";
const serviceError = (status: number) => `Invio non riuscito (errore ${status} del servizio). Riprova più tardi.`;
const CODE_STEP = "Il codice dell'anteprima, solo dopo il sì dell'utente (secondo passo).";
const confirmStep = (tool: string, code: string) =>
  `Mostra questa anteprima all'utente e chiedigli se inviarla. Solo dopo il suo sì richiama ${tool} con code "${code}" (valido 10 minuti, una volta). Se dice no, non fare nulla.`;
const AGENT_NOT_FOUND = "Agente non trovato: usa list_agents per vedere gli id.";

/** Il formato di plan/ (F58-06): nel testo dei direttori e nella descrizione di check, non nelle istruzioni del server. */
const PLAN_FORMAT =
  "Formato di plan/: README.md con la tabella «## Fasi» (Fase | File | Contenuto | Stato; id F0, F1…; stato da fare, in corso o completata) e un file NN-nome.md per fase con «**Obiettivo**:», «## Backlog» in tabella (# | Attività | Priorità; id FN-NN) e «## Criteri di accettazione».";

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
      `L'utente ha valutato ${name} con il modulo: inviata, codice ${code}. Diglielo: con questo codice può chiedere di cancellarla o di non pubblicare il commento (note legali di AIgentrica).`,
    ratingFailed: (name: string, message: string) => `La valutazione di ${name} non è partita: ${message}`,
    configClosed: "L'utente ha chiuso il modulo della configurazione: non cambia nulla.",
    configInvalid: "Configurazione non salvata: il modulo aveva dati non validi.",
    configBadSquad: (reason: string) => `Configurazione non salvata: ${reason}. Dillo all'utente: può riprovare con il comando configure di AIgentrica.`,
    configWriteFailed: (path: string, reason: string) => `Configurazione non salvata in ${path}: ${reason}.`,
    configSaved: (path: string) => `Configurazione di AIgentrica salvata in ${path}: vale dalla prossima sessione. Dillo all'utente in una riga.`,
    configDefaultsSaved: (path: string) =>
      `L'utente ha chiuso il modulo della configurazione: salvati i valori predefiniti in ${path}, il modulo non ricompare. Si cambiano con il comando configure di AIgentrica.`,
    instructions: (o: { agents: number; departments: number; codes: string; example: string; exampleId: string; panel: boolean; ratings: boolean }) =>
      `AIgentrica: ${plural(o.agents, "agente IA", "agenti IA")} in ${plural(o.departments, "reparto", "reparti")} (${o.codes}). ` +
      "Ogni lavoro sul progetto dell'utente (funzioni, modifiche, scelte di stack, fasi, audit) passa dagli agenti di AIgentrica, anche se l'utente non li nomina; senza agenti solo se l'utente lo chiede. " +
      "Per scegliere un agente usa list_agents; per lavorare come quell'agente carica le sue istruzioni con agent. " +
      "Per un compito di un reparto carica prima il direttore (l'agente -01, segnato in list_agents), che sceglie gli specialisti e l'ordine; " +
      "poi carica gli specialisti con agent uno alla volta, ognuno dal passaggio di consegne del precedente (esito, rilievi con l'evidenza, domande aperte), mai due nella stessa risposta; il direttore consolida e presenta all'utente. " +
      "Fra reparti l'ordine è business → design → privacy → conferma dell'utente → software → revisioni di design e privacy → Code Reviewer → conferma dell'utente. " +
      // F48-03: su un progetto nuovo (F0 da fare) il modello partiva dal software per la base tecnica.
      "Una richiesta di una funzione nuova parte da list_agents e poi dal direttore business, anche se il progetto non ha ancora lo stack o F0 è da fare: la base tecnica è lavoro del software, dopo la conferma. " +
      "Per gli agenti di AIgentrica usa agent e non i subagent locali (tool Agent di Claude Code, .claude/agents/): avvia un subagent solo se l'utente lo chiede. " +
      "Le istruzioni contengono l'indice della biblioteca del reparto: le schede che servono al compito si leggono con library. " +
      // F41-02: regole e indice una volta per reparto; come riaverli dopo /compact.
      "Regole comuni e indice arrivano interi al primo agente di ogni reparto, poi come riferimento: dopo /compact o /clear, o se non li hai nel contesto, richiama agent con full_rules true. " +
      `I prompt hanno il nome dell'id dell'agente e del reparto, es. ${o.example}; il tool agent vuole l'id, es. ${o.exampleId}. ` +
      // F58-06: il formato di plan/ sta nel testo dei direttori e nella descrizione di check, non qui.
      "Il lavoro va per fasi in plan/; il formato lo danno i direttori e check, da usare dopo aver scritto in plan/ o audit/. Se plan/ manca, proponi di crearlo leggendo il codice. " +
      "Pianificare è una sessione a sé: solo plan/, conferma dell'utente, poi proponi /clear senza sviluppare. Una fase per sessione; alla chiusura proponi /clear." +
      // F39-04: cosa esce dal computer, per chi lavora con la regola «non esce niente».
      " I dati restano sul computer: " +
      (o.ratings ? "inviano ad AIgentrica solo rate_agent, share_usage e submit_project, dopo l'anteprima e il sì dell'utente; " : "") +
      "fuori va solo, se attivo, il controllo delle versioni nuove sul registro npm." +
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
      title: "Valuta un agente di AIgentrica",
      description: "Apre il modulo di valutazione per l'agente in uso o per quello indicato.",
      agent: "Id dell'agente, es. AISA-02. Senza: l'ultimo agente in uso.",
      noneUsed: "L'utente vuole valutare un agente di AIgentrica, ma in questa sessione non ne è stato usato nessuno. Chiedigli quale (id come AISA-02) e poi usa rate_agent.",
      notInSquad: "L'utente vuole valutare un agente, ma l'id non è fra gli agenti di questa squadra. Chiedigli quale (list_agents dà gli id) e poi usa rate_agent.",
      alreadyRated: (name: string) => `${name} è già stato valutato in questa sessione: dillo all'utente.`,
      manual: (name: string, id: string) =>
        `L'utente vuole valutare ${name}. Chiedigli il voto da 1 a 5, un commento facoltativo e se permette di pubblicarlo sul sito, ` +
        `poi usa rate_agent con id ${id}: mostragli l'anteprima e invia solo dopo il suo sì.`,
      closed: (name: string) => `L'utente ha chiuso il modulo di valutazione di ${name}: non fare altro.`,
    },

    project: {
      title: "Mostra il tuo progetto sul sito di AIgentrica",
      description: "Propone un progetto fatto con AIgentrica per la pagina dei progetti del sito, senza account GitHub; con remove lo ritira.",
      remove: "Il codice della proposta da ritirare.",
      badCode:
        "Il testo dopo il comando project è il codice di una proposta da ritirare, e questo non lo è (serve un UUID come 3f2a…-…). Dillo all'utente: per proporre un progetto si lancia il comando project senza argomenti; per ritirarne uno serve il codice ricevuto all'invio.",
      withdrawn:
        "Richiesta di ritiro registrata: se il codice è giusto, la proposta non compare più; se era già sul sito, si toglie con il prossimo aggiornamento, entro 30 giorni. Dillo all'utente.",
      tellUser: (message: string) => `${message} Dillo all'utente.`,
      manual:
        "L'utente vuole proporre un suo progetto fatto con AIgentrica per il sito. Chiedigli nome, link https, descrizione (280 caratteri, senza link), " +
        "reparti usati, agenti usati e nome da mostrare (facoltativi), e se dà consenso e licenza (testi nella descrizione di submit_project). " +
        "Poi usa submit_project: mostragli l'anteprima e invia solo dopo il suo sì.",
      closed: "L'utente ha chiuso il modulo del progetto: non parte nulla.",
      badFields: (reason: string) => `La proposta non è partita: ${reason}. Dillo all'utente: può riprovare con il comando project di AIgentrica.`,
      failed: (message: string) => `La proposta non è partita: ${message}`,
    },

    submit: {
      title: "Proponi un progetto per il sito di AIgentrica",
      description:
        "Propone un progetto fatto con AIgentrica per la pagina dei progetti del sito, se l'utente lo chiede (anche senza account GitHub). " +
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
      title: "Configura AIgentrica",
      description: (path: string) => `Sceglie lingua, squadra, pannello, valutazioni e avviso di versione; le scelte si salvano in ${path}.`,
      flagsNote: "Le opzioni del comando del server (--lang, --agents, --panel, --no-panel, --no-ratings, --no-update-check) hanno la precedenza sul file.",
      noPermission: (path: string) =>
        `Il server gira con il permission model di Node senza accesso a ${path}: la configurazione non si salva. Dillo all'utente: può usare le opzioni del comando del server (--lang, --agents, --no-panel, --no-ratings, --no-update-check).`,
      allFixed: (path: string) => `Tutte le scelte sono fissate dalle opzioni del comando del server: il file ${path} non conta. Dillo all'utente.`,
      noForms: (config: string, path: string, flagsNote: string) =>
        `L'utente vuole configurare AIgentrica, ma questo client non mostra i moduli. Configurazione attuale: ${config}. ` +
        `Chiedigli cosa cambiare (lang: it, en o vuota per la lingua del sistema; agents: squadra come --agents, vuota per tutti; panel, ratings, updateCheck: true o false) e scrivi il JSON in ${path}, ` +
        `con le stesse chiavi e version 1. Vale dalla prossima sessione. ${flagsNote}`,
      formNotShown: (path: string, flagsNote: string) => `Il modulo non è comparso. L'utente può scrivere a mano ${path} o usare le opzioni del comando del server. ${flagsNote}`,
    },

    listAgents: {
      title: "Elenca gli agenti di AIgentrica",
      description: "Elenca gli agenti di AIgentrica con id, nome in codice, ruolo, reparto e, dove è stato misurato, il modello consigliato. Il reparto è facoltativo.",
      department: "Sigla del reparto.",
      lead: (director: string) => `Direttore: ${director}. Per un compito del reparto si carica per primo, poi gli specialisti uno alla volta.`,
    },

    agent: {
      title: "Istruzioni di un agente",
      description:
        "Restituisce le istruzioni di un agente (regole comuni del reparto e file di ruolo), da seguire per lavorare come quell'agente. " +
        "Regole comuni e indice della biblioteca arrivano interi al primo agente del reparto nella sessione, ai successivi come riferimento, salvo full_rules.",
      fullRules: "true: regole comuni e indice della biblioteca interi anche se già inviati in questa sessione (dopo /compact o /clear, in un subagent o in un contesto nuovo).",
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
      title: "Invia ad AIgentrica i totali di token",
      description:
        "Invia ad AIgentrica, in forma anonima, i totali di token di questo progetto negli ultimi 30 giorni (per giorno, agente, modello ed effort), " +
        "che il sito somma a quelli degli altri utenti. In due passi: 1) senza code restituisce l'anteprima di ciò che parte e un codice; " +
        "2) mostra l'anteprima all'utente, chiedigli se inviarla e solo dopo il suo sì richiama il tool con quel code. Non inviare mai senza il sì dell'utente.",
      code: CODE_STEP,
      sent: (rows: number) => `Totali inviati ad AIgentrica (${rows} righe), grazie. Dillo all'utente.`,
    },

    rateAgent: {
      title: "Valuta un agente di AIgentrica",
      description:
        "Invia ad AIgentrica la valutazione di un agente (voto 1–5, commento facoltativo), in forma anonima, in due passi. " +
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
        "Dillo all'utente: con questo codice può chiedere di cancellarla o di non pubblicare il commento (note legali di AIgentrica).",
      needRating: "Serve il voto da 1 a 5 per preparare l'anteprima.",
    },

    check: {
      title: "Controllo del formato di plan/ e audit/",
      description:
        "Controlla senza modelli la forma dei file di plan/ e audit/ della cartella del progetto: tabelle, campi obbligatori, id univoci, file collegati che esistono. " +
        "Segnala anche le contraddizioni (stesso rilievo con valori diversi, rilievo chiuso senza evidenza, fase completata con attività P0 senza esito), con entrambe le posizioni. Non modifica nulla. " +
        PLAN_FORMAT,
      unreadable: (why: string) => `Non riesco a leggere la cartella del progetto: ${why}`,
    },

    report: {
      title: "Resoconto di un agente per il pannello",
      description:
        "Salva nel pannello locale il resoconto di ciò che un agente ha fatto, mostrato sotto l'agente fra gli agenti in uso. " +
        "Chiamalo quando l'agente finisce il suo compito, prima di passare a un altro. Resta sul computer dell'utente.",
      summary: "Il passaggio di consegne dell'agente, in breve: esito, rilievi con l'evidenza (file e riga, comando), domande aperte. Al più 4000 caratteri.",
      saved: (name: string) => `Resoconto di ${name} salvato nel pannello.`,
      missing: (parts: string) => `Nel resoconto non trovo ${parts}: il passaggio di consegne ha esito, rilievi con l'evidenza e domande aperte (anche «nessuno»). Il resoconto è salvato com'è; se manca qualcosa, rimandalo.`,
      parts: { outcome: "l'esito", findings: "i rilievi", questions: "le domande aperte" },
      notLoaded: "Resoconto non salvato: l'agente non è stato caricato in questa sessione (tool agent).",
    },

    openPanel: {
      title: "Apri il pannello di AIgentrica",
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
    model: (model: string) => `Modello consigliato: ${model}, misurato sui casi di prova di AIgentrica.`,
    libraryHeading: "Biblioteca del reparto",
    libraryExpired: ", da ricontrollare",
    libraryHelp: (id: string) =>
      "Schede con nozioni recenti verificate su fonti ammesse alla data indicata: per questi temi valgono più delle tue conoscenze. " +
      `Se il compito tocca una scheda (con * quelle del tuo ruolo), leggila con il tool library (id ${id}, cards con gli id) e cita fonte, versione e data. ` +
      "Una scheda da ricontrollare va verificata sulla fonte se hai il web, altrimenti avverti l'utente.",
    libraryKnown: (id: string, mine: string) =>
      "Vale l'indice della biblioteca ricevuto con le regole comuni. " +
      (mine ? `Schede del tuo ruolo: ${mine}. ` : "Nessuna scheda è segnata per il tuo ruolo. ") +
      `Le schede si leggono con il tool library (id ${id}); cita fonte, versione e data.`,
    cardExpired: " Scaduta: verificala sulla fonte prima di usarla, o dillo all'utente.",
    cardSource: (o: { name: string; level: number; version: string; verified: string; review: string; expired: string; roles: string }) =>
      `Fonte: ${o.name} (livello ${o.level}), versione ${o.version}. Verificata il ${o.verified}, da ricontrollare entro il ${o.review}.${o.expired} Ruoli: ${o.roles}.`,
    notion: "Nozione",
    application: "Come si applica",
    you: (codeName: string, summary: string) =>
      `Sei ${codeName}, un agente IA di AIgentrica: ${summary} ` +
      "Lavori nel progetto dell'utente. Seguono le regole comuni del tuo reparto e il tuo file di ruolo: applicale al progetto così com'è, senza presumere stack, comandi o file che non hai verificato. " +
      "Se il progetto è vuoto o manca ciò che il tuo ruolo deve esaminare, dillo e proponi i primi passi (obiettivo, stack, struttura) da confermare con l'utente; non inventare rilievi né scegliere lo stack da solo. " +
      "Questi testi sono in italiano: rispondi nella lingua in cui ti scrive l'utente.",
    subagent: (advice: string) =>
      `${advice} Se il progetto ha i subagent di AIgentrica (init --subagents) e l'utente chiede di usarli, quello di questo ruolo ha già questo modello; altrimenti continua con il modello della sessione.`,
    lead: (code: string) =>
      `Sei il direttore del reparto: per il compito scegli gli specialisti che servono e l'ordine (list_agents con department ${code} li elenca). ` +
      "La sessione li carica con agent uno alla volta, ognuno dal passaggio di consegne del precedente, non dalla sua risposta intera; alla fine consolidi i risultati e li presenti all'utente, che li conferma. " +
      PLAN_FORMAT,
    reportsTo: (director: string, id: string) =>
      `Riporti a ${director}, il direttore del reparto: se in questa sessione non è ancora stato caricato, caricalo prima con agent (id ${id}). ` +
      "Lavori sulla parte che ti assegna e gli consegni in breve: esito, rilievi con l'evidenza (file e riga, comando), domande aperte.",
    noLead: "Il direttore del reparto non è nella squadra di questo server: lavori direttamente sul compito e consegni all'utente.",
    present: (intro: string) =>
      `L'utente deve sempre sapere chi sta lavorando. Presentati all'inizio con questa riga: «${intro}». ` +
      "Ripetila quando passi a un altro agente o lasci il ruolo, e firma con il tuo nome in codice i rilievi e il riepilogo finale.",
    rules: "Regole comuni del reparto",
    rulesKnown: (code: string, id: string) =>
      `Valgono le regole comuni del reparto ${code}, ricevute intere in questa sessione con un altro agente del reparto: applicale anche qui. ` +
      `Se non le hai nel contesto (dopo /compact o /clear, in un subagent o in una conversazione nuova), richiama agent con id ${id} e full_rules true prima di lavorare.`,
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
      publish: "Pubblica il commento sul sito di AIgentrica",
    },
    formMessage: (name: string, notice: string) =>
      `Valuta ${name}. Invia il modulo per mandare la valutazione ad AIgentrica, in forma anonima; rifiuta e non te la chiediamo più per questo agente. ${notice}`,
  },

  share: {
    notice: (privacy: string) =>
      "Partono solo questi numeri: niente testi, nomi di file, percorsi, progetto né id di sessione; i subagent che non sono di AIgentrica diventano «altro». " +
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
    previewHead: (rows: number, version: string) => `Anteprima dei totali di token da inviare ad AIgentrica (${rows} righe, ultimi 30 giorni, versione ${version}):`,
    omitted: (n: number) => `(${n} righe più vecchie restano fuori: al più 300 per invio)`,
    confirm: (code: string) => confirmStep("share_usage", code),
  },

  showcase: {
    consent:
      "Acconsento a che AIgentrica pubblichi sul suo sito i dati di questo modulo (nome da mostrare, nome, link, descrizione, reparti, agenti, versione) e la data di approvazione, finché non chiedo di toglierli.",
    license: "Concedo ad AIgentrica, senza compenso, il permesso di mostrare sul sito nome e descrizione del progetto finché non chiedo di toglierli, e dichiaro di poterlo fare.",
    defaultAuthor: "Utente di AIgentrica",
    noAuthor: "nessuno (il sito scrive «Utente di AIgentrica» o, in inglese, «AIgentrica user»)",
    needConsent: "servono il consenso e la licenza",
    badName: (max: number) => `nome mancante, oltre ${max} caratteri o con link e simboli < > [ ] \``,
    badUrl: "il link deve essere un indirizzo https:// completo, senza porta né credenziali, al più 200 caratteri",
    badDescription: (max: number) => `descrizione mancante, oltre ${max} caratteri o con link e simboli < > [ ] \``,
    badDepartments: "reparti mancanti o sconosciuti (sigle come AISA, AIWDA)",
    badAgents: (max: number) => `agenti sconosciuti o più di ${max} (id come AISA-02)`,
    badAuthor: (max: number) => `nome da mostrare oltre ${max} caratteri o con link e simboli`,
    unreachable: UNREACHABLE,
    withdrawUnreachable: "Ritiro non riuscito: AIgentrica non è raggiungibile (rete assente, timeout o rete non permessa). Riprova più tardi.",
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
    formMessage: (notice: string) => `Mostra il tuo progetto sul sito di AIgentrica. ${notice}`,
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
      `Proposta del progetto «${name}» inviata ad AIgentrica: comparirà sul sito dopo l'approvazione. Codice della proposta: ${code}. ` +
      `Dillo all'utente e digli di conservarlo: è l'unico modo per ritirarla, con il comando project di AIgentrica e l'argomento remove (${privacy}).`,
  },

  update: {
    global: (latest: string) => `Per aggiornare: npx -y @aigentrica/mcp@${latest} install, poi riavvia il client.`,
    npx: (latest: string) => `Per aggiornare cambia la versione in @aigentrica/mcp@${latest} nel comando del server (claude mcp add o .mcp.json), poi riavvia il client.`,
    source: "Per aggiornare il clone: git pull, poi riavvia il client.",
    message: (latest: string, current: string, how: string) => `È uscita la versione ${latest} di AIgentrica (in uso la ${current}). ${how}`,
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
        "Configura AIgentrica.",
        `Le scelte si salvano sul tuo computer in ${path} e valgono dalla prossima sessione. Ad AIgentrica non arriva nulla.`,
        "Per cambiarle usa il comando configure di AIgentrica (in Claude Code /mcp__<nome del server>__configure); per tornare ai valori predefiniti cancella il file.",
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
    oldNode: (mode: string, version: string) => `aigentrica ${mode}: serve Node.js 22 o più recente (in uso ${version}). Installalo da https://nodejs.org e rilancia:`,
    noNpm: "aigentrica install: npm non trovato. Installa Node.js 22 o più recente (con npm) da https://nodejs.org e rilancia.",
    npmFailed: (win: boolean) =>
      `aigentrica install: npm install -g non riuscito.${win ? "" : " Se è un problema di permessi, configura una cartella globale di npm tua (npm config set prefix) invece di usare sudo."}`,
    unknownRoot: "(cartella globale di npm sconosciuta)",
    serverMissing: (root: string) => `aigentrica install: pacchetto installato ma server non trovato in ${root}.`,
    installed: (what: string, root: string) => `Installato ${what} in ${root}.`,
    noClaude: "aigentrica: Claude Code (comando claude) non trovato. Installalo e rilancia questo comando, oppure registra il server a mano:",
    otherClients: "Per altri client MCP usa lo stesso comando del server nella loro configurazione (README di @aigentrica/mcp).",
    addFailed: "aigentrica: claude mcp add non riuscito.",
    registered: (version: string, scope: string, replaced: boolean) =>
      `AIgentrica ${version} registrato in Claude Code (${scope})${replaced ? ", al posto della registrazione precedente" : ""}.`,
    command: (command: string) => `Comando del server: ${command}`,
    otherScope: (scope: string, name: string, other: string) =>
      `Attenzione: AIgentrica è registrato anche con ${scope}, con un comando che può essere diverso. Claude Code usa la registrazione più vicina al progetto (local, poi project, poi user). Se non ti serve, toglila con: claude mcp remove ${name} --scope ${other}`,
    legacyRemoved: (scope: string) => `Tolta la vecchia registrazione «agentrica» (${scope}): AIgentrica è il nuovo nome di Agentrica.`,
    restart: "Riavvia Claude Code (o usa /mcp) e controlla con: claude mcp list",
  },

  init: {
    /** I subagent di AIgentrica nominano il progetto solo in questa frase (lo controlla init.test.ts). */
    subagentProject: (name: string) => `del progetto ${name}.`,
    subagentFirst: (id: string) =>
      `Primo passo: chiama il tool \`mcp__aigentrica__agent\` del server MCP di AIgentrica con id \`${id}\`, \`full_rules\` true e il compito che hai ricevuto. ` +
      "Le istruzioni che restituisce sono il tuo ruolo, con le regole comuni del reparto intere (un subagent ha un contesto suo), e fanno comparire l'agente nel pannello: con quelle non serve rileggere i file indicati qui sotto, che restano il riferimento se il tool non risponde. Non caricare il direttore del reparto: ti ha avviato la sessione principale, che coordina.",
    inRepo: "git: la cartella è già in un repository, nessun commit",
    noGit: "git: non installato, repository non creato",
    commit: "Progetto creato con @aigentrica/mcp init",
    commitFailed: "git: commit non riuscito (configura user.name e user.email), file lasciati in stage su main",
    committed: "git: commit iniziale su main, branch develop attivo",
    usage: 'uso: aigentrica-mcp init [cartella] [--name "Nome"] [--lang it|en] [--subagents] [--existing] [--no-reminder]',
    badName: "--name: serve un nome su una riga",
    taken: (files: string, more: number) => `nessun file scritto, esistono già: ${files}${more > 0 ? ` e altri ${more}` : ""}`,
    created: (name: string, dir: string, count: number) => `Progetto «${name}» creato in ${dir}: ${count} file.`,
    next: "Prossimi passi:",
    step1: (dir: string) => `  1. cd "${dir}" e apri Claude Code (.mcp.json registra il server di AIgentrica con il pannello)`,
    step1Registered: (dir: string) => `  1. cd "${dir}" e apri Claude Code (.mcp.json c'era già ed è stato saltato: il server di AIgentrica deve esserci, o registrato con add)`,
    step2: "  2. chiedi di aprire la fase F0 (plan/00-base.md): stack, agenzie attive, sezioni «da compilare»",
    added: (name: string, dir: string, count: number) => `Regole di AIgentrica aggiunte a «${name}» in ${dir}: ${count} file nuovi.`,
    skipped: (files: string) => `Saltati perché esistono già: ${files}`,
    /** Il promemoria dell'hook UserPromptSubmit (F39-01), a ogni richiesta: niente ' " $ ` % ! \ perché passa dalla shell. */
    reminder: "AIgentrica: se questa richiesta è un lavoro sul progetto, carica prima l’agente adatto con il tool agent di AIgentrica (sceglilo con list_agents); senza agenti solo se l’utente lo chiede.",
    reminderSkipped: "Il promemoria non è stato aggiunto perché .claude/settings.json c'era già: per aggiungerlo senza toccare il resto lancia npx @aigentrica/mcp reminder.",
    reminderUsage: "uso: aigentrica-mcp reminder [cartella] [--lang it|en]",
    reminderAdded: (file: string) => `Promemoria aggiunto in ${file}: Claude Code lo legge dalla prossima sessione.`,
    reminderPresent: "Il promemoria c'è già in .claude/settings.json: nessuna modifica.",
    reminderBadSettings: ".claude/settings.json non è un oggetto JSON con hooks e UserPromptSubmit nella forma di Claude Code: non l'ho toccato. Correggilo o aggiungi l'hook a mano (vedi «Promemoria» nel README di @aigentrica/mcp).",
    importAgents: "Il tuo CLAUDE.md non è stato toccato: aggiungi una riga «@AGENTS.md» perché Claude Code legga le regole di AIgentrica.",
    noCommit: "git: nessun commit, i file nuovi sono da rivedere e da aggiungere tu",
    stepExisting: "  2. chiedi a Claude «Crea le fasi del progetto dal codice esistente»: scrive solo plan/, si ferma al backlog e propone /clear",
    /** L'ultima riga di plan/README.md con --existing, al posto dell'ordine delle fasi. */
    noPhases: "Nessuna fase ancora: chiedi a Claude di crearle leggendo il codice esistente. In quella sessione si scrivono solo le fasi con backlog e criteri, poi `/clear`; ogni fase si apre in una sessione nuova.",
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
    noPlan:
      "Questo progetto non ha ancora un piano (plan/README.md). Per crearlo esegui `npx @aigentrica/mcp init --existing`, che aggiunge le regole di AIgentrica senza toccare i tuoi file, oppure chiedi a Claude «Crea il piano del progetto dal codice esistente».",
    emptyPlan: "Il piano non ha ancora fasi. Chiedi a Claude «Crea le fasi del progetto dal codice esistente»: scrive solo plan/ e si ferma al backlog.",
  },

  check: {
    ok: "plan/ e audit/: nessun problema di formato.",
    errors: (n: number) => (n === 1 ? "1 errore di formato:" : `${n} errori di formato:`),
    contradictions: (n: number) => (n === 1 ? "1 contraddizione (entrambe le posizioni, senza scegliere quale vale):" : `${n} contraddizioni (entrambe le posizioni, senza scegliere quale vale):`),
    noPhases: "manca la tabella «## Fasi» (Fase | File | Contenuto | Stato).",
    phaseNoId: "riga della tabella «Fasi» senza id della fase.",
    phaseNoStatus: (id: string) => `la fase ${id} non ha lo stato.`,
    badLink: (target: string, id: string) => `il file della fase ${id} (${target}) deve essere un nome di file .md dentro plan/.`,
    unreadable: (why: string) => `non si può leggere: ${why}.`,
    accessDenied: "accesso negato dal permission model di Node, serve --allow-fs-read per la cartella del progetto",
    outsideProject: "è un link fuori dalla cartella del progetto",
    tooLarge: "file troppo grande",
    missingPhaseFile: (file: string, id: string) => `non trovo plan/${file}, il file della fase ${id}.`,
    noTitle: "manca il titolo «# …».",
    noGoal: "manca la riga «**Obiettivo**: …».",
    noBacklog: "manca la sezione «## Backlog» con la tabella (# | Attività | Priorità).",
    taskNoId: "riga del backlog senza id dell'attività.",
    taskPriority: (id: string) => `l'attività ${id} non ha una priorità P0–P3.`,
    duplicate: (id: string, first: number) => `l'id ${id} compare già alla riga ${first}.`,
    openP0: (id: string, phase: string, line: number) => `la fase ${phase} è completata (plan/README.md:${line}), ma l'attività P0 ${id} non è in «Fatto».`,
    badJson: "non è un JSON leggibile.",
    badField: (id: string, field: string) => (id ? `il rilievo ${id}: campo ${field} mancante o non valido.` : `campo ${field} mancante o non valido.`),
    duplicateFinding: (id: string) => `il rilievo ${id} compare due volte nel file.`,
    closedNoEvidence: (id: string) => `il rilievo ${id} è chiuso ma non ha l'evidenza (evidenza/evidence).`,
    sameIdDiffers: (id: string, where: string, fields: string) => `il rilievo ${id} c'è anche in ${where}, con valori diversi in ${fields}.`,
    usage: "Uso: aigentrica-mcp check [cartella del progetto]",
    noDir: (dir: string) => `Non trovo la cartella ${dir}.`,
  },
  cli: {
    usage:
      "Uso: aigentrica-mcp list [REPARTO] | agent ID [--task \"compito\"] | library ID SCHEDA… (es. agent aisa-12, library aica-02 owasp-top-10-2025).",
    unknownDepartment: (given: string, codes: string) => `Reparto sconosciuto: ${given}. Reparti: ${codes}.`,
    agentNotFound: "Agente non trovato: `aigentrica-mcp list` elenca gli id.",
  },
};

export type Texts = typeof it;
