'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useInvoice, useInvoiceItems, useDeleteInvoiceItem } from '../hooks/use-invoices';
import { InvoiceItem } from '../types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash } from 'lucide-react';
import { InvoiceItemDialog } from './invoice-item-dialog';

export function InvoiceDetails() {
  const params = useParams();
  const invoiceId = params.id as string;
  
  const { data: invoiceData, isLoading: isInvoiceLoading } = useInvoice(invoiceId);
  const { data: itemsData, isLoading: isItemsLoading } = useInvoiceItems({ invoiceId, limit: 100 });
  const deleteMutation = useDeleteInvoiceItem();

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);

  if (isInvoiceLoading || isItemsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const invoice = invoiceData?.data;
  const items = itemsData?.data || [];

  if (!invoice) return <div>Invoice not found.</div>;

  const handleEdit = (item: InvoiceItem) => {
    setEditingItem(item);
    setItemDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setItemDialogOpen(true);
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate({ id: itemId, invoiceId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Invoice Details</CardTitle>
              <StatusBadge status={invoice.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice #</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Issue Date</span>
              <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date</span>
              <span>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking Ref</span>
              <span>{invoice.booking?.bookingReference}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{invoice.subtotal} {invoice.currencyCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{invoice.taxTotal} {invoice.currencyCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{invoice.discountTotal} {invoice.currencyCode}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Grand Total</span>
              <span>{invoice.grandTotal} {invoice.currencyCode}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid</span>
              <span>{invoice.paidAmount} {invoice.currencyCode}</span>
            </div>
            <div className="flex justify-between text-red-600 font-semibold">
              <span>Outstanding</span>
              <span>{invoice.outstandingAmount} {invoice.currencyCode}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Line Items</CardTitle>
            {invoice.status === 'draft' && (
              <Button onClick={handleAdd} size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Tax</th>
                  <th className="px-4 py-3 text-right">Discount</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  {invoice.status === 'draft' && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{item.description}</td>
                      <td className="px-4 py-3">{item.itemType}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{item.unitPrice}</td>
                      <td className="px-4 py-3 text-right">{item.taxAmount}</td>
                      <td className="px-4 py-3 text-right text-red-500">{item.discountAmount > 0 ? `-${item.discountAmount}` : '0'}</td>
                      <td className="px-4 py-3 text-right font-bold">{item.totalAmount}</td>
                      {invoice.status === 'draft' && (
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(item.id)} className="text-red-500">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <InvoiceItemDialog
        invoiceId={invoiceId}
        open={itemDialogOpen}
        onOpenChange={(open) => {
          setItemDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        initialData={editingItem}
      />
    </div>
  );
}
