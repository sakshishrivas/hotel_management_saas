import * as z from 'zod';

export const checkInSchema = z.object({
  depositAmount: z.coerce.number().min(0).default(0),
  remarks: z.string().optional(),
});

export type CheckInFormValues = z.infer<typeof checkInSchema>;

export const checkOutSchema = z.object({
  finalInspectionStatus: z.string().optional(),
  remarks: z.string().optional(),
});

export type CheckOutFormValues = z.infer<typeof checkOutSchema>;
