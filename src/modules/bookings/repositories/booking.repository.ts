import type { Prisma, PrismaClient, BookingStatus } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class BookingRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.BookingUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).booking.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).booking.findFirst({
      where: { id, deletedAt: null },
      include: {
        bookingRooms: {
          where: { deletedAt: null },
          include: {
            room: true,
            roomType: true,
            bookingGuests: { where: { deletedAt: null } },
          },
        },
        customerProfile: {
          include: { user: { select: { id: true, email: true, displayName: true } } },
        },
      },
    });
  }

  async findByRef(bookingRef: string, db?: DbClient) {
    return this.getClient(db).booking.findFirst({
      where: { bookingRef, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.BookingUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).booking.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string, db?: DbClient) {
    return this.getClient(db).booking.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async createBookingRoom(data: Prisma.BookingRoomUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).bookingRoom.create({ data });
  }

  async findBookingRoomsByBookingId(bookingId: string, db?: DbClient) {
    return this.getClient(db).bookingRoom.findMany({
      where: { bookingId, deletedAt: null },
      include: { room: true, roomType: true },
    });
  }

  async checkRoomAvailability(
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date,
    excludeBookingId?: string,
    db?: DbClient,
  ) {
    const conflicting = await this.getClient(db).bookingRoom.findFirst({
      where: {
        roomId,
        deletedAt: null,
        booking: {
          deletedAt: null,
          status: {
            notIn: ['cancelled', 'checked_out', 'no_show'] as BookingStatus[],
          },
          ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        },
        AND: [
          { checkInDate: { lt: checkOutDate } },
          { checkOutDate: { gt: checkInDate } },
        ],
      },
      include: { booking: { select: { bookingRef: true, status: true } } },
    });
    return conflicting;
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.BookingWhereInput;
      orderBy?: Prisma.BookingOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).booking.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
      include: {
        bookingRooms: {
          where: { deletedAt: null },
          include: { room: true, roomType: true },
        },
        customerProfile: {
          include: { user: { select: { id: true, email: true, displayName: true } } },
        },
      },
    });
  }

  async count(where?: Prisma.BookingWhereInput, db?: DbClient) {
    return this.getClient(db).booking.count({
      where: { ...where, deletedAt: null },
    });
  }

  async updateRoom(id: string, data: Prisma.RoomUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).room.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }
}

export const bookingRepository = new BookingRepository();
