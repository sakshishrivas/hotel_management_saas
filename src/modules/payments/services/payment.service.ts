import { Prisma, PaymentStatus } from '@prisma/client';
import { paymentRepository } from '../repositories/payment.repository';
import type { CreatePaymentDto, UpdatePaymentStatusDto, QueryPaymentDto } from '../validators/payment.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

function generatePaymentRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${timestamp}-${random}`;
}

export class PaymentService {
  async recordPayment(data: CreatePaymentDto, actorUserId?: string) {
    return paymentRepository.transaction(async (tx) => {
      const paymentRef = generatePaymentRef();
      const status = data.paymentMethod === 'cash' ? PaymentStatus.captured : PaymentStatus.pending;
      const paidAt = status === PaymentStatus.captured ? new Date() : undefined;

      const payment = await paymentRepository.create({
        hotelId: data.hotelId,
        bookingId: data.bookingId,
        invoiceId: data.invoiceId,
        paymentRef,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        currencyCode: data.currencyCode,
        status,
        paidAt,
        gatewayTransactionId: data.gatewayTransactionId,
        receivedByUserId: actorUserId,
        notes: data.notes
      }, tx);

      // Auto-allocate if invoiceId is provided and payment is captured
      if (data.invoiceId && status === PaymentStatus.captured) {
         const invoice = await paymentRepository.getInvoiceForAllocation(data.invoiceId, tx);
         if (invoice && Number(invoice.balanceDue) > 0) {
            const allocAmount = Math.min(data.amount, Number(invoice.balanceDue));
            await paymentRepository.createAllocationAndUpdateInvoice(
               payment.id,
               invoice.id,
               data.hotelId,
               allocAmount,
               Number(invoice.balanceDue),
               tx
            );
         }
      }

      return paymentRepository.findById(payment.id, tx);
    });
  }

  async getPaymentById(id: string) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND, 'PAYMENT_NOT_FOUND');
    }
    return payment;
  }

  async updatePaymentStatus(id: string, data: UpdatePaymentStatusDto, actorUserId?: string) {
    const payment = await this.getPaymentById(id);

    return paymentRepository.transaction(async (tx) => {
      const updateData: Prisma.PaymentUncheckedUpdateInput = {
        status: data.status,
      };

      if (data.gatewayTransactionId) updateData.gatewayTransactionId = data.gatewayTransactionId;
      if (data.status === PaymentStatus.captured && !payment.paidAt) updateData.paidAt = new Date();

      const updated = await paymentRepository.update(id, updateData, tx);

      // Auto-allocate if status changed to captured and it has an invoiceId but no allocations yet
      if (updated.status === PaymentStatus.captured && updated.invoiceId && payment.paymentAllocations?.length === 0) {
         const invoice = await paymentRepository.getInvoiceForAllocation(updated.invoiceId, tx);
         if (invoice && Number(invoice.balanceDue) > 0) {
            const allocAmount = Math.min(Number(updated.amount), Number(invoice.balanceDue));
            await paymentRepository.createAllocationAndUpdateInvoice(
               updated.id,
               invoice.id,
               updated.hotelId,
               allocAmount,
               Number(invoice.balanceDue),
               tx
            );
         }
      }

      return paymentRepository.findById(updated.id, tx);
    });
  }

  async listPayments(query: QueryPaymentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};

    if (query.hotelId) where.hotelId = query.hotelId;
    if (query.bookingId) where.bookingId = query.bookingId;
    if (query.invoiceId) where.invoiceId = query.invoiceId;
    if (query.status) where.status = query.status;
    if (query.paymentMethod) where.paymentMethod = query.paymentMethod;

    if (query.search) {
      where.OR = [
        { paymentRef: { contains: query.search, mode: 'insensitive' } },
        { gatewayTransactionId: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      paymentRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      paymentRepository.count(where),
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

export const paymentService = new PaymentService();
