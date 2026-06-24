import * as z from 'zod';

export const hotelSchema = z.object({
  hotelCode: z.string().min(1, 'Hotel Code is required').max(20),
  name: z.string().min(1, 'Name is required').max(100),
  legalName: z.string().max(100).optional(),
  taxRegistrationNo: z.string().max(50).optional(),
  currencyCode: z.string().length(3, 'Must be exactly 3 characters').default('USD'),
  timezone: z.string().min(1, 'Timezone is required').default('UTC'),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  addressLine1: z.string().max(100).optional(),
  addressLine2: z.string().max(100).optional(),
  city: z.string().max(50).optional(),
  state: z.string().max(50).optional(),
  postalCode: z.string().max(20).optional(),
  countryCode: z.string().length(2, 'Must be exactly 2 characters').default('US'),
  isActive: z.boolean().default(true),
});

export type HotelFormValues = z.infer<typeof hotelSchema>;
