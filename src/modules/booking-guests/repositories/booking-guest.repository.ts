import type { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class BookingGuestRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.BookingGuestUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).bookingGuest.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).bookingGuest.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.BookingGuestUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).bookingGuest.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string, db?: DbClient) {
    return this.getClient(db).bookingGuest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.BookingGuestWhereInput;
      orderBy?: Prisma.BookingGuestOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).bookingGuest.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
    });
  }

  async count(where?: Prisma.BookingGuestWhereInput, db?: DbClient) {
    return this.getClient(db).bookingGuest.count({
      where: { ...where, deletedAt: null },
    });
  }
}

export const bookingGuestRepository = new BookingGuestRepository();
