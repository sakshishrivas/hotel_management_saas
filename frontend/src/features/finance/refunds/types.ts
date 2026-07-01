export interface Refund {
  id: string;
  hotelId: string;
  paymentId: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'; // from PaymentStatus enum
  createdAt: string;
  updatedAt: string;
  payment?: {
    paymentMethod: string;
    currencyCode: string;
    booking?: {
      bookingReference: string;
      customer?: {
        firstName: string;
        lastName: string;
      }
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
