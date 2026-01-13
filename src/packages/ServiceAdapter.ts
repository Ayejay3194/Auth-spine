import type { Service, ID } from '../core/types.js';
import { AppError } from '../core/errors.js';

export interface DatabaseService {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  priceCents: number;
  durationMin: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class ServiceAdapter {
  abstract create(input: Omit<Service, 'id'>): Promise<Service>;
  abstract get(id: ID): Promise<Service | undefined>;
  abstract byProfessional(professionalId: ID): Promise<Service[]>;
  abstract update(id: ID, updates: Partial<Omit<Service, 'id'>>): Promise<Service | undefined>;
  abstract delete(id: ID): Promise<boolean>;
  abstract all(): Promise<Service[]>;
  abstract search(query: string): Promise<Service[]>;
}

export class PrismaServiceAdapter extends ServiceAdapter {
  constructor(private prisma: any) {
    super();
  }

  async create(input: Omit<Service, 'id'>): Promise<Service> {
    try {
      const service = await this.prisma.service.create({
        data: {
          providerId: input.professionalId,
          name: input.name,
          description: input.metadata?.description || '',
          priceCents: input.price.amountCents,
          durationMin: input.durationMin,
          active: true
        }
      });

      return this.mapToService(service);
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new AppError('Professional not found', 'NOT_FOUND', 404);
      }
      throw new AppError('Failed to create service', 'DATABASE_ERROR', 500);
    }
  }

  async get(id: ID): Promise<Service | undefined> {
    try {
      const service = await this.prisma.service.findUnique({
        where: { id }
      });

      return service ? this.mapToService(service) : undefined;
    } catch (error) {
      throw new AppError('Failed to get service', 'DATABASE_ERROR', 500);
    }
  }

  async byProfessional(professionalId: ID): Promise<Service[]> {
    try {
      const services = await this.prisma.service.findMany({
        where: {
          providerId: professionalId,
          active: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return services.map((service: DatabaseService) => this.mapToService(service));
    } catch (error) {
      throw new AppError('Failed to get services by professional', 'DATABASE_ERROR', 500);
    }
  }

  async update(id: ID, updates: Partial<Omit<Service, 'id'>>): Promise<Service | undefined> {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.durationMin) updateData.durationMin = updates.durationMin;
      if (updates.price) updateData.priceCents = updates.price.amountCents;
      if (updates.locationType) updateData.description = JSON.stringify({ locationType: updates.locationType });
      if (updates.recurrence) updateData.description = JSON.stringify({ recurrence: updates.recurrence });
      if (updates.metadata) {
        const existingService = await this.prisma.service.findUnique({ where: { id } });
        const existingMetadata = existingService?.description ? JSON.parse(existingService.description) : {};
        updateData.description = JSON.stringify({ ...existingMetadata, ...updates.metadata });
      }

      const service = await this.prisma.service.update({
        where: { id },
        data: updateData
      });

      return this.mapToService(service);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return undefined;
      }
      throw new AppError('Failed to update service', 'DATABASE_ERROR', 500);
    }
  }

  async delete(id: ID): Promise<boolean> {
    try {
      // Soft delete by setting active to false
      await this.prisma.service.update({
        where: { id },
        data: { active: false }
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw new AppError('Failed to delete service', 'DATABASE_ERROR', 500);
    }
  }

  async all(): Promise<Service[]> {
    try {
      const services = await this.prisma.service.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' }
      });

      return services.map((service: DatabaseService) => this.mapToService(service));
    } catch (error) {
      throw new AppError('Failed to get all services', 'DATABASE_ERROR', 500);
    }
  }

  async search(query: string): Promise<Service[]> {
    try {
      const services = await this.prisma.service.findMany({
        where: {
          AND: [
            { active: true },
            {
              OR: [
                {
                  name: {
                    contains: query,
                    mode: 'insensitive'
                  }
                },
                {
                  description: {
                    contains: query,
                    mode: 'insensitive'
                  }
                }
              ]
            }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      return services.map((service: DatabaseService) => this.mapToService(service));
    } catch (error) {
      throw new AppError('Failed to search services', 'DATABASE_ERROR', 500);
    }
  }

  private mapToService(service: DatabaseService): Service {
    let metadata = {};
    let locationType: Service['locationType'] = 'in_person';
    let recurrence: Service['recurrence'] = 'one_time';

    try {
      if (service.description) {
        const parsed = JSON.parse(service.description);
        metadata = parsed;
        locationType = parsed.locationType || 'in_person';
        recurrence = parsed.recurrence || 'one_time';
      }
    } catch {
      // Description is plain text, not JSON
      metadata = { description: service.description };
    }

    return {
      id: service.id,
      professionalId: service.providerId,
      name: service.name,
      durationMin: service.durationMin,
      price: {
        currency: 'USD',
        amountCents: service.priceCents
      },
      locationType,
      recurrence,
      metadata
    };
  }
}
