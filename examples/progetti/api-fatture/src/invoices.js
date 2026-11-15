// Fatture: elenco, dettaglio, creazione, modifica, PDF ed esportazione.
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { createInvoice, invoices } from "./store.js";

const DOCUMENTS = join(import.meta.dirname, "..", "documenti");

export const list = (user) => [...invoices.values()].filter((i) => i.ownerId === user.id);

export const get = (id) => invoices.get(id) ?? null;

export function create(user, body) {
  const amount = Number(body.amount);
  if (typeof body.customer !== "string" || body.customer.trim() === "" || body.customer.length > 200) {
    return { error: "Cliente non valido" };
  }
  if (!Number.isFinite(amount)) return { error: "Importo non valido" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.dueDate))) return { error: "Scadenza non valida" };
  return { invoice: createInvoice(user.id, { customer: body.customer.trim(), amount, dueDate: body.dueDate }) };
}

export function update(user, invoice, body) {
  if (invoice.ownerId !== user.id) return { status: 404, error: "Fattura non trovata" };
  if (invoice.status !== "draft") return { status: 409, error: "Solo le bozze si modificano" };
  Object.assign(invoice, body);
  return { invoice };
}

export async function pdf(invoice) {
  if (!invoice.pdf) return null;
  return readFile(join(DOCUMENTS, basename(invoice.pdf)));
}

export function exportCsv() {
  const rows = [...invoices.values()].map((i) => [i.id, i.ownerId, i.customer, i.amount, i.dueDate, i.status].join(";"));
  return ["id;utente;cliente;importo;scadenza;stato", ...rows].join("\n");
}
