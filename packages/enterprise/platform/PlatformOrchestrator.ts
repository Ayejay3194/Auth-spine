import { ServiceCatalog } from "./services/ServiceCatalog.js";
import { BookingEngine } from "./booking/BookingEngine.js";
import { ClientStore } from "./clients/ClientStore.js";
import { ProfessionalStore } from "./professionals/ProfessionalStore.js";
import { PricingEngine } from "./pricing/PricingEngine.js";
import { PaymentService } from "./payments/PaymentService.js";
import { EventBus } from "./events/EventBus.js";
import { AnalyticsService } from "./analytics/AnalyticsService.js";
import { NLUService } from "./nlu/NLUService.js";
import { PromptBuilder } from "./assistant/PromptBuilder.js";
import { DecisionEngine } from "./decision/DecisionEngine.js";

import type { 
  ID, 
  Vertical, 
  VerticalConfig, 
  Service, 
  Booking, 
  ClientProfile, 
  Professional, 
  Message,
  PromptContext,
  NLUIntent,
  DecisionResponse
} from "./core/types.js";

export class PlatformOrchestrator {
  // Core modules
  public readonly services = new ServiceCatalog();
  public readonly booking = new BookingEngine();
  public readonly clients = new ClientStore();
  public readonly professionals = new ProfessionalStore();
  public readonly pricing = new PricingEngine();
  public readonly payments = new PaymentService();
  
  // Intelligence modules
  public readonly eventBus = new EventBus();
  public readonly analytics = new AnalyticsService();
  public readonly nlu = new NLUService();
  public readonly promptBuilder = new PromptBuilder();
  public readonly decisionEngine = new DecisionEngine();

  private verticalConfigs: Map<Vertical, VerticalConfig> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize default patterns and templates
    this.nlu.initializeDefaultPatterns();
    this.promptBuilder.initializeDefaultTemplates();
    this.promptBuilder.initializeDefaultExamples();
    this.decisionEngine.initializeDefaultRules();

    // Setup event handlers
    this.setupEventHandlers();

    this.isInitialized = true;
    
    // Track initialization event
    await this.eventBus.emit({
      type: "platform.initialized",
      timestamp: new Date().toISOString(),
      data: { modules: this.getModuleNames() }
    });
  }

  private setupEventHandlers(): void {
    // Track all events in analytics
    this.eventBus.addMiddleware(async (event) => {
      this.analytics.track(event);
    });

    // Handle booking events
    this.eventBus.on("booking.created", async (event) => {
      console.log(`Booking created: ${event.data.bookingId}`);
      // Could trigger notifications, calendar updates, etc.
    });

    this.eventBus.on("booking.confirmed", async (event) => {
      console.log(`Booking confirmed: ${event.data.bookingId}`);
      // Could trigger payment processing, reminders, etc.
    });

    this.eventBus.on("payment.completed", async (event) => {
      console.log(`Payment completed: ${event.data.paymentIntentId}`);
      // Could trigger receipt generation, fulfillment, etc.
    });
  }

  // Vertical configuration management
  loadVerticalConfig(config: VerticalConfig): void {
    this.verticalConfigs.set(config.vertical, config);
    
    // Setup pricing rules for vertical
    config.serviceTemplates.forEach(template => {
      this.pricing.addRule({
        id: `${config.vertical}_base_pricing`,
        vertical: config.vertical,
        type: "percentage",
        value: 0, // Base pricing - no adjustment
        conditions: {
          minDuration: template.defaultDurationMin,
          maxDuration: template.defaultDurationMin
        }
      });
    });

    this.eventBus.emit({
      type: "vertical.config_loaded",
      timestamp: new Date().toISOString(),
      data: { vertical: config.vertical }
    });
  }

  getVerticalConfig(vertical: Vertical): VerticalConfig | undefined {
    return this.verticalConfigs.get(vertical);
  }

  getVerticals(): Vertical[] {
    return Array.from(this.verticalConfigs.keys());
  }

  // Client management
  createClient(input: Omit<ClientProfile, "id">): ClientProfile {
    const client = this.clients.create(input);
    
    this.eventBus.emit({
      type: "client.created",
      timestamp: new Date().toISOString(),
      userId: client.id,
      data: { clientId: client.id }
    });

    return client;
  }

  // Professional management
  createProfessional(input: Omit<Professional, "id">): Professional {
    const professional = this.professionals.create(input);
    
    this.eventBus.emit({
      type: "professional.created",
      timestamp: new Date().toISOString(),
      userId: professional.id,
      data: { professionalId: professional.id, vertical: input.vertical }
    });

    return professional;
  }

  // Service management
  createService(input: Omit<Service, "id">): Service {
    const service = this.services.create(input);
    
    this.eventBus.emit({
      type: "service.created",
      timestamp: new Date().toISOString(),
      data: { serviceId: service.id, professionalId: input.professionalId }
    });

    return service;
  }

  // Booking workflow
  async createBooking(input: {
    clientId: ID;
    professionalId: ID;
    serviceId: ID;
    startAtUtc: string;
    endAtUtc: string;
  }): Promise<Booking> {
    const client = this.clients.get(input.clientId);
    const professional = this.professionals.get(input.professionalId);
    const service = this.services.get(input.serviceId);

    if (!client || !professional || !service) {
      throw new Error("Invalid booking parameters");
    }

    // Check availability
    if (!this.booking.isSlotAvailable(input.professionalId, input.startAtUtc, input.endAtUtc)) {
      throw new Error("Time slot not available");
    }

    // Calculate pricing
    const pricing = this.pricing.calculate(
      service,
      input.professionalId,
      professional.vertical,
      service.durationMin
    );

    // Create booking
    const booking = this.booking.hold({
      clientId: input.clientId,
      professionalId: input.professionalId,
      service,
      vertical: professional.vertical,
      startAtUtc: input.startAtUtc,
      endAtUtc: input.endAtUtc,
      total: pricing.finalPrice
    }, new Date().toISOString());

    this.eventBus.emit({
      type: "booking.created",
      timestamp: new Date().toISOString(),
      userId: input.clientId,
      data: { bookingId: booking.id }
    });

    return booking;
  }

  async confirmBooking(bookingId: ID): Promise<Booking> {
    const booking = this.booking.confirm(bookingId);
    
    this.eventBus.emit({
      type: "booking.confirmed",
      timestamp: new Date().toISOString(),
      userId: booking.clientId,
      data: { bookingId: booking.id }
    });

    return booking;
  }

  // AI Assistant workflow
  async processMessage(message: string, context: {
    clientId: ID;
    professionalId?: ID;
    conversationHistory: Message[];
  }): Promise<{
    response: string;
    intent: NLUIntent;
    decision: DecisionResponse;
  }> {
    // Parse intent
    const intent = this.nlu.parse(message);
    
    // Build prompt context
    const promptContext: PromptContext = {
      clientId: context.clientId,
      professionalId: context.professionalId,
      conversationHistory: context.conversationHistory,
      intent,
      metadata: {}
    };

    // Make decision
    const decision = this.decisionEngine.makeDecision(promptContext);

    // Generate response prompt
    const prompt = this.promptBuilder.buildPrompt(promptContext);

    // Track the interaction
    this.eventBus.emit({
      type: "message.processed",
      timestamp: new Date().toISOString(),
      userId: context.clientId,
      data: {
        intent: intent.intent,
        confidence: intent.confidence,
        decision: decision.action
      }
    });

    return {
      response: prompt, // In real implementation, this would be sent to LLM
      intent,
      decision
    };
  }

  // Analytics and reporting
  getAnalytics(timeRange?: { startDate: string; endDate: string }) {
    return this.analytics.generateReport({
      startDate: timeRange?.startDate,
      endDate: timeRange?.endDate
    });
  }

  // System health and status
  getSystemStatus(): {
    initialized: boolean;
    modules: string[];
    verticals: Vertical[];
    stats: {
      clients: number;
      professionals: number;
      services: number;
      bookings: number;
      events: number;
    };
  } {
    return {
      initialized: this.isInitialized,
      modules: this.getModuleNames(),
      verticals: this.getVerticals(),
      stats: {
        clients: this.clients.all().length,
        professionals: this.professionals.all().length,
        services: this.services.all().length,
        bookings: this.booking.all().length,
        events: this.analytics.query({}).length
      }
    };
  }

  private getModuleNames(): string[] {
    return [
      "services", "booking", "clients", "professionals", 
      "pricing", "payments", "eventBus", "analytics", 
      "nlu", "promptBuilder", "decisionEngine"
    ];
  }

  // Export/import for backup and migration
  exportData(): {
    clients: ClientProfile[];
    professionals: Professional[];
    services: Service[];
    bookings: Booking[];
    verticalConfigs: VerticalConfig[];
  } {
    return {
      clients: this.clients.all(),
      professionals: this.professionals.all(),
      services: this.services.all(),
      bookings: this.booking.all(),
      verticalConfigs: Array.from(this.verticalConfigs.values())
    };
  }

  async importData(data: {
    clients?: ClientProfile[];
    professionals?: Professional[];
    services?: Service[];
    bookings?: Booking[];
    verticalConfigs?: VerticalConfig[];
  }): Promise<void> {
    if (data.verticalConfigs) {
      data.verticalConfigs.forEach(config => this.loadVerticalConfig(config));
    }

    if (data.clients) {
      // Note: This would need to handle ID conflicts in a real implementation
      data.clients.forEach(client => {
        try {
          this.clients.create(client);
        } catch (error) {
          console.warn(`Failed to import client ${client.id}:`, error);
        }
      });
    }

    if (data.professionals) {
      data.professionals.forEach(professional => {
        try {
          this.professionals.create(professional);
        } catch (error) {
          console.warn(`Failed to import professional ${professional.id}:`, error);
        }
      });
    }

    if (data.services) {
      data.services.forEach(service => {
        try {
          this.services.create(service);
        } catch (error) {
          console.warn(`Failed to import service ${service.id}:`, error);
        }
      });
    }

    this.eventBus.emit({
      type: "platform.data_imported",
      timestamp: new Date().toISOString(),
      data: { 
        clients: data.clients?.length || 0,
        professionals: data.professionals?.length || 0,
        services: data.services?.length || 0
      }
    });
  }
}
