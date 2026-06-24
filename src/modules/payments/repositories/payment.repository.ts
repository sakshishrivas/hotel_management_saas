import type { Prisma, PrismaClient, InvoiceStatus } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class PaymentRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.PaymentUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).payment.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).payment.findFirst({
      where: { id, deletedAt: null },
      include: {
        paymentAllocations: { where: { deletedAt: null } },
        refunds: { where: { deletedAt: null } },
      },
    });
  }

  async update(id: string, data: Prisma.PaymentUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).payment.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string, db?: DbClient) {
    return this.getClient(db).payment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.PaymentWhereInput;
      orderBy?: Prisma.PaymentOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).payment.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
    });
  }

  async count(where?: Prisma.PaymentWhereInput, db?: DbClient) {
    return this.getClient(db).payment.count({
      where: { ...where, deletedAt: null },
    });
  }

  async getInvoiceForAllocation(invoiceId: string, db?: DbClient) {
     return this.getClient(db).invoice.findFirst({
        where: { id: invoiceId, deletedAt: null }
     });
  }

  async createAllocationAndUpdateInvoice(
     paymentId: string, 
     invoiceId: string, 
     hotelId: string,
     amount: number, 
     currentBalanceDue: number, 
     db?: DbClient
  ) {
     await this.getClient(db).paymentAllocation.create({
        data: {
           hotelId,
           paymentId,
           invoiceId,
           amount
        }
     });

     const newBalanceDue = currentBalanceDue - amount;
     let status: InvoiceStatus = 'partially_paid';
     if (newBalanceDue <= 0) {
        status = 'paid';
     }

     return this.getClient(db).invoice.update({
        where: { id: invoiceId },
        data: {
           balanceDue: newBalanceDue > 0 ? newBalanceDue : 0,
           status
        }
     });
  }
}

export const paymentRepository = new PaymentRepository();
