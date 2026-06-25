export interface Customer {
  id: string;
  hotelId: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  documentType?: string;
  documentNo?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
