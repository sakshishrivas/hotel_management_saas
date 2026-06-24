import { z } from 'zod';
import { RoomStatus } from '@prisma/client';

export const createRoomSchema = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  roomNumber: z.string().min(1).max(50),
  floorNo: z.number().int().optional(),
  wing: z.string().max(50).optional(),
  status: z.nativeEnum(RoomStatus).optional(),
  isSmokingAllowed: z.boolean().optional(),
  isAccessible: z.boolean().optional(),
  notes: z.string().optional(),
});

export const updateRoomSchema = createRoomSchema.partial().omit({ hotelId: true });

export const queryRoomSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  roomTypeId: z.string().uuid().optional(),
  status: z.nativeEnum(RoomStatus).optional(),
  search: z.string().optional(),
});

export type CreateRoomDto = z.infer<typeof createRoomSchema>;
export type UpdateRoomDto = z.infer<typeof updateRoomSchema>;
export type QueryRoomDto = z.infer<typeof queryRoomSchema>;
