import { z } from 'zod';
import { HousekeepingStatus, HousekeepingPriority } from '@prisma/client';

export const createHousekeepingTaskSchema = z.object({
  hotelId: z.string().uuid(),
  roomId: z.string().uuid().optional(),
  taskType: z.string().min(1).max(100),
  priority: z.nativeEnum(HousekeepingPriority).optional().default(HousekeepingPriority.medium),
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateHousekeepingTaskSchema = z.object({
  taskType: z.string().min(1).max(100).optional(),
  priority: z.nativeEnum(HousekeepingPriority).optional(),
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const assignHousekeepingTaskSchema = z.object({
  assignedToUserId: z.string().uuid(),
});

export const completeHousekeepingTaskSchema = z.object({
  notes: z.string().optional(),
});

export const queryHousekeepingTaskSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  roomId: z.string().uuid().optional(),
  status: z.nativeEnum(HousekeepingStatus).optional(),
  priority: z.nativeEnum(HousekeepingPriority).optional(),
  assignedToUserId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type CreateHousekeepingTaskDto = z.infer<typeof createHousekeepingTaskSchema>;
export type UpdateHousekeepingTaskDto = z.infer<typeof updateHousekeepingTaskSchema>;
export type AssignHousekeepingTaskDto = z.infer<typeof assignHousekeepingTaskSchema>;
export type CompleteHousekeepingTaskDto = z.infer<typeof completeHousekeepingTaskSchema>;
export type QueryHousekeepingTaskDto = z.infer<typeof queryHousekeepingTaskSchema>;
