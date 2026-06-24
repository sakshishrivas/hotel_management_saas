import type { Prisma, PrismaClient, RoomStatus, BookingStatus } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class CheckoutRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.CheckoutRecordUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).checkoutRecord.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).checkoutRecord.findFirst({
      where: { id, deletedAt: null },
      include: {
        booking: {
           include: {
              bookingRooms: {
                 where: { deletedAt: null },
                 include: { room: true }
              }
           }
        }
      }
    });
  }

  async findByBookingId(bookingId: string, db?: DbClient) {
    return this.getClient(db).checkoutRecord.findFirst({
      where: { bookingId, deletedAt: null },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.CheckoutRecordWhereInput;
      orderBy?: Prisma.CheckoutRecordOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).checkoutRecord.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
      include: {
         booking: { select: { bookingRef: true, status: true } }
      }
    });
  }

  async count(where?: Prisma.CheckoutRecordWhereInput, db?: DbClient) {
    return this.getClient(db).checkoutRecord.count({
      where: { ...where, deletedAt: null },
    });
  }

  async getBookingWithRooms(bookingId: string, db?: DbClient) {
    return this.getClient(db).booking.findFirst({
      where: { id: bookingId, deletedAt: null },
      include: {
        bookingRooms: {
          where: { deletedAt: null },
          include: { room: true }
        }
      }
    });
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus, db?: DbClient) {
    return this.getClient(db).booking.update({
      where: { id: bookingId },
      data: { status }
    });
  }

  async updateRoomStatus(roomId: string, status: RoomStatus, db?: DbClient) {
    return this.getClient(db).room.update({
      where: { id: roomId },
      data: { status }
    });
  }

  async logRoomStatusChange(
    data: {
      hotelId: string;
      roomId: string;
      oldStatus?: RoomStatus;
      newStatus: RoomStatus;
      changedByUserId?: string;
      reason?: string;
    },
    db?: DbClient,
  ) {
    return this.getClient(db).roomStatusHistory.create({ data });
  }

  async createHousekeepingTask(data: Prisma.HousekeepingTaskUncheckedCreateInput, db?: DbClient) {
     return this.getClient(db).housekeepingTask.create({ data });
  }
}

export const checkoutRepository = new CheckoutRepository();
