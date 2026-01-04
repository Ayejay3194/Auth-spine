import type { Money, Quote, Service } from "../core/types.js";
import { id } from "../core/ids.js";

export class PricingEngine {
  quote(service: Service, promoDiscountCents: number = 0): Quote {
    const subtotal = service.price;
    const discounts: Money = { currency: subtotal.currency, amountCents: Math.max(0, promoDiscountCents) };
    const total: Money = { currency: subtotal.currency, amountCents: Math.max(0, subtotal.amountCents - discounts.amountCents) };
    return { id: id("quote"), lines: [{ serviceId: service.id, name: service.name, price: service.price }], subtotal, discounts, total };
  }
}
