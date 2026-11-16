// Export pubblico «@agentrica/mcp/catalog»: il catalogo letto dagli agents/ di questo pacchetto. Lo usa il sito, che vive
// in un repository privato (F17) e installa il pacchetto a versione esatta. Non importa l'SDK né zod.
import { join } from "node:path";
import { loadCatalog as loadFrom, type Department } from "../../catalog/src/index.ts";

export { DEPARTMENTS, type Agent, type Department, type DepartmentCode, type DepartmentInfo, type Section } from "../../catalog/src/index.ts";

// agents/ è in un punto fisso rispetto a questo file, senza risalire le cartelle: la cartella corrente è il progetto
// dell'utente e non deve poter fornire un'altra agents/. Tre livelli sopra c'è agents/ sia da un clone
// (packages/mcp/src → la root del repository) sia nel pacchetto (dist/mcp/src → la root del pacchetto, dove prepack
// copia agents/). Il catalogo è importato per percorso relativo, così tsc lo compila dentro dist e il pacchetto non
// dipende da @agentrica/catalog.
export const AGENTS_DIR = join(import.meta.dirname, "..", "..", "..", "agents");

/** Reparti e agenti dagli agents/ del pacchetto. */
export function loadCatalog(): Department[] {
  return loadFrom(AGENTS_DIR);
}
