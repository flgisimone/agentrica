// Export pubblico «@aigentrica/mcp/catalog»: il catalogo letto dagli agents/ di questo pacchetto. Lo usa il sito, che vive
// in un repository privato (F17) e installa il pacchetto a versione esatta. Non importa l'SDK né zod.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadCatalog as loadFrom, type Department, type Lang } from "../../catalog/src/index.ts";

export { DEPARTMENTS, LANGS, type Lang, type Agent, type Department, type DepartmentCode, type DepartmentInfo, type Section } from "../../catalog/src/index.ts";

// agents/ è in un punto fisso rispetto a questo file, senza risalire le cartelle: la cartella corrente è il progetto
// dell'utente e non deve poter fornire un'altra agents/. Tre livelli sopra c'è agents/ sia da un clone
// (packages/mcp/src → la root del repository) sia nel pacchetto (dist/mcp/src → la root del pacchetto, dove prepack
// copia agents/). Il catalogo è importato per percorso relativo, così tsc lo compila dentro dist e il pacchetto non
// dipende da @aigentrica/catalog.
export const AGENTS_DIR = join(import.meta.dirname, "..", "..", "..", "agents");

/** Reparti e agenti dagli agents/ del pacchetto, nella lingua `lang` (F32: l'inglese è in agents/<agenzia>/en/). */
export function loadCatalog(lang: Lang = "it"): Department[] {
  return loadFrom(AGENTS_DIR, lang);
}

/** I subagent di .claude/agents/, nella root del repository e, copiati da prepack, in quella del pacchetto. */
export const SUBAGENTS_DIR = join(dirname(AGENTS_DIR), ".claude", "agents");

/** Nome di ogni subagent di AIgentrica → id del suo agente, dal file di ruolo che il subagent nomina (F27). */
export function subagentIds(departments: readonly Department[], dir = SUBAGENTS_DIR): Map<string, string> {
  // Il percorso senza «/en/» (F32): i subagent italiani nominano il file italiano, il catalogo può essere in inglese.
  const plain = (path: string) => path.replace("/en/", "/");
  const bySource = new Map(departments.flatMap((d) => d.agents.map((a) => [plain(a.source), a.id] as const)));
  const ids = new Map<string, string>();
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const text = readFileSync(join(entry.parentPath, entry.name), "utf8");
    const name = /^name: ([\w-]+)$/m.exec(text)?.[1];
    const id = bySource.get(plain(/`(agents\/[^`]+\.md)`/.exec(text)?.[1] ?? ""));
    if (name && id) ids.set(name, id);
  }
  return ids;
}
