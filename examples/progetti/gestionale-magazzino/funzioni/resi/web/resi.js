const token = sessionStorage.getItem("token");
const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
const form = document.getElementById("return-form");
const message = document.getElementById("message");
const list = document.getElementById("returns");

async function loadReturns() {
  const res = await fetch("/api/returns", { headers });
  const rows = await res.json();
  list.innerHTML = rows
    .map((r) => `<li>Ordine ${r.order_id} · ${r.quantity} pezzi · ${r.amount} € · ${r.status} · ${r.note || ""}</li>`)
    .join("");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(form));
  const res = await fetch("/api/returns", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (res.ok) {
    message.textContent = "Reso aperto.";
    form.reset();
    loadReturns();
  } else {
    const { error } = await res.json();
    message.textContent = `Reso non aperto: ${error}.`;
  }
});

loadReturns();
