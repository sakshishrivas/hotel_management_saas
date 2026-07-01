// ============================================
// Reports & Analytics Types
// ============================================

// --- Generic Response Types ---
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

// --- Filter Types ---
export interface DateRangeFilter {
  startDate: string;
  endDate: string;
  hotelId?: string;
}

export interface PaginatedFilter {
  page?: number;
  limit?: number;
  hotelId?: string;
}

export interface SearchFilter extends PaginatedFilter {
  search?: string;
  status?: string;
}

// --- Revenue Types ---
export interface RevenueSummary {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    totalInvoiced: number;
    totalTaxesInvoiced: number;
    totalPaymentsCaptured: number;
  };
}

// --- Outstanding Invoice ---
export interface OutstandingInvoice {
  id: string;
  hotelId: string;
  invoiceNumber: string;
  bookingId: string;
  status: string;
  invoiceDate: string;
  dueDate: string | null;
  totalAmount: number;
  taxAmount: number;
  paidAmount: number;
  balanceDue: number;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
  booking?: {
    bookingRef: string;
  };
}

export interface OutstandingInvoicesResponse {
  items: OutstandingInvoice[];
  summary: {
    totalOutstandingAmount: number;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- Payment History ---
export interface PaymentHistoryItem {
  id: string;
  hotelId: string;
  bookingId: string;
  invoiceId?: string;
  paymentMethod: string;
  amount: number;
  currencyCode: string;
  status: string;
  gatewayTransactionId?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paymentAllocations?: {
    id: string;
    amount: number;
    invoice?: {
      invoiceNumber: string;
    };
  }[];
}

export interface PaymentHistoryResponse {
  items: PaymentHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- Booking Analytics ---
export interface Booking {
  id: string;
  hotelId: string;
  bookingRef?: string;
  bookingReference?: string;
  customerProfileId?: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  actualCheckInDate?: string;
  actualCheckOutDate?: string;
  adults: number;
  children: number;
  sourceChannel: string;
  currencyCode: string;
  totalPrice?: number;
  totalAmount?: number;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

// --- Room Analytics ---
export interface Room {
  id: string;
  hotelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor?: number;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roomType?: {
    id: string;
    name: string;
    baseRate: number;
  };
}

// --- Customer Analytics ---
export interface Customer {
  id: string;
  hotelId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Invoice Analytics ---
export interface Invoice {
  id: string;
  hotelId: string;
  invoiceNumber: string;
  bookingId: string;
  status: string;
  invoiceDate?: string;
  issueDate?: string;
  dueDate?: string;
  subtotal?: number;
  totalAmount?: number;
  taxTotal?: number;
  taxAmount?: number;
  discountTotal?: number;
  grandTotal?: number;
  paidAmount: number;
  outstandingAmount?: number;
  balanceDue?: number;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
}

// --- Payment Analytics ---
export interface Payment {
  id: string;
  hotelId: string;
  bookingId: string;
  paymentMethod: string;
  amount: number;
  currencyCode: string;
  status: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Refund Analytics ---
export interface Refund {
  id: string;
  hotelId: string;
  paymentId: string;
  amount: number;
  reason?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// --- Dashboard Stats ---
export interface DashboardAnalytics {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  activeBookings: number;
  occupiedRooms: number;
  availableRooms: number;
  occupancyRate: number;
  checkInsToday: number;
  checkOutsToday: number;
  totalCustomers: number;
  returningCustomers: number;
}

// --- Chart Data ---
export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

// --- Hotel (for filters) ---
export interface Hotel {
  id: string;
  name: string;
  hotelCode: string;
}
