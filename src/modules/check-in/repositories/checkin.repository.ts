import type { Prisma, PrismaClient, RoomStatus, BookingStatus } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class CheckinRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.CheckinRecordUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).checkinRecord.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).checkinRecord.findFirst({
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
    return this.getClient(db).checkinRecord.findFirst({
      where: { bookingId, deletedAt: null },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.CheckinRecordWhereInput;
      orderBy?: Prisma.CheckinRecordOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).checkinRecord.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
      include: {
         booking: { select: { bookingRef: true, status: true } }
      }
    });
  }

  async count(where?: Prisma.CheckinRecordWhereInput, db?: DbClient) {
    return this.getClient(db).checkinRecord.count({
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
}

export const checkinRepository = new CheckinRepository();
