import type { ClientProfile, ID } from '../core/types.js';
import { AppError } from '../core/errors.js';

export interface DatabaseClient {
  id: string;
  userId: string;
  phone?: string;
  preferences?: any;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface DatabaseUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class ClientAdapter {
  abstract create(input: Omit<ClientProfile, 'id'>): Promise<ClientProfile>;
  abstract get(id: ID): Promise<ClientProfile | undefined>;
  abstract getByEmail(email: string): Promise<ClientProfile | undefined>;
  abstract update(id: ID, updates: Partial<Omit<ClientProfile, 'id'>>): Promise<ClientProfile | undefined>;
  abstract delete(id: ID): Promise<boolean>;
  abstract all(): Promise<ClientProfile[]>;
  abstract search(query: string): Promise<ClientProfile[]>;
  abstract exists(email: string): Promise<boolean>;
}

export class PrismaClientAdapter extends ClientAdapter {
  constructor(private prisma: any) {
    super();
  }

  async create(input: Omit<ClientProfile, 'id'>): Promise<ClientProfile> {
    try {
      // First create the user
      const user = await this.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: 'client'
        }
      });

      // Then create the client profile
      const client = await this.prisma.client.create({
        data: {
          userId: user.id,
          phone: input.phone,
          preferences: input.preferences || {}
        },
        include: {
          user: true
        }
      });

      return this.mapToClientProfile(client);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Client with this email already exists', 'EMAIL_EXISTS', 409);
      }
      throw new AppError('Failed to create client', 'DATABASE_ERROR', 500);
    }
  }

  async get(id: ID): Promise<ClientProfile | undefined> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id },
        include: { user: true }
      });

      return client ? this.mapToClientProfile(client) : undefined;
    } catch (error) {
      throw new AppError('Failed to get client', 'DATABASE_ERROR', 500);
    }
  }

  async getByEmail(email: string): Promise<ClientProfile | undefined> {
    try {
      const client = await this.prisma.client.findFirst({
        where: {
          user: {
            email
          }
        },
        include: { user: true }
      });

      return client ? this.mapToClientProfile(client) : undefined;
    } catch (error) {
      throw new AppError('Failed to get client by email', 'DATABASE_ERROR', 500);
    }
  }

  async update(id: ID, updates: Partial<Omit<ClientProfile, 'id'>>): Promise<ClientProfile | undefined> {
    try {
      // Update user if name or email provided
      if (updates.name || updates.email) {
        await this.prisma.user.updateMany({
          where: {
            clients: {
              some: { id }
            }
          },
          data: {
            ...(updates.name && { name: updates.name }),
            ...(updates.email && { email: updates.email })
          }
        });
      }

      // Update client profile
      const client = await this.prisma.client.update({
        where: { id },
        data: {
          ...(updates.phone && { phone: updates.phone }),
          ...(updates.preferences && { preferences: updates.preferences }),
          ...(updates.metadata && { preferences: { ...updates.metadata } })
        },
        include: { user: true }
      });

      return this.mapToClientProfile(client);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return undefined;
      }
      if (error.code === 'P2002') {
        throw new AppError('Email already exists', 'EMAIL_EXISTS', 409);
      }
      throw new AppError('Failed to update client', 'DATABASE_ERROR', 500);
    }
  }

  async delete(id: ID): Promise<boolean> {
    try {
      await this.prisma.client.delete({
        where: { id }
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw new AppError('Failed to delete client', 'DATABASE_ERROR', 500);
    }
  }

  async all(): Promise<ClientProfile[]> {
    try {
      const clients = await this.prisma.client.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });

      return clients.map(client => this.mapToClientProfile(client));
    } catch (error) {
      throw new AppError('Failed to get all clients', 'DATABASE_ERROR', 500);
    }
  }

  async search(query: string): Promise<ClientProfile[]> {
    try {
      const clients = await this.prisma.client.findMany({
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
            }
          ]
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });

      return clients.map(client => this.mapToClientProfile(client));
    } catch (error) {
      throw new AppError('Failed to search clients', 'DATABASE_ERROR', 500);
    }
  }

  async exists(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: {
          email,
          role: 'client'
        }
      });
      return count > 0;
    } catch (error) {
      throw new AppError('Failed to check if client exists', 'DATABASE_ERROR', 500);
    }
  }

  private mapToClientProfile(client: DatabaseClient): ClientProfile {
    return {
      id: client.id,
      email: client.user?.email || '',
      name: client.user?.name || '',
      phone: client.phone,
      preferences: client.preferences || {},
      metadata: client.preferences || {}
    };
  }
}
