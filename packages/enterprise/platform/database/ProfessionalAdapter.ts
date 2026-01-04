import type { Professional, ID, Vertical } from '../core/types.js';
import { AppError } from '../core/errors.js';

export interface DatabaseProvider {
  id: string;
  userId: string;
  businessName?: string;
  bio?: string;
  yearsExp?: number;
  specialties: string[];
  location?: string;
  serviceArea?: string;
  verified: boolean;
  licenseId?: string;
  stripeAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export abstract class ProfessionalAdapter {
  abstract create(input: Omit<Professional, 'id'>): Promise<Professional>;
  abstract get(id: ID): Promise<Professional | undefined>;
  abstract getByEmail(email: string): Promise<Professional | undefined>;
  abstract byVertical(vertical: Vertical): Promise<Professional[]>;
  abstract update(id: ID, updates: Partial<Omit<Professional, 'id'>>): Promise<Professional | undefined>;
  abstract delete(id: ID): Promise<boolean>;
  abstract all(): Promise<Professional[]>;
  abstract search(query: string): Promise<Professional[]>;
  abstract exists(email: string): Promise<boolean>;
  abstract getVerticals(): Promise<Vertical[]>;
}

export class PrismaProfessionalAdapter extends ProfessionalAdapter {
  constructor(private prisma: any) {
    super();
  }

  async create(input: Omit<Professional, 'id'>): Promise<Professional> {
    try {
      // First create the user
      const user = await this.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: 'provider'
        }
      });

      // Then create the provider profile
      const provider = await this.prisma.provider.create({
        data: {
          userId: user.id,
          bio: input.bio,
          specialties: [input.vertical], // Store vertical as specialty
          verified: false
        },
        include: {
          user: true
        }
      });

      return this.mapToProfessional(provider);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Professional with this email already exists', 'EMAIL_EXISTS', 409);
      }
      throw new AppError('Failed to create professional', 'DATABASE_ERROR', 500);
    }
  }

  async get(id: ID): Promise<Professional | undefined> {
    try {
      const provider = await this.prisma.provider.findUnique({
        where: { id },
        include: { user: true }
      });

      return provider ? this.mapToProfessional(provider) : undefined;
    } catch (error) {
      throw new AppError('Failed to get professional', 'DATABASE_ERROR', 500);
    }
  }

  async getByEmail(email: string): Promise<Professional | undefined> {
    try {
      const provider = await this.prisma.provider.findFirst({
        where: {
          user: {
            email
          }
        },
        include: { user: true }
      });

      return provider ? this.mapToProfessional(provider) : undefined;
    } catch (error) {
      throw new AppError('Failed to get professional by email', 'DATABASE_ERROR', 500);
    }
  }

  async byVertical(vertical: Vertical): Promise<Professional[]> {
    try {
      const providers = await this.prisma.provider.findMany({
        where: {
          specialties: {
            has: vertical
          }
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });

      return providers.map((provider: DatabaseProvider) => this.mapToProfessional(provider));
    } catch (error) {
      throw new AppError('Failed to get professionals by vertical', 'DATABASE_ERROR', 500);
    }
  }

  async update(id: ID, updates: Partial<Omit<Professional, 'id'>>): Promise<Professional | undefined> {
    try {
      // Update user if name or email provided
      if (updates.name || updates.email) {
        await this.prisma.user.updateMany({
          where: {
            provider: {
              some: { id }
            }
          },
          data: {
            ...(updates.name && { name: updates.name }),
            ...(updates.email && { email: updates.email })
          }
        });
      }

      // Update provider profile
      const updateData: any = {};
      if (updates.bio) updateData.bio = updates.bio;
      if (updates.vertical) updateData.specialties = [updates.vertical];

      const provider = await this.prisma.provider.update({
        where: { id },
        data: updateData,
        include: { user: true }
      });

      return this.mapToProfessional(provider);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return undefined;
      }
      if (error.code === 'P2002') {
        throw new AppError('Email already exists', 'EMAIL_EXISTS', 409);
      }
      throw new AppError('Failed to update professional', 'DATABASE_ERROR', 500);
    }
  }

  async delete(id: ID): Promise<boolean> {
    try {
      await this.prisma.provider.delete({
        where: { id }
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw new AppError('Failed to delete professional', 'DATABASE_ERROR', 500);
    }
  }

  async all(): Promise<Professional[]> {
    try {
      const providers = await this.prisma.provider.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });

      return providers.map((provider: DatabaseProvider) => this.mapToProfessional(provider));
    } catch (error) {
      throw new AppError('Failed to get all professionals', 'DATABASE_ERROR', 500);
    }
  }

  async search(query: string): Promise<Professional[]> {
    try {
      const providers = await this.prisma.provider.findMany({
        where: {
          OR: [
            {
              user: {
                name: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            },
            {
              user: {
                email: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            },
            {
              bio: {
                contains: query,
                mode: 'insensitive'
              }
            }
          ]
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });

      return providers.map((provider: DatabaseProvider) => this.mapToProfessional(provider));
    } catch (error) {
      throw new AppError('Failed to search professionals', 'DATABASE_ERROR', 500);
    }
  }

  async exists(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: {
          email,
          role: 'provider'
        }
      });
      return count > 0;
    } catch (error) {
      throw new AppError('Failed to check if professional exists', 'DATABASE_ERROR', 500);
    }
  }

  async getVerticals(): Promise<Vertical[]> {
    try {
      const providers = await this.prisma.provider.findMany({
        select: { specialties: true }
      });

      const allSpecialties = providers.flatMap(p => p.specialties);
      return [...new Set(allSpecialties)] as Vertical[];
    } catch (error) {
      throw new AppError('Failed to get verticals', 'DATABASE_ERROR', 500);
    }
  }

  private mapToProfessional(provider: DatabaseProvider): Professional {
    const vertical = provider.specialties[0] || 'general'; // Use first specialty as vertical
    return {
      id: provider.id,
      email: provider.user?.email || '',
      name: provider.user?.name || '',
      vertical,
      bio: provider.bio,
      metadata: {
        businessName: provider.businessName,
        yearsExp: provider.yearsExp,
        specialties: provider.specialties,
        location: provider.location,
        serviceArea: provider.serviceArea,
        verified: provider.verified,
        licenseId: provider.licenseId,
        stripeAccountId: provider.stripeAccountId
      }
    };
  }

  private mapToProfessionalWithUser(provider: DatabaseProvider & { user: { email: string; name?: string } }): Professional {
    const vertical = provider.specialties[0] || 'general'; // Use first specialty as vertical
    return {
      id: provider.id,
      email: provider.user.email || '',
      name: provider.user.name || '',
      vertical,
      bio: provider.bio,
      metadata: {
        businessName: provider.businessName,
        yearsExp: provider.yearsExp,
        specialties: provider.specialties,
        location: provider.location,
        serviceArea: provider.serviceArea,
        verified: provider.verified,
        licenseId: provider.licenseId,
        stripeAccountId: provider.stripeAccountId
      }
    };
  }
}
