import * as z from 'zod';

export const generateInvoiceSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export type GenerateInvoiceFormValues = z.infer<typeof generateInvoiceSchema>;

export const invoiceItemSchema = z.object({
  itemType: z.string().min(1, 'Item type is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1).default(1),
  unitPrice: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
});

export type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;
