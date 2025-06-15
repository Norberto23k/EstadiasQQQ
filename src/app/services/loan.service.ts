import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private apiUrl = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) {}

  getAllLoans(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createLoan(loanData: any): Observable<any> {
    return this.http.post(this.apiUrl, loanData);
  }

  returnLoan(loanId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${loanId}/return`, {});
  }

  getLoansByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  getActiveLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?status=active`);
  }

  getCompletedLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?status=completed`);
  }
}
