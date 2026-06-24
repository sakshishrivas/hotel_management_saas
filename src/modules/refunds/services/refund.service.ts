import { Prisma, PaymentStatus } from '@prisma/client';
import { refundRepository } from '../repositories/refund.repository';
import type { ProcessRefundDto, UpdateRefundStatusDto, QueryRefundDto } from '../validators/refund.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

function generateRefundRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REF-${timestamp}-${random}`;
}

export class RefundService {
  async processRefund(data: ProcessRefundDto, actorUserId?: string) {
    return refundRepository.transaction(async (tx) => {
      const payment = await refundRepository.getPaymentWithDetails(data.paymentId, tx);
      if (!payment) throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND, 'PAYMENT_NOT_FOUND');
      
      if (payment.status !== PaymentStatus.captured && payment.status !== PaymentStatus.partially_refunded) {
         throw new AppError('Only captured payments can be refunded', HTTP_STATUS.BAD_REQUEST, 'INVALID_PAYMENT_STATUS');
      }

      const alreadyRefundedAmount = payment.refunds
         .filter(r => r.status === PaymentStatus.refunded)
         .reduce((sum, r) => sum + Number(r.amount), 0);
         
      const availableToRefund = Number(payment.amount) - alreadyRefundedAmount;

      if (data.amount > availableToRefund) {
         throw new AppError('Refund amount exceeds available payment amount', HTTP_STATUS.BAD_REQUEST, 'OVER_REFUND');
      }

      const refundRef = generateRefundRef();
      const status = PaymentStatus.pending; // Awaiting gateway confirmation usually, but we'll allow status updates.

      const refund = await refundRepository.create({
         hotelId: data.hotelId,
         paymentId: data.paymentId,
         refundRef,
         amount: data.amount,
         reason: data.reason,
         status,
         processedByUserId: actorUserId
      }, tx);

      return refundRepository.findById(refund.id, tx);
    });
  }

  async getRefundById(id: string) {
    const refund = await refundRepository.findById(id);
    if (!refund) {
      throw new AppError('Refund not found', HTTP_STATUS.NOT_FOUND, 'REFUND_NOT_FOUND');
    }
    return refund;
  }

  async updateRefundStatus(id: string, data: UpdateRefundStatusDto, actorUserId?: string) {
    const refund = await this.getRefundById(id);

    return refundRepository.transaction(async (tx) => {
      const updateData: Prisma.RefundUncheckedUpdateInput = {
        status: data.status,
      };

      if (data.status === PaymentStatus.refunded && !refund.refundedAt) {
         updateData.refundedAt = new Date();
      }

      const updated = await refundRepository.update(id, updateData, tx);

      if (updated.status === PaymentStatus.refunded) {
         // Cascade changes to payment and allocations
         const payment = await refundRepository.getPaymentWithDetails(updated.paymentId, tx);
         if (payment) {
            const alreadyRefundedAmount = payment.refunds
               .filter(r => r.status === PaymentStatus.refunded)
               .reduce((sum, r) => sum + Number(r.amount), 0);
               
            const paymentNewStatus = alreadyRefundedAmount >= Number(payment.amount) ? PaymentStatus.refunded : PaymentStatus.partially_refunded;
            await refundRepository.updatePaymentStatus(payment.id, paymentNewStatus, tx);

            // Revert allocations if necessary. If a payment is refunded, its allocations might need to be reversed.
            // For simplicity in this logic, we reverse all allocations associated with this payment if it gets fully refunded,
            // or just leave it up to the user to manage allocations manually if partially refunded.
            // Let's implement reversing allocations automatically from most recent if total allocations exceed remaining paid amount.
            let allocatedSum = payment.paymentAllocations.reduce((s, a) => s + Number(a.amount), 0);
            const remainingPaid = Number(payment.amount) - alreadyRefundedAmount;

            if (allocatedSum > remainingPaid) {
               // We need to reverse allocations until allocatedSum <= remainingPaid
               const allocationsToRevert = [];
               for (const alloc of payment.paymentAllocations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())) {
                  allocationsToRevert.push(alloc);
                  allocatedSum -= Number(alloc.amount);
                  if (allocatedSum <= remainingPaid) break;
               }
               await refundRepository.revertAllocations(allocationsToRevert, tx);
            }
         }
      }

      return refundRepository.findById(updated.id, tx);
    });
  }

  async listRefunds(query: QueryRefundDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Parameters<typeof refundRepository.findMany>[0]['where'] = {};

    if (query.hotelId) where.hotelId = query.hotelId;
    if (query.paymentId) where.paymentId = query.paymentId;
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      refundRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      refundRepository.count(where),
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

export const refundService = new RefundService();
