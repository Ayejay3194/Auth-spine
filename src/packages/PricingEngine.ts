import type { Money, Service, ID, Vertical } from "../core/types.js";
import { AppError } from "../core/errors.js";

export interface PricingRule {
  id: string;
  vertical?: Vertical;
  professionalId?: ID;
  serviceId?: ID;
  type: "percentage" | "fixed" | "tiered";
  value: number;
  conditions?: {
    minDuration?: number;
    maxDuration?: number;
    dayOfWeek?: number[];
    timeRange?: { start: string; end: string };
  };
}

export interface PricingCalculation {
  basePrice: Money;
  adjustments: Array<{
    type: string;
    amount: Money;
    description: string;
  }>;
  finalPrice: Money;
}

export class PricingEngine {
  private rules: PricingRule[] = [];

  addRule(rule: PricingRule): void {
    this.rules.push(rule);
  }

  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index > -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  calculate(
    service: Service,
    professionalId: ID,
    vertical: Vertical,
    durationMin: number,
    bookingDate: Date = new Date()
  ): PricingCalculation {
    let currentPrice = { ...service.price };
    const adjustments: PricingCalculation["adjustments"] = [];

    // Apply applicable rules
    const applicableRules = this.getApplicableRules(
      service.id,
      professionalId,
      vertical,
      durationMin,
      bookingDate
    );

    for (const rule of applicableRules) {
      let adjustment: Money;

      switch (rule.type) {
        case "percentage":
          adjustment = {
            currency: currentPrice.currency,
            amountCents: Math.round(currentPrice.amountCents * (rule.value / 100))
          };
          break;
        case "fixed":
          adjustment = {
            currency: currentPrice.currency,
            amountCents: rule.value
          };
          break;
        case "tiered":
          adjustment = this.calculateTieredAdjustment(currentPrice, rule, durationMin);
          break;
        default:
          continue;
      }

      currentPrice = {
        currency: currentPrice.currency,
        amountCents: currentPrice.amountCents + adjustment.amountCents
      };

      adjustments.push({
        type: rule.type,
        amount: adjustment,
        description: this.getRuleDescription(rule)
      });
    }

    // Ensure price doesn't go negative
    currentPrice.amountCents = Math.max(0, currentPrice.amountCents);

    return {
      basePrice: service.price,
      adjustments,
      finalPrice: currentPrice
    };
  }

  private getApplicableRules(
    serviceId: ID,
    professionalId: ID,
    vertical: Vertical,
    durationMin: number,
    bookingDate: Date
  ): PricingRule[] {
    return this.rules.filter(rule => {
      // Check vertical filter
      if (rule.vertical && rule.vertical !== vertical) return false;
      
      // Check professional filter
      if (rule.professionalId && rule.professionalId !== professionalId) return false;
      
      // Check service filter
      if (rule.serviceId && rule.serviceId !== serviceId) return false;
      
      // Check conditions
      if (rule.conditions) {
        if (rule.conditions.minDuration && durationMin < rule.conditions.minDuration) return false;
        if (rule.conditions.maxDuration && durationMin > rule.conditions.maxDuration) return false;
        if (rule.conditions.dayOfWeek && !rule.conditions.dayOfWeek.includes(bookingDate.getDay())) return false;
        if (rule.conditions.timeRange) {
          const bookingTime = bookingDate.toTimeString().slice(0, 5);
          if (bookingTime < rule.conditions.timeRange.start || bookingTime > rule.conditions.timeRange.end) {
            return false;
          }
        }
      }
      
      return true;
    });
  }

  private calculateTieredAdjustment(basePrice: Money, rule: PricingRule, durationMin: number): Money {
    // Simple tiered pricing - can be extended for complex tier logic
    const tiers = rule.value; // Assuming value represents tier configuration
    if (durationMin > 60) {
      return {
        currency: basePrice.currency,
        amountCents: Math.round(basePrice.amountCents * 0.1) // 10% surcharge for >60min
      };
    }
    return {
      currency: basePrice.currency,
      amountCents: 0
    };
  }

  private getRuleDescription(rule: PricingRule): string {
    switch (rule.type) {
      case "percentage":
        return `${rule.value > 0 ? '+' : ''}${rule.value}% pricing adjustment`;
      case "fixed":
        return `$${(rule.value / 100).toFixed(2)} ${rule.value > 0 ? 'surcharge' : 'discount'}`;
      case "tiered":
        return "Tiered pricing adjustment";
      default:
        return "Pricing adjustment";
    }
  }

  getRules(): PricingRule[] {
    return [...this.rules];
  }

  clearRules(): void {
    this.rules = [];
  }
}
