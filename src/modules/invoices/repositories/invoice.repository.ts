import type { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class InvoiceRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.InvoiceUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).invoice.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).invoice.findFirst({
      where: { id, deletedAt: null },
      include: {
        invoiceItems: { where: { deletedAt: null } },
        payments: { where: { deletedAt: null } },
        paymentAllocations: { where: { deletedAt: null }, include: { payment: true } },
      },
    });
  }

  async findByBookingId(bookingId: string, db?: DbClient) {
    return this.getClient(db).invoice.findFirst({
      where: { bookingId, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.InvoiceUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).invoice.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string, db?: DbClient) {
    return this.getClient(db).invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.InvoiceWhereInput;
      orderBy?: Prisma.InvoiceOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).invoice.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
      include: {
        booking: { select: { bookingRef: true } },
      },
    });
  }

  async count(where?: Prisma.InvoiceWhereInput, db?: DbClient) {
    return this.getClient(db).invoice.count({
      where: { ...where, deletedAt: null },
    });
  }

  async getBookingWithDetails(bookingId: string, db?: DbClient) {
     return this.getClient(db).booking.findFirst({
        where: { id: bookingId, deletedAt: null },
        include: {
           bookingRooms: {
              where: { deletedAt: null }
           }
        }
     });
  }
}

export const invoiceRepository = new InvoiceRepository();
