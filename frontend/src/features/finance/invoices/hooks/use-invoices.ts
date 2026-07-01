import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '../api/invoices.api';
import { GenerateInvoiceFormValues, InvoiceItemFormValues } from '../schema';
import { toast } from 'sonner';

export function useInvoices(params?: { page?: number; limit?: number; search?: string; status?: string; bookingId?: string }) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesApi.getInvoices(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesApi.getInvoice(id),
    enabled: !!id,
  });
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateInvoiceFormValues) => invoicesApi.generateInvoice(data),
    onSuccess: () => {
      toast.success('Invoice generated successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to generate invoice');
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => invoicesApi.updateInvoiceStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success('Invoice status updated');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update invoice status');
    },
  });
}

export function useInvoiceItems(params?: { invoiceId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['invoice-items', params],
    queryFn: () => invoicesApi.getInvoiceItems(params),
    enabled: !!params?.invoiceId,
  });
}

export function useAddInvoiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: InvoiceItemFormValues }) => invoicesApi.addInvoiceItem(invoiceId, data),
    onSuccess: (_, variables) => {
      toast.success('Invoice item added');
      queryClient.invalidateQueries({ queryKey: ['invoice-items', { invoiceId: variables.invoiceId }] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.invoiceId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to add item');
    },
  });
}

export function useUpdateInvoiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, invoiceId }: { id: string; data: Partial<InvoiceItemFormValues>; invoiceId: string }) => invoicesApi.updateInvoiceItem(id, data),
    onSuccess: (_, variables) => {
      toast.success('Invoice item updated');
      queryClient.invalidateQueries({ queryKey: ['invoice-items', { invoiceId: variables.invoiceId }] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.invoiceId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update item');
    },
  });
}

export function useDeleteInvoiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, invoiceId }: { id: string; invoiceId: string }) => invoicesApi.deleteInvoiceItem(id),
    onSuccess: (_, variables) => {
      toast.success('Invoice item deleted');
      queryClient.invalidateQueries({ queryKey: ['invoice-items', { invoiceId: variables.invoiceId }] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.invoiceId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete item');
    },
  });
}
