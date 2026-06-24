import type { Prisma, PrismaClient, RoomStatus } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class RoomRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.RoomUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).room.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).room.findFirst({
      where: { id, deletedAt: null },
      include: {
        roomType: true,
      },
    });
  }

  async findByRoomNumber(hotelId: string, roomNumber: string, db?: DbClient) {
    return this.getClient(db).room.findFirst({
      where: { hotelId, roomNumber, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.RoomUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).room.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string, db?: DbClient) {
    return this.getClient(db).room.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async logStatusChange(
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
    return this.getClient(db).roomStatusHistory.create({
      data,
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.RoomWhereInput;
      orderBy?: Prisma.RoomOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).room.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
      include: {
        roomType: true,
      },
    });
  }

  async count(where?: Prisma.RoomWhereInput, db?: DbClient) {
    return this.getClient(db).room.count({
      where: { ...where, deletedAt: null },
    });
  }
}

export const roomRepository = new RoomRepository();
