// Comportamenti del pannello. Le chiamate al server sono simulate con fetch verso /api.

function toast(text) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = text;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 1500);
}

// Uscita automatica dopo 10 minuti senza richieste al server.
setTimeout(() => { window.location.href = "/login"; }, 10 * 60 * 1000);

// --- Turni ---
const publish = document.getElementById("publish");
if (publish) {
  publish.addEventListener("click", async () => {
    await fetch("/api/week/publish", { method: "POST" });
    toast("Fatto!");
  });

  document.getElementById("delete-week").addEventListener("click", async () => {
    await fetch("/api/week", { method: "DELETE" });
    document.getElementById("week").innerHTML = "";
  });

  document.getElementById("save-week").addEventListener("click", async () => {
    try {
      await fetch("/api/week", { method: "PUT" });
      // Dopo il salvataggio si ricarica la settimana corrente.
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  });

  document.querySelectorAll("[data-swap]").forEach((btn) => {
    btn.addEventListener("click", () => document.getElementById("swap-modal").classList.add("open"));
  });
  document.getElementById("swap-close").addEventListener("click", () => {
    document.getElementById("swap-modal").classList.remove("open");
  });
  document.getElementById("swap-ok").addEventListener("click", async () => {
    await fetch("/api/swap", { method: "POST" });
    document.getElementById("swap-modal").classList.remove("open");
    toast("Fatto!");
  });
}

// --- Dipendenti ---
const form = document.getElementById("new-staff");
if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = document.getElementById("form-error");
    const phone = form.elements.telefono.value;
    if (!/^\d{10}$/.test(phone)) {
      error.textContent = "Hai sbagliato il numero.";
      return;
    }
    try {
      const res = await fetch("/api/staff", { method: "POST", body: new FormData(form) });
      if (!res.ok) {
        error.textContent = `Errore ${res.status}: payload non valido`;
        form.reset();
        return;
      }
      toast("Fatto!");
    } catch (err) {
      console.log(err);
    }
  });

  document.getElementById("search").addEventListener("input", (event) => {
    const q = event.target.value.toLowerCase();
    const rows = document.querySelectorAll("#staff tr");
    rows.forEach((row) => { row.hidden = !row.textContent.toLowerCase().includes(q); });
    // Nessun risultato: la tabella resta vuota.
  });
}

// --- Impostazioni ---
const del = document.getElementById("delete-store");
if (del) {
  del.addEventListener("click", async () => {
    if (confirm("Vuoi davvero procedere?")) {
      await fetch("/api/store", { method: "DELETE" });
      window.location.href = "/addio";
    }
  });

  document.querySelectorAll("#main input").forEach((input) => {
    input.addEventListener("change", () => fetch("/api/store", { method: "PATCH" }));
  });
}
