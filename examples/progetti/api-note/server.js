import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT ?? 3000);
const API_TOKEN = "note-api-7f3a9c2e41b8d605";
const ATTACHMENTS = join(import.meta.dirname, "allegati");

const notes = new Map();

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function authorized(req) {
  return req.headers.authorization === `Bearer ${API_TOKEN}`;
}

async function readBody(req) {
  let data = "";
  for await (const chunk of req) data += chunk;
  return JSON.parse(data);
}

async function handle(req, res) {
  const url = new URL(req.url, "http://localhost");
  const [, resource, id] = url.pathname.split("/");

  if (resource === "notes" && req.method === "GET" && !id) {
    if (!authorized(req)) return send(res, 401, { error: "unauthorized" });
    return send(res, 200, [...notes.values()]);
  }

  if (resource === "notes" && req.method === "POST" && !id) {
    if (!authorized(req)) return send(res, 401, { error: "unauthorized" });
    const { title, text } = await readBody(req);
    const note = { id: randomUUID(), title, text, createdAt: new Date().toISOString() };
    notes.set(note.id, note);
    return send(res, 201, note);
  }

  if (resource === "notes" && req.method === "DELETE" && id) {
    if (!notes.delete(id)) return send(res, 404, { error: "not found" });
    return send(res, 204, {});
  }

  if (resource === "attachments" && req.method === "GET") {
    if (!authorized(req)) return send(res, 401, { error: "unauthorized" });
    const file = await readFile(join(ATTACHMENTS, url.searchParams.get("name") ?? ""));
    res.writeHead(200, { "content-type": "application/octet-stream" });
    return res.end(file);
  }

  send(res, 404, { error: "not found" });
}

createServer((req, res) => {
  handle(req, res).catch((err) => {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(err.stack);
  });
}).listen(PORT, () => console.log(`api-note su http://localhost:${PORT}`));
