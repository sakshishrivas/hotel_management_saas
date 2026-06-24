import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export const createPaymentSchema = z.object({
  hotelId: z.string().uuid(),
  bookingId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  amount: z.number().min(0.01),
  currencyCode: z.string().length(3).default('USD'),
  gatewayTransactionId: z.string().max(100).optional(),
  notes: z.string().optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  gatewayTransactionId: z.string().max(100).optional(),
});

export const queryPaymentSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  search: z.string().optional(),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusDto = z.infer<typeof updatePaymentStatusSchema>;
export type QueryPaymentDto = z.infer<typeof queryPaymentSchema>;
