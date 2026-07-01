import * as z from 'zod';

export const processRefundSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amount: z.any().transform(Number).pipe(z.number().min(0.01, 'Amount must be greater than 0')),
  reason: z.string().optional(),
});

export type ProcessRefundFormValues = z.infer<typeof processRefundSchema>;
