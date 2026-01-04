import type { DecisionResponse, PromptContext, NLUIntent } from "../core/types.js";

export interface DecisionRule {
  id: string;
  name: string;
  condition: (context: PromptContext) => boolean;
  action: (context: PromptContext) => DecisionResponse;
  priority: number;
  enabled: boolean;
}

export interface DecisionContext extends PromptContext {
  confidence?: number;
  risk?: "low" | "medium" | "high";
  urgency?: "low" | "medium" | "high";
}

export class DecisionEngine {
  private rules: DecisionRule[] = [];
  private fallbackResponse: DecisionResponse = {
    action: "escalate_to_human",
    confidence: 0.1,
    reasoning: "No applicable decision rule found",
    nextSteps: ["Connect with human representative"]
  };

  addRule(rule: DecisionRule): void {
    this.rules.push(rule);
    // Sort by priority (higher priority first)
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index > -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  makeDecision(context: DecisionContext): DecisionResponse {
    const enabledRules = this.rules.filter(rule => rule.enabled);
    
    for (const rule of enabledRules) {
      try {
        if (rule.condition(context)) {
          return rule.action(context);
        }
      } catch (error) {
        console.error(`Error in decision rule ${rule.id}:`, error);
        continue;
      }
    }

    return this.fallbackResponse;
  }

  evaluateRisk(context: PromptContext): "low" | "medium" | "high" {
    // Simple risk assessment based on intent and entities
    const highRiskIntents = ["complaint", "legal_issue", "emergency", "cancel_immediately"];
    const mediumRiskIntents = ["refund_request", "reschedule_urgent", "complex_booking"];
    
    if (context.intent && highRiskIntents.includes(context.intent.intent)) {
      return "high";
    }
    
    if (context.intent && mediumRiskIntents.includes(context.intent.intent)) {
      return "medium";
    }
    
    // Check conversation sentiment (simplified)
    const recentMessages = context.conversationHistory.slice(-3);
    const hasNegativeKeywords = recentMessages.some(msg => 
      msg.content.toLowerCase().match(/\b(angry|frustrated|terrible|awful|refund|complain)\b/)
    );
    
    if (hasNegativeKeywords) {
      return "medium";
    }
    
    return "low";
  }

  evaluateUrgency(context: PromptContext): "low" | "medium" | "high" {
    const urgentIntents = ["emergency", "urgent_booking", "immediate_help"];
    const urgentKeywords = ["asap", "urgent", "emergency", "immediately", "right away"];
    
    if (context.intent && urgentIntents.includes(context.intent.intent)) {
      return "high";
    }
    
    const recentMessages = context.conversationHistory.slice(-2);
    const hasUrgentKeywords = recentMessages.some(msg => 
      msg.content.toLowerCase().match(new RegExp(`\\b(${urgentKeywords.join("|")})\\b`))
    );
    
    if (hasUrgentKeywords) {
      return "medium";
    }
    
    return "low";
  }

  // Initialize default decision rules
  initializeDefaultRules(): void {
    // High-priority: Emergency handling
    this.addRule({
      id: "emergency_handler",
      name: "Handle Emergency Requests",
      priority: 100,
      enabled: true,
      condition: (context) => {
        return context.intent?.intent === "emergency" || 
               context.conversationHistory.some(msg => 
                 msg.content.toLowerCase().includes("emergency")
               );
      },
      action: (context) => ({
        action: "escalate_immediately",
        confidence: 1.0,
        reasoning: "Emergency detected - immediate escalation required",
        nextSteps: ["Connect to emergency line", "Notify on-call staff", "Document incident"]
      })
    });

    // Booking requests
    this.addRule({
      id: "booking_handler",
      name: "Handle Booking Requests",
      priority: 80,
      enabled: true,
      condition: (context) => {
        return context.intent?.intent === "book_appointment" && 
               context.intent.confidence > 0.7;
      },
      action: (context) => ({
        action: "process_booking",
        confidence: context.intent?.confidence || 0.5,
        reasoning: "Clear booking intent detected",
        nextSteps: ["Check availability", "Present time slots", "Confirm booking details"]
      })
    });

    // Pricing inquiries
    this.addRule({
      id: "pricing_handler",
      name: "Handle Pricing Inquiries",
      priority: 70,
      enabled: true,
      condition: (context) => {
        return context.intent?.intent === "pricing_inquiry";
      },
      action: (context) => ({
        action: "provide_pricing",
        confidence: context.intent?.confidence || 0.5,
        reasoning: "Pricing information requested",
        nextSteps: ["Show pricing options", "Explain value proposition", "Offer consultation"]
      })
    });

    // Service inquiries
    this.addRule({
      id: "service_handler",
      name: "Handle Service Inquiries",
      priority: 70,
      enabled: true,
      condition: (context) => {
        return context.intent?.intent === "service_inquiry";
      },
      action: (context) => ({
        action: "describe_services",
        confidence: context.intent?.confidence || 0.5,
        reasoning: "Service information requested",
        nextSteps: ["List relevant services", "Explain benefits", "Recommend based on needs"]
      })
    });

    // Cancellation requests
    this.addRule({
      id: "cancellation_handler",
      name: "Handle Cancellation Requests",
      priority: 90,
      enabled: true,
      condition: (context) => {
        return context.intent?.intent === "cancel_appointment";
      },
      action: (context) => ({
        action: "process_cancellation",
        confidence: context.intent?.confidence || 0.5,
        reasoning: "Cancellation requested",
        nextSteps: ["Verify booking", "Check cancellation policy", "Process refund if applicable"]
      })
    });

    // Low confidence intents
    this.addRule({
      id: "clarification_handler",
      name: "Request Clarification",
      priority: 60,
      enabled: true,
      condition: (context) => {
        return !context.intent || context.intent.confidence < 0.5;
      },
      action: (context) => ({
        action: "request_clarification",
        confidence: 0.3,
        reasoning: "Low confidence intent detected - need clarification",
        nextSteps: ["Ask specific questions", "Provide options", "Offer human assistance"]
      })
    });

    // Risk-based escalation
    this.addRule({
      id: "risk_escalation",
      name: "Escalate High Risk",
      priority: 95,
      enabled: true,
      condition: (context) => {
        const risk = this.evaluateRisk(context);
        return risk === "high";
      },
      action: (context) => ({
        action: "escalate_to_human",
        confidence: 0.9,
        reasoning: "High risk detected - human intervention required",
        nextSteps: ["Notify supervisor", "Document concern", "Provide immediate support options"]
      })
    });
  }

  getRules(): DecisionRule[] {
    return [...this.rules];
  }

  enableRule(ruleId: string): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = true;
      return true;
    }
    return false;
  }

  disableRule(ruleId: string): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = false;
      return true;
    }
    return false;
  }

  setFallbackResponse(response: DecisionResponse): void {
    this.fallbackResponse = response;
  }

  // Decision analytics
  getDecisionStats(): {
    totalRules: number;
    enabledRules: number;
    rulesByPriority: Record<string, number>;
  } {
    const rulesByPriority: Record<string, number> = {};
    
    this.rules.forEach(rule => {
      const priority = rule.priority.toString();
      rulesByPriority[priority] = (rulesByPriority[priority] || 0) + 1;
    });

    return {
      totalRules: this.rules.length,
      enabledRules: this.rules.filter(r => r.enabled).length,
      rulesByPriority
    };
  }
}
