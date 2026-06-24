import type { Prisma, PrismaClient, InvoiceStatus } from '@prisma/client';
import { BaseRepository } from '../../../repositories/base.repository';

type DbClient = Prisma.TransactionClient | PrismaClient;

export class InvoiceItemRepository extends BaseRepository {
  private getClient(db?: DbClient) {
    return db ?? this.db;
  }

  async transaction<T>(callback: (db: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  async create(data: Prisma.InvoiceItemUncheckedCreateInput, db?: DbClient) {
    return this.getClient(db).invoiceItem.create({ data });
  }

  async findById(id: string, db?: DbClient) {
    return this.getClient(db).invoiceItem.findFirst({
      where: { id, deletedAt: null },
      include: { invoice: { select: { status: true } } },
    });
  }

  async update(id: string, data: Prisma.InvoiceItemUncheckedUpdateInput, db?: DbClient) {
    return this.getClient(db).invoiceItem.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string, db?: DbClient) {
    return this.getClient(db).invoiceItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.InvoiceItemWhereInput;
      orderBy?: Prisma.InvoiceItemOrderByWithRelationInput;
    },
    db?: DbClient,
  ) {
    const { skip, take, where, orderBy } = params;
    return this.getClient(db).invoiceItem.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
    });
  }

  async count(where?: Prisma.InvoiceItemWhereInput, db?: DbClient) {
    return this.getClient(db).invoiceItem.count({
      where: { ...where, deletedAt: null },
    });
  }

  async getNextLineNo(invoiceId: string, db?: DbClient) {
    const lastItem = await this.getClient(db).invoiceItem.findFirst({
      where: { invoiceId, deletedAt: null },
      orderBy: { lineNo: 'desc' },
    });
    return lastItem ? lastItem.lineNo + 1 : 1;
  }

  async getInvoiceTotals(invoiceId: string, db?: DbClient) {
    const items = await this.getClient(db).invoiceItem.findMany({
      where: { invoiceId, deletedAt: null },
    });

    let subtotal = 0;
    let tax = 0;
    let discount = 0;

    for (const item of items) {
       subtotal += Number(item.unitPrice) * Number(item.quantity);
       tax += Number(item.taxAmount);
       discount += Number(item.discountAmount);
    }
    return { subtotal, tax, discount, total: subtotal + tax - discount };
  }

  async updateInvoiceTotals(invoiceId: string, data: { subtotal: number, tax: number, discount: number, total: number }, db?: DbClient) {
     const invoice = await this.getClient(db).invoice.findUnique({ where: { id: invoiceId } });
     if (!invoice) return;

     // Calculate new balance due based on existing amountPaid
     const amountPaid = Number(invoice.totalAmount) - Number(invoice.balanceDue); // Or calculate directly from payments/allocations if we stored amountPaid
     // Let's assume amountPaid is totalAmount - balanceDue for simplicity, but wait, the invoice has no amountPaid field. It just has balanceDue.
     // Let's recalculate balanceDue = newTotal - amountPaid.
     const newBalanceDue = data.total - amountPaid;

     return this.getClient(db).invoice.update({
        where: { id: invoiceId },
        data: {
           subtotalAmount: data.subtotal,
           taxAmount: data.tax,
           discountAmount: data.discount,
           totalAmount: data.total,
           balanceDue: newBalanceDue > 0 ? newBalanceDue : 0,
        }
     });
  }
  
  async getInvoiceStatus(invoiceId: string, db?: DbClient) {
     const inv = await this.getClient(db).invoice.findUnique({ where: { id: invoiceId }});
     return inv?.status;
  }
}

export const invoiceItemRepository = new InvoiceItemRepository();
