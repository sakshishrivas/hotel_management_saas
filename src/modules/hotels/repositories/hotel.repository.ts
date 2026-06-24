import type { Prisma, PrismaClient } from '@prisma/client';

import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class HotelRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.HotelUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).hotel.create({
      data,
    });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).hotel.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByCode(hotelCode: string, db?: DbClient) {
    return this.getClient(db).hotel.findFirst({
      where: { hotelCode, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.HotelUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).hotel.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string, db?: DbClient) {
    return this.getClient(db).hotel.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.HotelWhereInput;
      orderBy?: Prisma.HotelOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).hotel.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
    });
  }

  async count(where?: Prisma.HotelWhereInput, db?: DbClient) {
    return this.getClient(db).hotel.count({
      where: { ...where, deletedAt: null },
    });
  }
}

export const hotelRepository = new HotelRepository();
