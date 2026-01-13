import type { Booking, ID, ISODateTime, Money, Service, Vertical } from '../core/types.js';
import { AppError } from '../core/errors.js';

export interface DatabaseBooking {
  id: string;
  providerId: string;
  clientId: string;
  serviceId: string;
  startAt: Date;
  endAt: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  depositCents?: number;
  createdAt: Date;
  updatedAt: Date;
  service?: DatabaseService;
  client?: {
    id: string;
    user?: {
      email: string;
      name?: string;
    };
  };
}

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

export abstract class BookingAdapter {
  abstract hold(input: any, nowUtc: ISODateTime): Promise<Booking>;
  abstract confirm(bookingId: ID): Promise<Booking>;
  abstract cancel(bookingId: ID): Promise<Booking>;
  abstract complete(bookingId: ID): Promise<Booking>;
  abstract get(bookingId: ID): Promise<Booking | undefined>;
  abstract byClient(clientId: ID): Promise<Booking[]>;
  abstract byProfessional(professionalId: ID): Promise<Booking[]>;
  abstract byStatus(status: Booking['status']): Promise<Booking[]>;
  abstract inTimeRange(startUtc: ISODateTime, endUtc: ISODateTime): Promise<Booking[]>;
  abstract all(): Promise<Booking[]>;
  abstract isSlotAvailable(professionalId: ID, startAtUtc: ISODateTime, endAtUtc: ISODateTime): Promise<boolean>;
}

export class PrismaBookingAdapter extends BookingAdapter {
  constructor(private prisma: any) {
    super();
  }

  async hold(input: any, nowUtc: ISODateTime): Promise<Booking> {
    try {
      // Check if slot is available
      const isAvailable = await this.isSlotAvailable(
        input.professionalId,
        input.startAtUtc,
        input.endAtUtc
      );

      if (!isAvailable) {
        throw new AppError("Slot is currently held.", "SLOT_HELD", 409);
      }

      const booking = await this.prisma.booking.create({
        data: {
          providerId: input.professionalId,
          clientId: input.clientId,
          serviceId: input.service.id,
          startAt: new Date(input.startAtUtc),
          endAt: new Date(input.endAtUtc),
          status: 'pending', // Map 'held' to 'pending' in database
          notes: input.notes,
          depositCents: input.deposit?.amountCents
        },
        include: {
          service: true,
          client: {
            include: {
              user: true
            }
          }
        }
      });

      return this.mapToBooking(booking);
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new AppError('Invalid client, professional, or service', 'NOT_FOUND', 404);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create booking', 'DATABASE_ERROR', 500);
    }
  }

  async confirm(bookingId: ID): Promise<Booking> {
    try {
      const booking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'confirmed' },
        include: {
          service: true,
          client: {
            include: {
              user: true
            }
          }
        }
      });

      return this.mapToBooking(booking);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError('Booking not found', 'NOT_FOUND', 404);
      }
      throw new AppError('Failed to confirm booking', 'DATABASE_ERROR', 500);
    }
  }

  async cancel(bookingId: ID): Promise<Booking> {
    try {
      const booking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'cancelled' },
        include: {
          service: true,
          client: {
            include: {
              user: true
            }
          }
        }
      });

      return this.mapToBooking(booking);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError('Booking not found', 'NOT_FOUND', 404);
      }
      throw new AppError('Failed to cancel booking', 'DATABASE_ERROR', 500);
    }
  }

  async complete(bookingId: ID): Promise<Booking> {
    try {
      const booking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'completed' },
        include: {
          service: true,
          client: {
            include: {
              user: true
            }
          }
        }
      });

      return this.mapToBooking(booking);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError('Booking not found', 'NOT_FOUND', 404);
      }
      throw new AppError('Failed to complete booking', 'DATABASE_ERROR', 500);
    }
  }

  async get(bookingId: ID): Promise<Booking | undefined> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          service: true,
          client: {
            include: {
              user: true
            }
          }
        }
      });

      return booking ? this.mapToBooking(booking) : undefined;
    } catch (error) {
      throw new AppError('Failed to get booking', 'DATABASE_ERROR', 500);
    }
  }

  async byClient(clientId: ID): Promise<Booking[]> {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: { clientId },
        include: {
          service: true,
          client: {
            include: {
              user: true
            }
          }
        },
        orderBy: { startAt: 'desc' }
      });

      return bookings.map((booking: DatabaseBooking) => this.mapToBooking(booking));
    } catch (error) {
      throw new AppError('Failed to get bookings by client', 'DATABASE_ERROR', 500);
    }
  }

  async byProfessional(professionalId: ID): Promise<Booking[]> {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: { providerId: professionalId },
        include: {
          service: true,
          client: {
            include: {
              user: true
            }
          }
        },
        orderBy: { startAt: 'desc' }
      });

      return bookings.map((booking: DatabaseBooking) => this.mapToBooking(booking));
    } catch (error) {
      throw new AppError('Failed to get bookings by professional', 'DATABASE_ERROR', 500);
    }
  }

  async byStatus(status: Booking['status']): Promise<Booking[]> {
    try {
      // Map platform status to database status
      const dbStatus = status === 'held' ? 'pending' : status;
      
      const bookings = await this.prisma.booking.findMany({
        where: { status: dbStatus },
        include: {
          service: true,
          client: {
            include: {
              user: true
            }
          }
        },
        orderBy: { startAt: 'desc' }
      });

      return bookings.map((booking: DatabaseBooking) => this.mapToBooking(booking));
    } catch (error) {
      throw new AppError('Failed to get bookings by status', 'DATABASE_ERROR', 500);
    }
  }

  async inTimeRange(startUtc: ISODateTime, endUtc: ISODateTime): Promise<Booking[]> {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: {
          startAt: {
            gte: new Date(startUtc)
          },
          endAt: {
            lte: new Date(endUtc)
          }
        },
        include: {
          service: true,
          client: {
            include: {
              user: true
            }
          }
        },
        orderBy: { startAt: 'desc' }
      });

      return bookings.map((booking: DatabaseBooking) => this.mapToBooking(booking));
    } catch (error) {
      throw new AppError('Failed to get bookings in time range', 'DATABASE_ERROR', 500);
    }
  }

  async all(): Promise<Booking[]> {
    try {
      const bookings = await this.prisma.booking.findMany({
        include: {
          service: true,
          client: {
            include: {
              user: true
            }
          }
        },
        orderBy: { startAt: 'desc' }
      });

      return bookings.map((booking: DatabaseBooking) => this.mapToBooking(booking));
    } catch (error) {
      throw new AppError('Failed to get all bookings', 'DATABASE_ERROR', 500);
    }
  }

  async isSlotAvailable(professionalId: ID, startAtUtc: ISODateTime, endAtUtc: ISODateTime): Promise<boolean> {
    try {
      const conflictingBookings = await this.prisma.booking.count({
        where: {
          providerId: professionalId,
          status: {
            in: ['pending', 'confirmed'] // Don't count cancelled or completed bookings
          },
          OR: [
            {
              AND: [
                { startAt: { lt: new Date(endAtUtc) } },
                { endAt: { gt: new Date(startAtUtc) } }
              ]
            }
          ]
        }
      });

      return conflictingBookings === 0;
    } catch (error) {
      throw new AppError('Failed to check slot availability', 'DATABASE_ERROR', 500);
    }
  }

  private mapToBooking(booking: DatabaseBooking): Booking {
    // Map database status to platform status
    let status: Booking['status'] = booking.status;
    if (booking.status === 'pending') status = 'held';
    if (booking.status === 'no_show') status = 'cancelled';
    if (booking.status === 'pending') status = 'held'; // Ensure proper mapping

    return {
      id: booking.id,
      clientId: booking.clientId,
      professionalId: booking.providerId,
      serviceId: booking.serviceId,
      vertical: 'general', // Would need to get from professional
      startAtUtc: booking.startAt.toISOString(),
      endAtUtc: booking.endAt.toISOString(),
      status,
      total: {
        currency: 'USD',
        amountCents: booking.service?.priceCents || 0
      },
      deposit: booking.depositCents ? {
        currency: 'USD',
        amountCents: booking.depositCents
      } : undefined,
      createdAtUtc: booking.createdAt.toISOString()
    };
  }
}
