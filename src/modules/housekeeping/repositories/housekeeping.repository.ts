import type { Prisma, PrismaClient, RoomStatus } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class HousekeepingRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.HousekeepingTaskUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).housekeepingTask.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).housekeepingTask.findFirst({
      where: { id, deletedAt: null },
      include: {
        room: true,
        assignedToUser: { select: { id: true, displayName: true } },
      },
    });
  }

  async update(id: string, data: Prisma.HousekeepingTaskUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).housekeepingTask.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string, db?: DbClient) {
    return this.getClient(db).housekeepingTask.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.HousekeepingTaskWhereInput;
      orderBy?: Prisma.HousekeepingTaskOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).housekeepingTask.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
      include: {
        room: true,
        assignedToUser: { select: { id: true, displayName: true } },
      },
    });
  }

  async count(where?: Prisma.HousekeepingTaskWhereInput, db?: DbClient) {
    return this.getClient(db).housekeepingTask.count({
      where: { ...where, deletedAt: null },
    });
  }

  async updateRoomStatus(roomId: string, status: RoomStatus, db?: DbClient) {
    return this.getClient(db).room.update({
      where: { id: roomId },
      data: { status, updatedAt: new Date() }
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

export const housekeepingRepository = new HousekeepingRepository();
