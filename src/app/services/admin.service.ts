import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReservationResponse } from '../types/reservation';
import { environment } from '../../environment/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/reservations`;

  /**
   * Get all reservations
   */
  getAllReservations() {
    return this.http.get<ReservationResponse[]>(this.API_URL);
  }

  /**
   * Get reservations filtered by staffId
   */
  getReservationsByStaffId(staffId: string) {
    return this.http.get<ReservationResponse[]>(this.API_URL, {
      params: { staffId },
    });
  }

  /**
   * Export reservations to Excel
   */
  exportToExcel() {
    return this.http.get(`${this.API_URL}/export/excel`, {
      responseType: 'blob',
    });
  }
}
