import type { Prisma, PrismaClient, InvoiceStatus, PaymentStatus } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class RefundRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.RefundUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).refund.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).refund.findFirst({
      where: { id, deletedAt: null },
      include: { payment: true },
    });
  }

  async update(id: string, data: Prisma.RefundUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).refund.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.RefundWhereInput;
      orderBy?: Prisma.RefundOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).refund.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
    });
  }

  async count(where?: Prisma.RefundWhereInput, db?: DbClient) {
    return this.getClient(db).refund.count({
      where: { ...where, deletedAt: null },
    });
  }

  async getPaymentWithDetails(paymentId: string, db?: DbClient) {
     return this.getClient(db).payment.findFirst({
        where: { id: paymentId, deletedAt: null },
        include: { 
           refunds: { where: { deletedAt: null } },
           paymentAllocations: { where: { deletedAt: null }, include: { invoice: true } }
        }
     });
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus, db?: DbClient) {
     return this.getClient(db).payment.update({
        where: { id: paymentId },
        data: { status }
     });
  }

  async revertAllocations(allocationsToRevert: any[], db?: DbClient) {
     for (const alloc of allocationsToRevert) {
        // Soft delete allocation
        await this.getClient(db).paymentAllocation.update({
           where: { id: alloc.id },
           data: { deletedAt: new Date() }
        });

        // Revert invoice balance
        const currentBalance = Number(alloc.invoice.balanceDue);
        const newBalance = currentBalance + Number(alloc.amount);
        let status: InvoiceStatus = 'partially_paid';
        if (newBalance >= Number(alloc.invoice.totalAmount)) {
           status = 'issued'; // if not fully paid anymore and balance == total
        }

        await this.getClient(db).invoice.update({
           where: { id: alloc.invoiceId },
           data: {
              balanceDue: newBalance,
              status
           }
        });
     }
  }
}

export const refundRepository = new RefundRepository();
