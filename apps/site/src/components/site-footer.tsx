export function SiteFooter() {
  return (
    <footer className="mt-8 border-t py-12">
      <div className="wrap grid gap-3">
        <p className="font-extrabold tracking-tight">Agentrica</p>
        <p className="max-w-3xl text-[0.9375rem] text-muted-foreground">
          Agentrica è una società fittizia: i suoi agenti sono modelli di IA guidati da file di ruolo. Nessuna
          persona, cliente o risultato è reale.
        </p>
        <p className="max-w-3xl text-[0.9375rem] text-muted-foreground">
          Il metodo con cui lavora è aperto:{" "}
          <a href="https://github.com/flgisimone/agentic-starter" className="underline">
            agentic-starter su GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
