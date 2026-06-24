import { z } from 'zod';

export const createCustomerSchema = z.object({
  hotelId: z.string().uuid(),
  userId: z.string().uuid(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.string().max(20).optional(),
  nationality: z.string().max(100).optional(),
  documentType: z.string().max(50).optional(),
  documentNo: z.string().max(100).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(50).optional(),
  countryCode: z.string().length(2).optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial().omit({ hotelId: true, userId: true });

export const queryCustomerSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;
export type QueryCustomerDto = z.infer<typeof queryCustomerSchema>;
