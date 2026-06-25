import * as z from 'zod';

export const bookingRoomSchema = z.object({
  roomTypeId: z.string().min(1, 'Room Type is required'),
  roomId: z.string().optional(),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
  nightlyRate: z.coerce.number().min(0, 'Must be positive').default(0),
  notes: z.string().optional(),
});

export const bookingSchema = z.object({
  customerProfileId: z.string().optional(),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
  sourceChannel: z.string().default('front_desk'),
  currencyCode: z.string().length(3).default('USD'),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
  rooms: z.array(bookingRoomSchema).min(1, 'At least one room is required'),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
export type BookingRoomFormValues = z.infer<typeof bookingRoomSchema>;

export const cancelBookingSchema = z.object({
  cancellationReason: z.string().min(1, 'Reason is required').max(500),
});

export type CancelBookingFormValues = z.infer<typeof cancelBookingSchema>;
