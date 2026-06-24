import { z } from 'zod';

export const createRoomTypeSchema = z.object({
  hotelId: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  baseOccupancy: z.number().int().min(1).optional(),
  maxOccupancy: z.number().int().min(1).optional(),
  bedType: z.string().max(100).optional(),
  roomSizeSqm: z.number().positive().optional(),
  baseRate: z.number().nonnegative().optional(),
  extraBedRate: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const updateRoomTypeSchema = createRoomTypeSchema.partial().omit({ hotelId: true });

export const queryRoomTypeSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional().transform((v) => v === 'true' ? true : v === 'false' ? false : undefined),
});

export type CreateRoomTypeDto = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeDto = z.infer<typeof updateRoomTypeSchema>;
export type QueryRoomTypeDto = z.infer<typeof queryRoomTypeSchema>;
