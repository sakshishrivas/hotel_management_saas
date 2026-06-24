import type { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class RoomTypeRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.RoomTypeUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).roomType.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).roomType.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByCode(hotelId: string, code: string, db?: DbClient) {
    return this.getClient(db).roomType.findFirst({
      where: { hotelId, code, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.RoomTypeUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).roomType.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string, db?: DbClient) {
    return this.getClient(db).roomType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.RoomTypeWhereInput;
      orderBy?: Prisma.RoomTypeOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).roomType.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
    });
  }

  async count(where?: Prisma.RoomTypeWhereInput, db?: DbClient) {
    return this.getClient(db).roomType.count({
      where: { ...where, deletedAt: null },
    });
  }
}

export const roomTypeRepository = new RoomTypeRepository();
