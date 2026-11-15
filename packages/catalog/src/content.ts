// Contenuto ammesso nei file di agents/: diventano istruzioni per il modello di chi usa il server MCP, quindi un testo
// alterato non deve poter portare link, comandi o testo nascosto (revisione di sicurezza di F5, SEC-ARCH-01).
// Lo applica content.test.ts a ogni file, in npm test e quindi in CI.

/** Dimensione massima di un file di agents/, in byte. Oggi il più grande è sotto i 4 KB. */
export const MAX_FILE_BYTES = 8_000;

const RULES: [RegExp, string][] = [
  [/\b[a-z][a-z0-9+.-]*:\/\/|\bwww\.|\]\(/i, "URL o link"],
  [/<[a-z/!?]/i, "HTML o commento HTML"],
  // Formato (zero-width, bidi, soft hyphen, tag), uso privato, surrogati, controlli e selettori di variante.
  [/[\p{Cf}\p{Co}\p{Cs}\u0000-\u0008\u000B-\u001F\u007F︀-️\u{E0100}-\u{E01EF}]/u, "carattere invisibile o di controllo"],
];

/** I problemi di un file di agents/; vuoto se il contenuto è ammesso. */
export function contentProblems(text: string): string[] {
  const problems: string[] = [];
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > MAX_FILE_BYTES) problems.push(`file di ${bytes} byte, oltre ${MAX_FILE_BYTES}`);
  text.split("\n").forEach((line, index) => {
    for (const [pattern, label] of RULES) if (pattern.test(line)) problems.push(`riga ${index + 1}: ${label}`);
  });
  // Blocchi di codice: solo dati JSON (lo schema dei rilievi), niente comandi.
  let open = false;
  text.split("\n").forEach((line, index) => {
    const fence = /^\s*(```|~~~)\s*(\S*)/.exec(line);
    if (!fence) return;
    if (!open && fence[2] !== "json") problems.push(`riga ${index + 1}: blocco di codice non json`);
    open = !open;
  });
  return problems;
}
