'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvoices } from '@/features/finance/invoices/hooks/use-invoices';
import { usePayments } from '@/features/finance/payments/hooks/use-payments';
import { Wallet, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinanceDashboardPage() {
  // We use recent records to calculate an overview since we don't have a dedicated API yet
  const { data: invoicesData, isLoading: invLoading } = useInvoices({ limit: 100 });
  const { data: paymentsData, isLoading: payLoading } = usePayments({ limit: 100, status: 'completed' });

  const isLoading = invLoading || payLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Financial Overview" description="Loading metrics..." />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const invoices = invoicesData?.data || [];
  const payments = paymentsData?.data || [];

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.outstandingAmount, 0);
  const recentInvoicesCount = invoices.length;
  
  // Outstanding critical: Invoices with due dates in the past
  const today = new Date();
  const overdueInvoices = invoices.filter(i => i.outstandingAmount > 0 && i.dueDate && new Date(i.dueDate) < today).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Overview"
        description="High-level view of your hotel's financial health."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">From recorded completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balances</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total unpaid across all invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentInvoicesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Total invoices generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">Invoices past their due date</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.slice(0, 5).length > 0 ? (
              <div className="space-y-4">
                {payments.slice(0, 5).map(payment => (
                  <div key={payment.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium capitalize">{payment.paymentMethod.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="font-bold text-green-600">
                      +${payment.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No recent payments recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.filter(i => i.outstandingAmount > 0).slice(0, 5).length > 0 ? (
              <div className="space-y-4">
                {invoices.filter(i => i.outstandingAmount > 0).slice(0, 5).map(invoice => (
                  <div key={invoice.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">Invoice #{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="font-bold text-red-600">
                      ${invoice.outstandingAmount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No outstanding invoices.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
