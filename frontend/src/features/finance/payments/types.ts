export interface PaymentAllocation {
  id: string;
  hotelId: string;
  paymentId: string;
  invoiceId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  invoice?: {
    invoiceNumber: string;
  };
}

export interface Payment {
  id: string;
  hotelId: string;
  bookingId: string;
  invoiceId?: string;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'other';
  amount: number;
  currencyCode: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  gatewayTransactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  allocations?: PaymentAllocation[];
  booking?: {
    bookingReference: string;
    customer?: {
      firstName: string;
      lastName: string;
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
