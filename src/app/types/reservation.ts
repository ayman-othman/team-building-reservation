/**
 * Frontend Interfaces for Reservations Feature
 * Use these interfaces in your Angular application
 */

/**
 * Represents a single reservation returned from the API
 */
export interface Reservation {
  id: string;
  staffId: string;
  name: string;
  team: string;
  transportationType: 'Bus' | 'PrivateCar';
  wantSingleRoom: boolean;
  busReservationUrl: string | null;
  singleRoomReservationUrl: string | null;
  nationalIdUrls: string[];
  note?: string | null;
  createdAt: Date | string;
}

/**
 * Request payload for creating a reservation
 * Use FormData to send this (multipart/form-data)
 */
export interface CreateReservationRequest {
  staffId: string;
  name: string;
  team: string;
  transportationType: 'Bus' | 'PrivateCar';
  wantSingleRoom: boolean;
  busReservation?: File;
  singleRoomReservation?: File;
  nationalIds: File[];
}

/**
 * API Response for create/get operations
 */
export interface ReservationResponse {
  id: string;
  staffId: string;
  name: string;
  team: string;
  transportationType: 'Bus' | 'PrivateCar';
  wantSingleRoom: boolean;
  busReservationUrl: string | null;
  singleRoomReservationUrl: string | null;
  nationalIdUrls: string[];
  note?: string | null;
  createdAt: string; // ISO 8601 format
}

/**
 * API Response for listing reservations
 */
export type ReservationListResponse = ReservationResponse[];

/**
 * Query parameters for GET /reservations
 */
export interface ReservationQueryParams {
  staffId?: string;
}

/**
 * Error response from API
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

/**
 * Success response wrapper (optional)
 */
export interface ApiSuccessResponse<T> {
  statusCode: number;
  data: T;
  message?: string;
}
