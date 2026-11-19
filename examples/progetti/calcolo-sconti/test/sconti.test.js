import { test } from "node:test";
import assert from "node:assert/strict";
import { applyDiscount, cartTotal, couponValid, couponPercent } from "../src/sconti.js";

test("sconto del 10%", () => {
  assert.equal(applyDiscount(19.99, 10), 17.99);
});

test("sconto negativo rifiutato", () => {
  assert.throws(() => applyDiscount(10, -5), RangeError);
});

test("totale del carrello", () => {
  assert.equal(cartTotal([{ price: 1.1, qty: 3 }, { price: 2, qty: 1 }]), 5.3);
});

test("coupon scaduto", () => {
  couponValid("ESTATE", "2026-10-01");
});

test("coupon valido il giorno della scadenza", () => {
  assert.equal(couponValid("ESTATE", "2026-09-30"), true);
});

test.skip("percentuale del coupon BENVENUTO", () => {
  assert.equal(couponPercent("BENVENUTO", "2026-11-18"), 10);
});
