import { existsSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "volti");

/** Indirizzo del ritratto di un agente (`public/volti/<id>.webp`), se il file c'è. Si decide al build: solo lato server. */
export function portraitSrc(id: string): string | undefined {
  const file = `${id.toLowerCase()}.webp`;
  return existsSync(path.join(DIR, file)) ? `/volti/${file}` : undefined;
}
