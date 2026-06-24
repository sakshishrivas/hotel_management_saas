import { z } from 'zod';

export const allocatePaymentSchema = z.object({
  hotelId: z.string().uuid(),
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number().min(0.01),
});

export const queryAllocationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  paymentId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
});

export type AllocatePaymentDto = z.infer<typeof allocatePaymentSchema>;
export type QueryAllocationDto = z.infer<typeof queryAllocationSchema>;
