const db = require("./db");

// Elenco degli studenti di una classe, per l'insegnante (registro e contatti).
async function studentsCsv(req, res) {
  const cls = await db.one("SELECT id, school_id, teacher_id FROM classes WHERE id = $1", [req.params.id]);
  if (!cls) return res.sendStatus(404);
  if (req.session.user.role === "teacher" && cls.teacher_id !== req.session.user.id) return res.sendStatus(403);
  const rows = await db.many(
    "SELECT s.nome, s.cognome, s.data_nascita, s.telefono, s.livello, s.note_salute FROM students s WHERE s.school_id = $1 ORDER BY s.cognome",
    [cls.school_id],
  );
  await db.query("INSERT INTO audit_log (actor_id, action, target) VALUES ($1, 'students_export', $2)", [req.session.user.id, `class:${cls.id}`]);
  res.type("text/csv").send(rows.map((r) => Object.values(r).join(";")).join("\n"));
}

module.exports = { studentsCsv };
