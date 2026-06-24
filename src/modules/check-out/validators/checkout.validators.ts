import { z } from 'zod';

export const createCheckoutSchema = z.object({
  hotelId: z.string().uuid(),
  bookingId: z.string().uuid(),
  finalInspectionStatus: z.string().max(50).optional(),
  remarks: z.string().optional(),
});

export const queryCheckoutSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
});

export type CreateCheckoutDto = z.infer<typeof createCheckoutSchema>;
export type QueryCheckoutDto = z.infer<typeof queryCheckoutSchema>;
