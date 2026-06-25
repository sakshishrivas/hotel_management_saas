import * as z from 'zod';

export const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().max(20).optional(),
  nationality: z.string().max(100).optional(),
  documentType: z.string().max(50).optional(),
  documentNo: z.string().max(100).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(50).optional(),
  countryCode: z.string().length(2, 'Must be 2 characters').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
