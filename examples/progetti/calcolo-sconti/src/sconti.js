const COUPONS = {
  ESTATE: { percent: 15, expires: "2026-09-30" },
  BENVENUTO: { percent: 10, expires: "2027-12-31" },
};

/** Prezzo dopo lo sconto, arrotondato al centesimo. */
export function applyDiscount(price, percent) {
  if (percent < 0) throw new RangeError("percentuale negativa");
  return Math.round(price * (1 - percent / 100) * 100) / 100;
}

/** Totale del carrello: somma di prezzo per quantità. */
export function cartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/** Vero se il coupon esiste e non è scaduto alla data `today` (AAAA-MM-GG), scadenza compresa. */
export function couponValid(code, today) {
  const coupon = COUPONS[code];
  return coupon !== undefined && today <= coupon.expires;
}

/** Percentuale del coupon, 0 se non vale. */
export function couponPercent(code, today) {
  return couponValid(code, today) ? COUPONS[code].percent : 0;
}
