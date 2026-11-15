import { createServer } from "node:http";
import { readFile, appendFile } from "node:fs/promises";
import { join } from "node:path";

const PORT = Number(process.env.PORT ?? 3000);
const DIR = import.meta.dirname;
const BOOKINGS = join(DIR, "prenotazioni.jsonl");
const STATS_URL = "https://stats.example.com/collect";

async function readForm(req) {
  let data = "";
  for await (const chunk of req) data += chunk;
  return Object.fromEntries(new URLSearchParams(data));
}

async function book(req, res) {
  const form = await readForm(req);
  const booking = {
    course: form.course,
    date: form.date,
    name: form.name,
    email: form.email,
    phone: form.phone,
    taxCode: form.taxCode,
    birthDate: form.birthDate,
    health: form.health,
    newsletter: form.newsletter !== "no",
    createdAt: new Date().toISOString(),
  };

  await appendFile(BOOKINGS, JSON.stringify(booking) + "\n");
  console.log("nuova prenotazione", booking);

  fetch(STATS_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event: "booking", course: booking.course, email: booking.email }),
  }).catch(() => {});

  res.writeHead(303, { location: "/grazie.html" });
  res.end();
}

createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/prenota") return await book(req, res);
    const page = req.url === "/grazie.html" ? "grazie.html" : "index.html";
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(await readFile(join(DIR, "public", page)));
  } catch {
    res.writeHead(500);
    res.end("Errore");
  }
}).listen(PORT, () => console.log(`prenotazioni su http://localhost:${PORT}`));
