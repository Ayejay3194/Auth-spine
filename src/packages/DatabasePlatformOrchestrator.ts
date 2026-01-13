import { PlatformOrchestrator } from './PlatformOrchestrator.js';
import { 
  createDatabaseAdapters,
  ClientAdapter,
  ProfessionalAdapter,
  ServiceAdapter,
  BookingAdapter,
  PaymentAdapter,
  AnalyticsAdapter
} from './database/index.js';

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
} from './core/types.js';

export class DatabasePlatformOrchestrator extends PlatformOrchestrator {
  private dbAdapters: {
    client: ClientAdapter;
    professional: ProfessionalAdapter;
    service: ServiceAdapter;
    booking: BookingAdapter;
    payment: PaymentAdapter;
    analytics: AnalyticsAdapter;
  };

  constructor(prisma: any) {
    super();
    this.dbAdapters = createDatabaseAdapters(prisma);
  }

  // Override client methods to use database
  async createClient(input: Omit<ClientProfile, 'id'>): Promise<ClientProfile> {
    return this.dbAdapters.client.create(input);
  }

  async getClient(id: ID): Promise<ClientProfile | undefined> {
    return this.dbAdapters.client.get(id);
  }

  async getClientByEmail(email: string): Promise<ClientProfile | undefined> {
    return this.dbAdapters.client.getByEmail(email);
  }

  async updateClient(id: ID, updates: Partial<Omit<ClientProfile, 'id'>>): Promise<ClientProfile | undefined> {
    return this.dbAdapters.client.update(id, updates);
  }

  async deleteClient(id: ID): Promise<boolean> {
    return this.dbAdapters.client.delete(id);
  }

  async getAllClients(): Promise<ClientProfile[]> {
    return this.dbAdapters.client.all();
  }

  async searchClients(query: string): Promise<ClientProfile[]> {
    return this.dbAdapters.client.search(query);
  }

  async clientExists(email: string): Promise<boolean> {
    return this.dbAdapters.client.exists(email);
  }

  // Override professional methods to use database
  async createProfessional(input: Omit<Professional, 'id'>): Promise<Professional> {
    return this.dbAdapters.professional.create(input);
  }

  async getProfessional(id: ID): Promise<Professional | undefined> {
    return this.dbAdapters.professional.get(id);
  }

  async getProfessionalByEmail(email: string): Promise<Professional | undefined> {
    return this.dbAdapters.professional.getByEmail(email);
  }

  async getProfessionalsByVertical(vertical: Vertical): Promise<Professional[]> {
    return this.dbAdapters.professional.byVertical(vertical);
  }

  async updateProfessional(id: ID, updates: Partial<Omit<Professional, 'id'>>): Promise<Professional | undefined> {
    return this.dbAdapters.professional.update(id, updates);
  }

  async deleteProfessional(id: ID): Promise<boolean> {
    return this.dbAdapters.professional.delete(id);
  }

  async getAllProfessionals(): Promise<Professional[]> {
    return this.dbAdapters.professional.all();
  }

  async searchProfessionals(query: string): Promise<Professional[]> {
    return this.dbAdapters.professional.search(query);
  }

  async professionalExists(email: string): Promise<boolean> {
    return this.dbAdapters.professional.exists(email);
  }

  async getVerticals(): Promise<Vertical[]> {
    return this.dbAdapters.professional.getVerticals();
  }

  // Override service methods to use database
  async createService(input: Omit<Service, 'id'>): Promise<Service> {
    return this.dbAdapters.service.create(input);
  }

  async getService(id: ID): Promise<Service | undefined> {
    return this.dbAdapters.service.get(id);
  }

  async getServicesByProfessional(professionalId: ID): Promise<Service[]> {
    return this.dbAdapters.service.byProfessional(professionalId);
  }

  async updateService(id: ID, updates: Partial<Omit<Service, 'id'>>): Promise<Service | undefined> {
    return this.dbAdapters.service.update(id, updates);
  }

  async deleteService(id: ID): Promise<boolean> {
    return this.dbAdapters.service.delete(id);
  }

  async getAllServices(): Promise<Service[]> {
    return this.dbAdapters.service.all();
  }

  async searchServices(query: string): Promise<Service[]> {
    return this.dbAdapters.service.search(query);
  }

  // Override booking methods to use database
  async createBooking(input: {
    clientId: ID;
    professionalId: ID;
    serviceId: ID;
    startAtUtc: string;
    endAtUtc: string;
  }): Promise<Booking> {
    // Get service details
    const service = await this.dbAdapters.service.get(input.serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    // Get professional details for vertical
    const professional = await this.dbAdapters.professional.get(input.professionalId);
    if (!professional) {
      throw new Error('Professional not found');
    }

    // Calculate pricing
    const pricing = this.pricing.calculate(
      service,
      input.professionalId,
      professional.vertical,
      service.durationMin
    );

    // Create booking
    const booking = await this.dbAdapters.booking.hold({
      clientId: input.clientId,
      professionalId: input.professionalId,
      service,
      vertical: professional.vertical,
      startAtUtc: input.startAtUtc,
      endAtUtc: input.endAtUtc,
      total: pricing.finalPrice
    }, new Date().toISOString());

    // Track event
    await this.eventBus.emit({
      type: 'booking.created',
      timestamp: new Date().toISOString(),
      userId: input.clientId,
      data: { bookingId: booking.id }
    });

    // Track in analytics
    await this.dbAdapters.analytics.track({
      type: 'booking.created',
      timestamp: new Date().toISOString(),
      userId: input.clientId,
      data: { 
        bookingId: booking.id,
        professionalId: input.professionalId,
        serviceId: input.serviceId,
        amount: pricing.finalPrice.amountCents
      }
    });

    return booking;
  }

  async confirmBooking(bookingId: ID): Promise<Booking> {
    const booking = await this.dbAdapters.booking.confirm(bookingId);
    
    // Track event
    await this.eventBus.emit({
      type: 'booking.confirmed',
      timestamp: new Date().toISOString(),
      userId: booking.clientId,
      data: { bookingId: booking.id }
    });

    // Track in analytics
    await this.dbAdapters.analytics.track({
      type: 'booking.confirmed',
      timestamp: new Date().toISOString(),
      userId: booking.clientId,
      data: { bookingId: booking.id }
    });

    return booking;
  }

  async cancelBooking(bookingId: ID): Promise<Booking> {
    const booking = await this.dbAdapters.booking.cancel(bookingId);
    
    // Track event
    await this.eventBus.emit({
      type: 'booking.cancelled',
      timestamp: new Date().toISOString(),
      userId: booking.clientId,
      data: { bookingId: booking.id }
    });

    // Track in analytics
    await this.dbAdapters.analytics.track({
      type: 'booking.cancelled',
      timestamp: new Date().toISOString(),
      userId: booking.clientId,
      data: { bookingId: booking.id }
    });

    return booking;
  }

  async completeBooking(bookingId: ID): Promise<Booking> {
    const booking = await this.dbAdapters.booking.complete(bookingId);
    
    // Track event
    await this.eventBus.emit({
      type: 'booking.completed',
      timestamp: new Date().toISOString(),
      userId: booking.clientId,
      data: { bookingId: booking.id }
    });

    // Track in analytics
    await this.dbAdapters.analytics.track({
      type: 'booking.completed',
      timestamp: new Date().toISOString(),
      userId: booking.clientId,
      data: { bookingId: booking.id }
    });

    return booking;
  }

  async getBooking(bookingId: ID): Promise<Booking | undefined> {
    return this.dbAdapters.booking.get(bookingId);
  }

  async getBookingsByClient(clientId: ID): Promise<Booking[]> {
    return this.dbAdapters.booking.byClient(clientId);
  }

  async getBookingsByProfessional(professionalId: ID): Promise<Booking[]> {
    return this.dbAdapters.booking.byProfessional(professionalId);
  }

  async getBookingsByStatus(status: Booking['status']): Promise<Booking[]> {
    return this.dbAdapters.booking.byStatus(status);
  }

  async getBookingsInTimeRange(startUtc: string, endUtc: string): Promise<Booking[]> {
    return this.dbAdapters.booking.inTimeRange(startUtc, endUtc);
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.dbAdapters.booking.all();
  }

  async isSlotAvailable(professionalId: ID, startAtUtc: string, endAtUtc: string): Promise<boolean> {
    return this.dbAdapters.booking.isSlotAvailable(professionalId, startAtUtc, endAtUtc);
  }

  // Override payment methods to use database
  async createPaymentIntent(bookingId: ID, amount: any, paymentMethodId?: string): Promise<any> {
    return this.dbAdapters.payment.createIntent(bookingId, amount, paymentMethodId);
  }

  async processPayment(paymentIntentId: ID, paymentMethodId: string): Promise<any> {
    const paymentIntent = await this.dbAdapters.payment.processPayment(paymentIntentId, paymentMethodId);
    
    // Track in analytics
    await this.dbAdapters.analytics.track({
      type: 'payment.processed',
      timestamp: new Date().toISOString(),
      data: { paymentIntentId, amount: paymentIntent.amount.amountCents }
    });

    return paymentIntent;
  }

  async getPaymentIntent(id: ID): Promise<any> {
    return this.dbAdapters.payment.getPaymentIntent(id);
  }

  async getPaymentsByBooking(bookingId: ID): Promise<any[]> {
    return this.dbAdapters.payment.getPaymentsByBooking(bookingId);
  }

  // Override analytics methods to use database
  async getAnalytics(timeRange?: { startDate: string; endDate: string }) {
    return this.dbAdapters.analytics.generateReport({
      startDate: timeRange?.startDate,
      endDate: timeRange?.endDate
    });
  }

  async trackCustomEvent(type: string, data: any, userId?: string, sessionId?: string): Promise<void> {
    await this.dbAdapters.analytics.track({
      type,
      timestamp: new Date().toISOString(),
      userId,
      sessionId,
      data
    });
  }

  async getActiveUsers(timeRange?: { startDate: string; endDate: string }): Promise<number> {
    return this.dbAdapters.analytics.getActiveUsers(timeRange);
  }

  async getConversionRate(fromEventType: string, toEventType: string, timeRange?: { startDate: string; endDate: string }): Promise<number> {
    return this.dbAdapters.analytics.getConversionRate(fromEventType, toEventType, timeRange);
  }

  async exportAnalytics(format: 'json' | 'csv' = 'json'): Promise<string> {
    return this.dbAdapters.analytics.export(format);
  }

  // Override system status to include database metrics
  async getSystemStatus(): Promise<any> {
    const baseStatus = await super.getSystemStatus();
    
    // Add database-specific metrics
    const dbStats = {
      totalEvents: await this.dbAdapters.analytics.query({}).then(events => events.length),
      activeUsers: await this.dbAdapters.analytics.getActiveUsers(),
      conversionRate: await this.dbAdapters.analytics.getConversionRate('booking.created', 'booking.confirmed')
    };

    return {
      ...baseStatus,
      storage: 'database',
      database: dbStats
    };
  }

  // Data export/import for database
  async exportData(): Promise<any> {
    const [
      clients,
      professionals,
      services,
      bookings,
      analytics
    ] = await Promise.all([
      this.getAllClients(),
      this.getAllProfessionals(),
      this.getAllServices(),
      this.getAllBookings(),
      this.dbAdapters.analytics.query({ limit: 10000 })
    ]);

    return {
      clients,
      professionals,
      services,
      bookings,
      analytics,
      verticalConfigs: Array.from((this as any).verticalConfigs.values())
    };
  }

  async importData(data: {
    clients?: ClientProfile[];
    professionals?: Professional[];
    services?: Service[];
    bookings?: Booking[];
    verticalConfigs?: VerticalConfig[];
  }): Promise<void> {
    // Import vertical configs first
    if (data.verticalConfigs) {
      data.verticalConfigs.forEach(config => this.loadVerticalConfig(config));
    }

    // Import other data
    if (data.clients) {
      for (const client of data.clients) {
        try {
          await this.createClient(client);
        } catch (error) {
          console.warn(`Failed to import client ${client.id}:`, error);
        }
      }
    }

    if (data.professionals) {
      for (const professional of data.professionals) {
        try {
          await this.createProfessional(professional);
        } catch (error) {
          console.warn(`Failed to import professional ${professional.id}:`, error);
        }
      }
    }

    if (data.services) {
      for (const service of data.services) {
        try {
          await this.createService(service);
        } catch (error) {
          console.warn(`Failed to import service ${service.id}:`, error);
        }
      }
    }

    // Track import event
    await this.dbAdapters.analytics.track({
      type: 'platform.data_imported',
      timestamp: new Date().toISOString(),
      data: { 
        clients: data.clients?.length || 0,
        professionals: data.professionals?.length || 0,
        services: data.services?.length || 0
      }
    });
  }
}
