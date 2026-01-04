// Core types and utilities
export * from "./core/types.js";
export * from "./core/store.js";
export * from "./core/ids.js";
export * from "./core/errors.js";

// Platform modules
export { ServiceCatalog } from "./services/ServiceCatalog.js";
export { BookingEngine, type CreateBookingInput } from "./booking/BookingEngine.js";
export { ClientStore } from "./clients/ClientStore.js";
export { ProfessionalStore } from "./professionals/ProfessionalStore.js";
export { PricingEngine, type PricingRule, type PricingCalculation } from "./pricing/PricingEngine.js";
export { PaymentService, type PaymentMethod, type RefundRequest, type Refund } from "./payments/PaymentService.js";

// Intelligence modules
export { EventBus, type EventType, type EventHandler } from "./events/EventBus.js";
export { AnalyticsService, type AnalyticsQuery, type AnalyticsReport } from "./analytics/AnalyticsService.js";
export { NLUService, type NLUTrainingExample, type IntentPattern } from "./nlu/NLUService.js";
export { EnhancedNLUService } from "./nlu/EnhancedNLUService.js";
export { HybridNLUService, type SnipsIntent, type SnipsSlot, type SnipsResult, type TrainingDataset, type HybridNLUCConfig } from "./nlu/HybridNLUService.js";
export { PromptBuilder, type PromptTemplate, type PromptExample } from "./assistant/PromptBuilder.js";
export { DecisionEngine, type DecisionRule, type DecisionContext } from "./decision/DecisionEngine.js";

// Security modules
export { SecurityFirewall, type SecurityRule, type SecurityContext, type SecurityResult, type SecurityAuditLog } from "./security/SecurityFirewall.js";

// Enhanced Assistant modules
export { EnhancedAssistantService, type EnhancedAssistantConfig, type ConversationSession, type AssistantResponse } from "./assistant/EnhancedAssistantService.js";
export { HybridAssistantService, type HybridAssistantConfig, type HybridConversationSession, type HybridAssistantResponse } from "./assistant/HybridAssistantService.js";

// UI Integration modules
export { AdvancedAssistantUI, type AdvancedUIConfig, type ChatMessage, type ConversationState, type UIEvent } from "./ui/AdvancedAssistantUI.js";
export { CopilotKitIntegration, type CopilotKitConfig, type CopilotAction, type CopilotContext, type CopilotMessage } from "./ui/CopilotKitIntegration.js";

// Advanced AI modules (Transformers.js + Unified System)
export { TransformersIntegration, type TransformerModel, type TransformerResult, type TransformerConfig } from "./ai/TransformersIntegration.js";
export { UnifiedAssistantSystem, ComponentFirewall, type AssistantCapability, type UnifiedAssistantConfig, type AssistantResponse } from "./ai/UnifiedAssistantSystem.js";
export { AdvancedIntelligenceEngine, type IntelligenceMetrics, type ConversationContext, type IntelligenceResponse } from "./ai/AdvancedIntelligenceEngine.js";

// Main orchestrator
export { PlatformOrchestrator } from './PlatformOrchestrator.js';
export { DatabasePlatformOrchestrator } from './DatabasePlatformOrchestrator.js';
export { EnhancedPlatformOrchestrator, type EnhancedPlatformConfig, type EnhancedPlatformStats } from './EnhancedPlatformOrchestrator.js';

// Database adapters
export * from './database/index.js';

// Pre-configured vertical configurations
export const DEFAULT_VERTICALS = {
  beauty: {
    vertical: "beauty" as const,
    displayName: "Beauty & Wellness",
    serviceTemplates: [
      {
        name: "Haircut & Style",
        defaultDurationMin: 60,
        defaultPriceCents: 4500,
        locationType: "in_person" as const
      },
      {
        name: "Hair Color",
        defaultDurationMin: 120,
        defaultPriceCents: 8000,
        locationType: "in_person" as const
      },
      {
        name: "Manicure",
        defaultDurationMin: 45,
        defaultPriceCents: 2500,
        locationType: "in_person" as const
      }
    ],
    compliance: {
      requiresVerification: true,
      dataRetentionDays: 365,
      allowedPaymentMethods: ["card", "cash"]
    }
  },
  fitness: {
    vertical: "fitness" as const,
    displayName: "Fitness & Training",
    serviceTemplates: [
      {
        name: "Personal Training Session",
        defaultDurationMin: 60,
        defaultPriceCents: 7500,
        locationType: "in_person" as const
      },
      {
        name: "Virtual Training",
        defaultDurationMin: 45,
        defaultPriceCents: 5000,
        locationType: "virtual" as const
      },
      {
        name: "Group Fitness Class",
        defaultDurationMin: 60,
        defaultPriceCents: 2000,
        locationType: "in_person" as const
      }
    ],
    compliance: {
      requiresVerification: true,
      dataRetentionDays: 730,
      allowedPaymentMethods: ["card", "bank"]
    }
  },
  consulting: {
    vertical: "consulting" as const,
    displayName: "Professional Consulting",
    serviceTemplates: [
      {
        name: "Strategy Session",
        defaultDurationMin: 90,
        defaultPriceCents: 15000,
        locationType: "virtual" as const
      },
      {
        name: "Business Analysis",
        defaultDurationMin: 120,
        defaultPriceCents: 25000,
        locationType: "virtual" as const
      },
      {
        name: "Quick Consultation",
        defaultDurationMin: 30,
        defaultPriceCents: 5000,
        locationType: "virtual" as const
      }
    ],
    compliance: {
      requiresVerification: false,
      dataRetentionDays: 1825,
      allowedPaymentMethods: ["card", "bank", "invoice"]
    }
  }
} as const;
