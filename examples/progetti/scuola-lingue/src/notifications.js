// Promemoria delle lezioni e messaggi di benvenuto via SMS.
const TEXTBLAST_URL = "https://api.textblast.example/v2/messages";

async function sms(to, text) {
  await fetch(TEXTBLAST_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.TEXTBLAST_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ to, text, sender: "ParlaSubito" }),
  });
}

module.exports = { sms };
