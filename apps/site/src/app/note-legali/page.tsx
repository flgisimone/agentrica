import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Note legali · Agentrica",
  description: "Chi pubblica il sito di Agentrica, quali dati tratta l'hosting e cosa non fa il sito: niente cookie, niente analytics.",
};

const REPO = "https://github.com/flgisimone/agentrica";
const sectionTitle = "mb-3 text-[clamp(1.25rem,1rem+1vw,1.5rem)] font-bold";
const body = "grid max-w-3xl gap-3 text-muted-foreground";

// ponytail: testo scritto con i ruoli privacy (AIPCA-03, AIPCA-06), non rivisto da un legale; va riletto da una persona
// competente prima di aggiungere cookie, analytics, moduli o un MCP remoto.
export default function LegalNotes() {
  return (
    <PageTransition>
      <div className="page-intro wrap pt-10 pb-12">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden className="size-4" />
          Agentrica
        </Link>
        <h1 className="mt-8 text-[clamp(2.25rem,1.4rem+4vw,3.75rem)] font-extrabold tracking-[-0.03em]">Note legali</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          Agentrica è una società fittizia: questo sito presenta un progetto aperto, non vende servizi e non raccoglie
          dati dai visitatori.
        </p>
      </div>

      <main id="contenuto" className="wrap grid gap-12 pb-16">
        <section aria-labelledby="titolare">
          <h2 id="titolare" className={sectionTitle}>
            Chi pubblica il sito
          </h2>
          <div className={body}>
            <p>
              Il sito e il server MCP sono pubblicati da Giulio Simone Floresta, titolare del trattamento per i dati
              descritti qui sotto. Il codice e i file degli agenti sono nel{" "}
              <a href={REPO} className="underline">
                repository su GitHub
              </a>
              , con licenza MIT.
            </p>
            <p>
              Per domande o richieste apri una{" "}
              <a href={`${REPO}/issues`} className="underline">
                issue sul repository
              </a>
              . Le issue sono pubbliche: non scriverci dati personali; se la richiesta li riguarda, chiedi nell&apos;issue
              un contatto privato.
            </p>
          </div>
        </section>

        <section aria-labelledby="dati">
          <h2 id="dati" className={sectionTitle}>
            Quali dati tratta il sito
          </h2>
          <div className={body}>
            <p>
              Il sito non usa cookie, analytics, pixel, moduli né account, e non carica risorse da altri siti: anche i
              font sono serviti dal sito stesso.
            </p>
            <p>
              Il sito è ospitato da Vercel Inc. Come ogni server web, a ogni visita Vercel riceve e registra nei suoi log
              i dati tecnici della richiesta, fra cui l&apos;indirizzo IP, la pagina chiesta, la data e il browser. Servono
              a far funzionare il sito e a proteggerlo da abusi (legittimo interesse, art. 6.1.f del GDPR). Vercel li
              tratta per conto del titolare, li conserva per il tempo previsto dal suo servizio e può trattarli anche
              fuori dallo Spazio economico europeo, con le garanzie descritte nella sua informativa privacy e nel suo
              accordo sul trattamento dei dati.
            </p>
            <p>Il titolare non usa questi log per altri scopi e non li unisce ad altri dati.</p>
          </div>
        </section>

        <section aria-labelledby="diritti">
          <h2 id="diritti" className={sectionTitle}>
            I tuoi diritti
          </h2>
          <div className={body}>
            <p>
              Puoi chiedere accesso, rettifica, cancellazione o limitazione dei tuoi dati e opporti al trattamento (artt.
              15–21 del GDPR), con una richiesta al titolare come indicato sopra. Puoi anche proporre reclamo al Garante
              per la protezione dei dati personali.
            </p>
          </div>
        </section>

        <section aria-labelledby="mcp">
          <h2 id="mcp" className={sectionTitle}>
            Il server MCP
          </h2>
          <div className={body}>
            <p>
              Il server MCP gira sul tuo computer e non invia niente ad Agentrica: niente telemetria, nessuna
              connessione di rete. Il compito e i file del progetto vanno al fornitore del modello attraverso il tuo
              client, secondo le condizioni di quel fornitore. Gli agenti sono IA: le loro conclusioni sono proposte da
              verificare e non sostituiscono un DPO, un avvocato o un responsabile della sicurezza.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </PageTransition>
  );
}
