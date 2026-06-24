import { z } from 'zod';

export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  hotelId: z.string().uuid().optional(),
});

export const outstandingInvoicesSchema = z.object({
  hotelId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const paymentHistorySchema = z.object({
  hotelId: z.string().uuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type DateRangeDto = z.infer<typeof dateRangeSchema>;
export type OutstandingInvoicesDto = z.infer<typeof outstandingInvoicesSchema>;
export type PaymentHistoryDto = z.infer<typeof paymentHistorySchema>;
