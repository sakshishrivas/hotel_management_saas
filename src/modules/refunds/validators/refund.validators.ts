import { z } from 'zod';
import { PaymentStatus } from '@prisma/client';

export const processRefundSchema = z.object({
  hotelId: z.string().uuid(),
  paymentId: z.string().uuid(),
  amount: z.number().min(0.01),
  reason: z.string().optional(),
});

export const updateRefundStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
});

export const queryRefundSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  paymentId: z.string().uuid().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
});

export type ProcessRefundDto = z.infer<typeof processRefundSchema>;
export type UpdateRefundStatusDto = z.infer<typeof updateRefundStatusSchema>;
export type QueryRefundDto = z.infer<typeof queryRefundSchema>;
