import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { User } from '../interfaces/user.interface';
import { environment } from '../../environments/environment';

interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const userData = localStorage.getItem('userData');
    const token = this.getToken();
    
    if (token && userData) {
      const user = JSON.parse(userData);
      this.currentUserSubject.next(user);
      this.autoLogout(this.getTokenExpiration());
    }
  }

  register(userData: any): Observable<boolean> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData).pipe(
      tap(response => {
        this.handleAuthentication(
          response.user,
          response.token,
          response.expiresIn
        );
      }),
      map(() => true),
      catchError(error => {
        this.showToast('Error en el registro: ' + error.error.message, 'danger');
        return of(false);
      })
    );
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        this.handleAuthentication(
          response.user,
          response.token,
          response.expiresIn
        );
      }),
      map(() => true),
      catchError(error => {
        this.showToast('Error en el login: ' + error.error.message, 'danger');
        return of(false);
      })
    );
  }

  private handleAuthentication(user: User, token: string, expiresIn: number): void {
    const expirationDate = new Date(
      new Date().getTime() + expiresIn * 1000
    ).toISOString();

    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenExpiration', expirationDate);
    
    this.currentUserSubject.next(user);
    this.autoLogout(expiresIn * 1000);
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getTokenExpiration(): number {
    const expirationDate = localStorage.getItem('tokenExpiration');
    if (!expirationDate) return 0;
    
    const remainingTime = new Date(expirationDate).getTime() - new Date().getTime();
    return remainingTime > 0 ? remainingTime : 0;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const expirationTime = this.getTokenExpiration();
    return expirationTime > 0;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin' || user?.role === 'super-admin';
  }

  isSuperAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'super-admin';
  }

  private autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
      this.showToast('Tu sesión ha expirado', 'warning');
    }, expirationDuration);
  }

refreshUserData(updatedUser: User): void {
  this.currentUserSubject.next(updatedUser);
  localStorage.setItem('userData', JSON.stringify(updatedUser));
}


  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}