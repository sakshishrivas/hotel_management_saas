import type { Prisma, PrismaClient, InvoiceStatus, PaymentStatus } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class PaymentAllocationRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.PaymentAllocationUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).paymentAllocation.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).paymentAllocation.findFirst({
      where: { id, deletedAt: null },
      include: { invoice: true, payment: true },
    });
  }

  async softDelete(id: string, db?: DbClient) {
    return this.getClient(db).paymentAllocation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.PaymentAllocationWhereInput;
      orderBy?: Prisma.PaymentAllocationOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).paymentAllocation.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
      include: { invoice: { select: { invoiceNumber: true } }, payment: { select: { paymentRef: true } } },
    });
  }

  async count(where?: Prisma.PaymentAllocationWhereInput, db?: DbClient) {
    return this.getClient(db).paymentAllocation.count({
      where: { ...where, deletedAt: null },
    });
  }

  async getPaymentWithAllocations(paymentId: string, db?: DbClient) {
     return this.getClient(db).payment.findFirst({
        where: { id: paymentId, deletedAt: null },
        include: { paymentAllocations: { where: { deletedAt: null } } }
     });
  }

  async getInvoice(invoiceId: string, db?: DbClient) {
     return this.getClient(db).invoice.findFirst({
        where: { id: invoiceId, deletedAt: null }
     });
  }

  async updateInvoiceBalance(invoiceId: string, newBalanceDue: number, db?: DbClient) {
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

export const paymentAllocationRepository = new PaymentAllocationRepository();
