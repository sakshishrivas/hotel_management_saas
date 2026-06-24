import { z } from 'zod';

export const createHotelSchema = z.object({
  hotelCode: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  legalName: z.string().max(255).optional(),
  taxRegistrationNo: z.string().max(100).optional(),
  currencyCode: z.string().length(3).optional(),
  timezone: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(50).optional(),
  countryCode: z.string().length(2).optional(),
  isActive: z.boolean().optional(),
});

export const updateHotelSchema = createHotelSchema.partial();

export const queryHotelSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional().transform((v) => v === 'true' ? true : v === 'false' ? false : undefined),
});

export type CreateHotelDto = z.infer<typeof createHotelSchema>;
export type UpdateHotelDto = z.infer<typeof updateHotelSchema>;
export type QueryHotelDto = z.infer<typeof queryHotelSchema>;
