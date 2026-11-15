// Dati in memoria: utenti di prova e fatture. In produzione sarebbe un database.
import { createHash, randomUUID } from "node:crypto";

export const hashPassword = (password) => createHash("sha256").update(password).digest("hex");

export const users = [
  { id: "u1", email: "anna@studio.example", passwordHash: hashPassword("prova-anna-2026"), role: "user" },
  { id: "u2", email: "bruno@studio.example", passwordHash: hashPassword("prova-bruno-2026"), role: "user" },
];

export const invoices = new Map();

export function createInvoice(ownerId, { customer, amount, dueDate }) {
  const invoice = { id: randomUUID(), ownerId, customer, amount, dueDate, status: "draft", pdf: null };
  invoices.set(invoice.id, invoice);
  return invoice;
}

createInvoice("u1", { customer: "Rossi Srl", amount: 1200, dueDate: "2026-12-31" }).pdf = "esempio.pdf";
createInvoice("u2", { customer: "Bianchi Spa", amount: 830, dueDate: "2027-01-15" });
