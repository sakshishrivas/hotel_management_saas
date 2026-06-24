import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const generateInvoiceSchema = z.object({
  hotelId: z.string().uuid(),
  bookingId: z.string().uuid(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  notes: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  notes: z.string().optional(),
});

export const queryInvoiceSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  search: z.string().optional(),
});

export type GenerateInvoiceDto = z.infer<typeof generateInvoiceSchema>;
export type UpdateInvoiceDto = z.infer<typeof updateInvoiceSchema>;
export type QueryInvoiceDto = z.infer<typeof queryInvoiceSchema>;
