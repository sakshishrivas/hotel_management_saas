export interface BookingRoom {
  id: string;
  bookingId: string;
  roomTypeId: string;
  roomId?: string;
  adults: number;
  children: number;
  nightlyRate: number;
  totalRoomAmount: number;
  notes?: string;
}

export interface BookingGuest {
  id: string;
  bookingRoomId: string;
  guestType: string;
  fullName: string;
  email?: string;
  phone?: string;
  documentType?: string;
  documentNo?: string;
  isPrimary: boolean;
  dateOfBirth?: string;
  nationality?: string;
  notes?: string;
}

export interface Booking {
  id: string;
  hotelId: string;
  bookingReference: string;
  customerProfileId?: string;
  status: 'draft' | 'confirmed' | 'cancelled' | 'no_show' | 'checked_in' | 'checked_out';
  checkInDate: string;
  checkOutDate: string;
  actualCheckInDate?: string;
  actualCheckOutDate?: string;
  adults: number;
  children: number;
  sourceChannel: string;
  currencyCode: string;
  totalAmount: number;
  specialRequests?: string;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  bookingRooms?: (BookingRoom & {
    guests?: BookingGuest[];
    roomType?: { name: string };
    room?: { roomNumber: string };
  })[];
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
