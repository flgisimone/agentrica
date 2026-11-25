// Invio delle email transazionali (reimpostazione della password) tramite l'API HTTPS del fornitore di posta.
const MAIL_API_URL = process.env.MAIL_API_URL;
const MAIL_API_KEY = process.env.MAIL_API_KEY;
const FROM = "Ferramenta Nord <ordini@ferramentanord.example>";

async function send(to, subject, text) {
  const response = await fetch(MAIL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${MAIL_API_KEY}` },
    body: JSON.stringify({ from: FROM, to, subject, text }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`invio non riuscito: ${response.status}`);
}

module.exports = { send };
