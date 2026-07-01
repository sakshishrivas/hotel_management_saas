import * as z from 'zod';

export const recordPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  invoiceId: z.string().optional(),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other']),
  amount: z.any().transform(Number).pipe(z.number().min(0.01, 'Amount must be greater than 0')),
  currencyCode: z.string().length(3).default('USD'),
  gatewayTransactionId: z.string().optional(),
  notes: z.string().optional(),
});

export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;

export const allocatePaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.any().transform(Number).pipe(z.number().min(0.01, 'Amount must be greater than 0')),
});

export type AllocatePaymentFormValues = z.infer<typeof allocatePaymentSchema>;
