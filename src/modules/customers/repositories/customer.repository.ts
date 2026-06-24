import type { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class CustomerRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.CustomerProfileUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).customerProfile.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).customerProfile.findFirst({
      where: { id, deletedAt: null },
      include: { user: { select: { id: true, email: true, displayName: true, phone: true } } },
    });
  }

  async findByUserAndHotel(userId: string, hotelId: string, db?: DbClient) {
    return this.getClient(db).customerProfile.findFirst({
      where: { userId, hotelId, deletedAt: null },
    });
  }

  async findByCustomerNo(customerNo: string, db?: DbClient) {
    return this.getClient(db).customerProfile.findFirst({
      where: { customerNo, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.CustomerProfileUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).customerProfile.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string, db?: DbClient) {
    return this.getClient(db).customerProfile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.CustomerProfileWhereInput;
      orderBy?: Prisma.CustomerProfileOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).customerProfile.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
      include: { user: { select: { id: true, email: true, displayName: true, phone: true } } },
    });
  }

  async count(where?: Prisma.CustomerProfileWhereInput, db?: DbClient) {
    return this.getClient(db).customerProfile.count({
      where: { ...where, deletedAt: null },
    });
  }
}

export const customerRepository = new CustomerRepository();
