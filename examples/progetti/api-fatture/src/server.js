import { createServer } from "node:http";
import { currentUser, isAdmin, login, logout } from "./auth.js";
import * as invoices from "./invoices.js";

const PORT = Number(process.env.PORT ?? 3000);
const MAX_BODY = 64 * 1024;

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error("too large"), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function cors(req, res) {
  if (req.headers.origin) {
    res.setHeader("access-control-allow-origin", req.headers.origin);
    res.setHeader("access-control-allow-credentials", "true");
    res.setHeader("access-control-allow-methods", "GET, POST, PATCH");
    res.setHeader("access-control-allow-headers", "content-type");
  }
}

async function route(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.writeHead(204).end();
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;

  if (req.method === "POST" && path === "/login") {
    const body = await readJson(req);
    console.log("login", JSON.stringify(body));
    const result = login(String(body.email ?? ""), String(body.password ?? ""));
    if (result.error) return send(res, 401, { error: result.error });
    return send(res, 200, { ok: true }, { "set-cookie": result.cookie });
  }

  if (req.method === "GET" && path === "/admin/export") {
    if (!isAdmin(req)) return send(res, 403, { error: "Vietato" });
    res.writeHead(200, { "content-type": "text/csv; charset=utf-8" });
    return res.end(invoices.exportCsv());
  }

  const session = currentUser(req);
  if (!session) return send(res, 401, { error: "Accesso richiesto" });
  const { user } = session;

  if (req.method === "POST" && path === "/logout") {
    logout(session.token);
    return send(res, 200, { ok: true }, { "set-cookie": "sid=; Path=/; Max-Age=0" });
  }
  if (req.method === "GET" && path === "/invoices") return send(res, 200, invoices.list(user));
  if (req.method === "POST" && path === "/invoices") {
    const result = invoices.create(user, await readJson(req));
    return result.error ? send(res, 400, { error: result.error }) : send(res, 201, result.invoice);
  }

  const match = /^\/invoices\/([\w-]+)(\/pdf)?$/.exec(path);
  const invoice = match && invoices.get(match[1]);
  if (!invoice) return send(res, 404, { error: "Fattura non trovata" });

  if (req.method === "GET" && !match[2]) return send(res, 200, invoice);
  if (req.method === "PATCH" && !match[2]) {
    const result = invoices.update(user, invoice, await readJson(req));
    return result.error ? send(res, result.status, { error: result.error }) : send(res, 200, result.invoice);
  }
  if (req.method === "GET" && match[2]) {
    if (invoice.ownerId !== user.id) return send(res, 404, { error: "Fattura non trovata" });
    const file = await invoices.pdf(invoice);
    if (!file) return send(res, 404, { error: "PDF non disponibile" });
    res.writeHead(200, { "content-type": "application/pdf" });
    return res.end(file);
  }
  return send(res, 405, { error: "Metodo non ammesso" });
}

createServer((req, res) => {
  route(req, res).catch((error) => {
    console.error(error);
    send(res, error.status ?? 400, { error: error.status === 413 ? "Richiesta troppo grande" : "Richiesta non valida" });
  });
}).listen(PORT, () => console.log(`api-fatture su http://localhost:${PORT}`));
