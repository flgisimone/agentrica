// Statistiche d'uso: eventi verso il nostro Plausible-like interno su Nimbus.
const ENDPOINT = "https://stats.parlasubito.example/api/event";

function track({ userId, event, props = {} }) {
  fetch(ENDPOINT, { method: "POST", body: JSON.stringify({ userId, event, props, ts: Date.now() }) }).catch(() => {});
}

module.exports = { track };
