import { z } from 'zod';

export const createInvoiceItemSchema = z.object({
  hotelId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  itemType: z.string().min(1).max(100),
  description: z.string().min(1),
  quantity: z.number().min(1).default(1),
  unitPrice: z.number().min(0),
  taxAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
});

export const updateInvoiceItemSchema = z.object({
  description: z.string().min(1).optional(),
  quantity: z.number().min(1).optional(),
  unitPrice: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
});

export const queryInvoiceItemSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  hotelId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
});

export type CreateInvoiceItemDto = z.infer<typeof createInvoiceItemSchema>;
export type UpdateInvoiceItemDto = z.infer<typeof updateInvoiceItemSchema>;
export type QueryInvoiceItemDto = z.infer<typeof queryInvoiceItemSchema>;
