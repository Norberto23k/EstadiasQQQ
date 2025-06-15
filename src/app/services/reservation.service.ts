import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  getAllReservations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createReservation(reservationData: any): Observable<any> {
    return this.http.post(this.apiUrl, reservationData);
  }

  approveReservation(reservationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/approve`, {});
  }

  rejectReservation(reservationId: string, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/reject`, { reason });
  }

  getReservationsByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  getPendingReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?status=Pendiente`);
  }

  deleteReservation(reservationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reservationId}`);
  }

  markAsCompleted(reservationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/complete`, {});
  }
}
