// Controllo della versione nuova (F23): all'avvio una GET ai dist-tag di @agentrica/mcp sul registro npm, senza
// parametri né dati. La risposta è un dato esterno: se ne legge al più MAX_BYTES, si accetta solo una versione semver
// x.y.z e nel testo per il modello entra solo quella. Rete assente o negata, timeout, risposta strana: niente avviso.
// La versione resta fissata: l'avviso dice solo come aggiornare. --no-update-check lo spegne.

export const REGISTRY_URL = "https://registry.npmjs.org/-/package/@agentrica/mcp/dist-tags";
const TIMEOUT_MS = 3_000;
const MAX_BYTES = 4_096;
const SEMVER = /^(\d{1,6})\.(\d{1,6})\.(\d{1,6})$/;

/** Come è installato il server: dalla cartella globale di npm (`install`), dalla cache di npx (`add`, `init`) o da un clone. */
export type InstallKind = "global" | "npx" | "source";

export function installKind(serverPath: string): InstallKind {
  if (/[\\/]_npx[\\/]/.test(serverPath)) return "npx";
  if (/[\\/]node_modules[\\/]@agentrica[\\/]mcp[\\/]/.test(serverPath)) return "global";
  return "source";
}

/** true se `latest` è una versione x.y.z più nuova di `current`. */
export function isNewer(latest: string, current: string): boolean {
  const a = SEMVER.exec(latest);
  const b = SEMVER.exec(current);
  if (!a || !b) return false;
  for (let i = 1; i <= 3; i++) {
    const diff = Number(a[i]) - Number(b[i]);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

/** La versione `latest` del registro, o undefined per qualunque problema. */
export async function fetchLatest(url: string = REGISTRY_URL, doFetch: typeof fetch = fetch): Promise<string | undefined> {
  try {
    const response = await doFetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok || !response.body) return undefined;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return undefined;
      }
      chunks.push(value);
    }
    const data: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const latest = typeof data === "object" && data !== null ? (data as Record<string, unknown>).latest : undefined;
    return typeof latest === "string" && SEMVER.test(latest) ? latest : undefined;
  } catch {
    return undefined;
  }
}

/** L'avviso per l'utente (anche nel banner del pannello), con il comando giusto per come è installato il server. */
export function updateMessage(current: string, latest: string, kind: InstallKind): string {
  const how =
    kind === "global"
      ? `Per aggiornare: npx -y @agentrica/mcp@${latest} install, poi riavvia il client.`
      : kind === "npx"
        ? `Per aggiornare cambia la versione in @agentrica/mcp@${latest} nel comando del server (claude mcp add o .mcp.json), poi riavvia il client.`
        : "Per aggiornare il clone: git pull, poi riavvia il client.";
  return `È uscita la versione ${latest} di Agentrica (in uso la ${current}). ${how}`;
}
