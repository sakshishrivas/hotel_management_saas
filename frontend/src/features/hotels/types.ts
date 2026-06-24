export interface Hotel {
  id: string;
  hotelCode: string;
  name: string;
  legalName?: string;
  taxRegistrationNo?: string;
  currencyCode: string;
  timezone: string;
  phone?: string;
  email?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode: string;
  isActive: boolean;
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
