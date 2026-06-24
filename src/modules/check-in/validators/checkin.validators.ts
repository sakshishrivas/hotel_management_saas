import { z } from 'zod';

export const createCheckinSchema = z.object({
  hotelId: z.string().uuid(),
  bookingId: z.string().uuid(),
  depositAmount: z.number().min(0).default(0),
  remarks: z.string().optional(),
});

export const queryCheckinSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
});

export type CreateCheckinDto = z.infer<typeof createCheckinSchema>;
export type QueryCheckinDto = z.infer<typeof queryCheckinSchema>;
