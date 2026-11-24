const db = require("./db");
const storage = require("./storage");

// Dopo ogni lezione: l'audio va a InsightAI, la trascrizione torna nel database.
async function transcribeRecording(recordingId) {
  const rec = await db.one("SELECT id, storage_key FROM recordings WHERE id = $1", [recordingId]);
  const audio = await storage.get(rec.storage_key);
  const r = await fetch("https://api.insightai.example/v1/transcriptions", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.INSIGHTAI_KEY}`, "content-type": "audio/ogg" },
    body: audio,
  });
  const { text } = await r.json();
  await db.query("UPDATE recordings SET transcript = $1 WHERE id = $2", [text, rec.id]);
}

module.exports = { transcribeRecording };
