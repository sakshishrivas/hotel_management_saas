'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useInvoice, useInvoiceItems } from '@/features/finance/invoices/hooks/use-invoices';

export default function InvoicePrintView() {
  const params = useParams();
  const invoiceId = params.id as string;
  
  const { data: invoiceData, isLoading: isInvoiceLoading } = useInvoice(invoiceId);
  const { data: itemsData, isLoading: isItemsLoading } = useInvoiceItems({ invoiceId, limit: 100 });

  useEffect(() => {
    // Automatically trigger print dialog when data is loaded
    if (!isInvoiceLoading && !isItemsLoading && invoiceData && itemsData) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [isInvoiceLoading, isItemsLoading, invoiceData, itemsData]);

  if (isInvoiceLoading || isItemsLoading) {
    return <div className="p-10 text-center font-mono">Loading invoice data...</div>;
  }

  const invoice = invoiceData?.data;
  const items = itemsData?.data || [];

  if (!invoice) return <div className="p-10 font-mono">Invoice not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Invoice</h1>
          <p className="text-gray-500 mt-1">Invoice #{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="font-bold text-xl">Hotel Management SaaS</h2>
          <p className="text-gray-500 text-sm mt-1">123 Hospitality Way<br/>City, State 12345</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-gray-400 uppercase text-xs tracking-wider mb-2">Billed To</h3>
          <p className="font-medium text-lg">{invoice.booking?.customer?.firstName} {invoice.booking?.customer?.lastName}</p>
          {invoice.booking?.customer?.email && <p className="text-sm text-gray-600">{invoice.booking.customer.email}</p>}
          <p className="text-sm text-gray-600 mt-1">Booking Ref: {invoice.booking?.bookingReference}</p>
        </div>
        <div className="text-right">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-gray-500">Issue Date:</span>
            <span className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</span>
            
            <span className="text-gray-500">Due Date:</span>
            <span className="font-medium">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Upon receipt'}</span>
            
            <span className="text-gray-500">Status:</span>
            <span className="font-medium uppercase">{invoice.status}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800 text-sm">
              <th className="py-3 px-2">Description</th>
              <th className="py-3 px-2 text-center">Type</th>
              <th className="py-3 px-2 text-right">Qty</th>
              <th className="py-3 px-2 text-right">Unit Price</th>
              <th className="py-3 px-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className={index !== items.length - 1 ? 'border-b border-gray-200' : ''}>
                <td className="py-4 px-2 text-sm">{item.description}</td>
                <td className="py-4 px-2 text-sm text-center text-gray-600">{item.itemType}</td>
                <td className="py-4 px-2 text-sm text-right">{item.quantity}</td>
                <td className="py-4 px-2 text-sm text-right">{item.unitPrice.toFixed(2)}</td>
                <td className="py-4 px-2 text-sm text-right font-medium">{(item.unitPrice * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-1/2 md:w-1/3">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{invoice.subtotal.toFixed(2)} {invoice.currencyCode}</span>
          </div>
          <div className="flex justify-between py-2 text-sm border-b border-gray-200">
            <span className="text-gray-500">Tax</span>
            <span>{invoice.taxTotal.toFixed(2)} {invoice.currencyCode}</span>
          </div>
          {invoice.discountTotal > 0 && (
            <div className="flex justify-between py-2 text-sm text-red-600 border-b border-gray-200">
              <span>Discount</span>
              <span>-{invoice.discountTotal.toFixed(2)} {invoice.currencyCode}</span>
            </div>
          )}
          <div className="flex justify-between py-3 font-bold text-lg">
            <span>Grand Total</span>
            <span>{invoice.grandTotal.toFixed(2)} {invoice.currencyCode}</span>
          </div>
          <div className="flex justify-between py-2 text-sm text-green-700">
            <span>Amount Paid</span>
            <span>{invoice.paidAmount.toFixed(2)} {invoice.currencyCode}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-md text-red-700 border-t-2 border-gray-800 mt-1 pt-2">
            <span>Amount Due</span>
            <span>{invoice.outstandingAmount.toFixed(2)} {invoice.currencyCode}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      {invoice.notes && (
        <div className="mb-8">
          <h4 className="font-semibold text-gray-500 uppercase text-xs tracking-wider mb-2">Notes</h4>
          <p className="text-sm text-gray-700">{invoice.notes}</p>
        </div>
      )}
      
      <div className="text-center text-gray-400 text-xs mt-16 pb-8 border-t pt-8">
        Thank you for your business.
      </div>
    </div>
  );
}
