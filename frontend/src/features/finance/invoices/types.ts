export interface InvoiceItem {
  id: string;
  hotelId: string;
  invoiceId: string;
  itemType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  hotelId: string;
  invoiceNumber: string;
  bookingId: string;
  status: 'draft' | 'issued' | 'paid' | 'partially_paid' | 'voided';
  issueDate: string;
  dueDate?: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paidAmount: number;
  outstandingAmount: number;
  currencyCode: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  invoiceItems?: InvoiceItem[];
  booking?: {
    bookingReference: string;
    customer?: {
      firstName: string;
      lastName: string;
      email?: string;
      addressLine1?: string;
      city?: string;
      countryCode?: string;
    }
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
