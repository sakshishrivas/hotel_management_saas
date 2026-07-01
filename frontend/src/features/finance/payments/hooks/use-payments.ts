import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments.api';
import { RecordPaymentFormValues, AllocatePaymentFormValues } from '../schema';
import { toast } from 'sonner';

export function usePayments(params?: { page?: number; limit?: number; search?: string; status?: string; bookingId?: string; invoiceId?: string }) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsApi.getPayments(params),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentsApi.getPayment(id),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordPaymentFormValues) => paymentsApi.createPayment(data),
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] }); // Important to update outstanding balances
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to record payment');
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, gatewayTransactionId }: { id: string; status: string; gatewayTransactionId?: string }) => 
      paymentsApi.updatePaymentStatus(id, status, gatewayTransactionId),
    onSuccess: (_, variables) => {
      toast.success('Payment status updated');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update payment status');
    },
  });
}

export function usePaymentAllocations(params?: { paymentId?: string; invoiceId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['payment-allocations', params],
    queryFn: () => paymentsApi.getAllocations(params),
    enabled: !!params?.paymentId || !!params?.invoiceId,
  });
}

export function useAllocatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: AllocatePaymentFormValues }) => paymentsApi.allocatePayment(paymentId, data),
    onSuccess: (_, variables) => {
      toast.success('Payment allocated successfully');
      queryClient.invalidateQueries({ queryKey: ['payment-allocations', { paymentId: variables.paymentId }] });
      queryClient.invalidateQueries({ queryKey: ['payments', variables.paymentId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to allocate payment');
    },
  });
}
