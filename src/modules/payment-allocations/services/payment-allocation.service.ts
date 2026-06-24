import { PaymentStatus } from '@prisma/client';
import { paymentAllocationRepository } from '../repositories/payment-allocation.repository';
import type { AllocatePaymentDto, QueryAllocationDto } from '../validators/payment-allocation.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class PaymentAllocationService {
  async allocate(data: AllocatePaymentDto, actorUserId?: string) {
    return paymentAllocationRepository.transaction(async (tx) => {
      const payment = await paymentAllocationRepository.getPaymentWithAllocations(data.paymentId, tx);
      if (!payment) throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND, 'PAYMENT_NOT_FOUND');
      
      if (payment.status !== PaymentStatus.captured) {
         throw new AppError('Only captured payments can be allocated', HTTP_STATUS.BAD_REQUEST, 'INVALID_PAYMENT_STATUS');
      }

      const invoice = await paymentAllocationRepository.getInvoice(data.invoiceId, tx);
      if (!invoice) throw new AppError('Invoice not found', HTTP_STATUS.NOT_FOUND, 'INVOICE_NOT_FOUND');

      const alreadyAllocatedAmount = payment.paymentAllocations.reduce((sum, alloc) => sum + Number(alloc.amount), 0);
      const availablePaymentAmount = Number(payment.amount) - alreadyAllocatedAmount;

      if (data.amount > availablePaymentAmount) {
         throw new AppError('Allocation amount exceeds available payment amount', HTTP_STATUS.BAD_REQUEST, 'OVER_ALLOCATION');
      }

      if (data.amount > Number(invoice.balanceDue)) {
         throw new AppError('Allocation amount exceeds invoice balance due', HTTP_STATUS.BAD_REQUEST, 'OVER_ALLOCATION');
      }

      const allocation = await paymentAllocationRepository.create({
         hotelId: data.hotelId,
         paymentId: data.paymentId,
         invoiceId: data.invoiceId,
         amount: data.amount
      }, tx);

      const newBalanceDue = Number(invoice.balanceDue) - data.amount;
      await paymentAllocationRepository.updateInvoiceBalance(invoice.id, newBalanceDue, tx);

      return paymentAllocationRepository.findById(allocation.id, tx);
    });
  }

  async getAllocationById(id: string) {
    const allocation = await paymentAllocationRepository.findById(id);
    if (!allocation) {
      throw new AppError('Payment allocation not found', HTTP_STATUS.NOT_FOUND, 'ALLOCATION_NOT_FOUND');
    }
    return allocation;
  }

  async deleteAllocation(id: string, actorUserId?: string) {
     const allocation = await this.getAllocationById(id);

     return paymentAllocationRepository.transaction(async (tx) => {
        const deleted = await paymentAllocationRepository.softDelete(id, tx);

        // Revert invoice balance
        const invoice = await paymentAllocationRepository.getInvoice(allocation.invoiceId, tx);
        if (invoice) {
           const newBalanceDue = Number(invoice.balanceDue) + Number(allocation.amount);
           await paymentAllocationRepository.updateInvoiceBalance(invoice.id, newBalanceDue, tx);
        }

        return deleted;
     });
  }

  async listAllocations(query: QueryAllocationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Parameters<typeof paymentAllocationRepository.findMany>[0]['where'] = {};

    if (query.hotelId) where.hotelId = query.hotelId;
    if (query.paymentId) where.paymentId = query.paymentId;
    if (query.invoiceId) where.invoiceId = query.invoiceId;

    const [items, total] = await Promise.all([
      paymentAllocationRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      paymentAllocationRepository.count(where),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const paymentAllocationService = new PaymentAllocationService();
