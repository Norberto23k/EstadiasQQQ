import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData).pipe(
      tap(updatedUser => {
        const current = this.currentUserSubject.value;
        if (current && current.id === id) {
          this.currentUserSubject.next({ ...current, ...updatedUser });
        }
      }),
      catchError(error => {
        console.error('Error updating user', error);
        return of(error.error);
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAdmins(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?role=admin`);
  }

  promoteToAdmin(id: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/promote`, { role: 'admin' });
  }

  demoteAdmin(id: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/demote`, { role: 'user' });
  }

  setCurrentUser(user: User) {
    this.currentUserSubject.next(user);
  }

  clearCurrentUser() {
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
