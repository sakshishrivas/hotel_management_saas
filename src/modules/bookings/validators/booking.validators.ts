import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

const bookingRoomSchema = z.object({
  roomTypeId: z.string().uuid(),
  roomId: z.string().uuid().optional(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  nightlyRate: z.number().min(0),
  notes: z.string().optional(),
});

export const createBookingSchema = z.object({
  hotelId: z.string().uuid(),
  customerProfileId: z.string().uuid().optional(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  sourceChannel: z.string().max(50).default('front_desk'),
  currencyCode: z.string().length(3).default('USD'),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
  rooms: z.array(bookingRoomSchema).min(1),
});

export const updateBookingSchema = z.object({
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
});

export const cancelBookingSchema = z.object({
  cancellationReason: z.string().min(1).max(500),
});

export const queryBookingSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  customerProfileId: z.string().uuid().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  search: z.string().optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export type UpdateBookingDto = z.infer<typeof updateBookingSchema>;
export type CancelBookingDto = z.infer<typeof cancelBookingSchema>;
export type QueryBookingDto = z.infer<typeof queryBookingSchema>;
export type BookingRoomDto = z.infer<typeof bookingRoomSchema>;
