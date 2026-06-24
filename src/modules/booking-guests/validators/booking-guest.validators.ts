import { z } from 'zod';

export const createBookingGuestSchema = z.object({
  hotelId: z.string().uuid(),
  bookingRoomId: z.string().uuid(),
  guestType: z.string().max(50).default('guest'),
  fullName: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  documentType: z.string().max(50).optional(),
  documentNo: z.string().max(100).optional(),
  isPrimary: z.boolean().default(false),
  dateOfBirth: z.string().datetime().optional(),
  nationality: z.string().max(100).optional(),
  notes: z.string().optional(),
});

export const updateBookingGuestSchema = createBookingGuestSchema.partial().omit({ hotelId: true, bookingRoomId: true });

export const queryBookingGuestSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  bookingRoomId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type CreateBookingGuestDto = z.infer<typeof createBookingGuestSchema>;
export type UpdateBookingGuestDto = z.infer<typeof updateBookingGuestSchema>;
export type QueryBookingGuestDto = z.infer<typeof queryBookingGuestSchema>;
