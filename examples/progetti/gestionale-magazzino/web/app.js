const token = sessionStorage.getItem("token");
const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

const cerca = document.getElementById("cerca");
const prodotti = document.getElementById("prodotti");
const caricamento = document.getElementById("caricamento");
const righe = document.getElementById("righe");
const totale = document.getElementById("totale");
const stato = document.getElementById("stato");
const ordine = new Map(); // productId -> { product, quantity }

async function caricaProdotti(q) {
  caricamento.hidden = false;
  const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`, { headers });
  const lista = await res.json();
  caricamento.hidden = true;
  prodotti.innerHTML = lista
    .map((p) => `<li><span>${p.name}</span> · ${euro.format(p.price)} · disponibili ${p.stock} <button type="button" data-id="${p.id}">Aggiungi</button></li>`)
    .join("");
  prodotti.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => aggiungi(lista.find((p) => String(p.id) === b.dataset.id)));
  });
}

cerca.addEventListener("input", () => caricaProdotti(cerca.value));

function aggiungi(product) {
  const riga = ordine.get(product.id) || { product, quantity: 0 };
  riga.quantity += 1;
  ordine.set(product.id, riga);
  disegnaOrdine();
}

function disegnaOrdine() {
  righe.innerHTML = "";
  let somma = 0;
  for (const { product, quantity } of ordine.values()) {
    somma += product.price * quantity;
    const li = document.createElement("li");
    li.textContent = `${product.name} × ${quantity} `;
    const togli = document.createElement("span");
    togli.className = "togli";
    togli.textContent = "✕";
    togli.title = "Togli";
    togli.addEventListener("click", () => {
      ordine.delete(product.id);
      disegnaOrdine();
    });
    li.append(togli);
    righe.append(li);
  }
  totale.value = euro.format(somma);
}

document.getElementById("ordine").addEventListener("submit", async (e) => {
  e.preventDefault();
  const lines = [...ordine.values()].map(({ product, quantity }) => ({ productId: product.id, quantity }));
  stato.textContent = "Invio in corso…";
  const res = await fetch("/api/orders", { method: "POST", headers, body: JSON.stringify({ lines }) });
  const body = await res.json();
  stato.textContent = `Ordine ${body.id} creato: ${euro.format(body.total)}.`;
  ordine.clear();
  disegnaOrdine();
  caricaOrdini();
});

async function caricaOrdini() {
  const res = await fetch("/api/orders", { headers });
  const lista = await res.json();
  document.getElementById("ordini").innerHTML = lista
    .map((o) => `<li>#${o.id} · ${moment(o.created_at).locale("it").format("D MMM, HH:mm")} · ${o.status} · ${euro.format(o.total)}</li>`)
    .join("");
}

caricaProdotti("");
caricaOrdini();
