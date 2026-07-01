import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { refundsApi } from '../api/refunds.api';
import { ProcessRefundFormValues } from '../schema';
import { toast } from 'sonner';

export function useRefunds(params?: { page?: number; limit?: number; status?: string; paymentId?: string }) {
  return useQuery({
    queryKey: ['refunds', params],
    queryFn: () => refundsApi.getRefunds(params),
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProcessRefundFormValues) => refundsApi.processRefund(data),
    onSuccess: () => {
      toast.success('Refund processed successfully');
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to process refund');
    },
  });
}

export function useUpdateRefundStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => refundsApi.updateRefundStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success('Refund status updated');
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['refunds', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update refund status');
    },
  });
}
