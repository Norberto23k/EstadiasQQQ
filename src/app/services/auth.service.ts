import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { User } from '../interfaces/user.interface';
import { environment } from '../../environments/environment';

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  expiresIn?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'authToken';
  private readonly USER_DATA_KEY = 'userData';
  private readonly TOKEN_EXPIRATION_KEY = 'tokenExpiration';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.getToken();
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        const expirationTime = this.getTokenExpiration();
        if (expirationTime > 0) {
          this.autoLogout(expirationTime);
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.clearAuthData();
      }
    }
  }

  register(userData: any): Observable<boolean> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/register`, 
      userData,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap(response => {
        if (!response.success || !response.token) {
          throw new Error(response.message || 'Registration failed');
        }
        this.handleAuthResponse(response);
      }),
      map(() => true),
      catchError(error => this.handleAuthError(error, 'registro'))
    );
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/login`, 
      { email, password },
      { 
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true
      }
    ).pipe(
      tap(response => {
        if (!response.success || !response.token) {
          throw new Error(response.message || 'Authentication failed');
        }
        this.handleAuthResponse(response);
      }),
      map(() => true),
      catchError(error => {
        const errorMsg = error.error?.message || error.message || 'Error en el login';
        this.showToast(errorMsg, 'danger');
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (!response.token || !response.user || !response.expiresIn) {
      throw new Error('Invalid authentication response');
    }

    const expirationDate = new Date(
      new Date().getTime() + (response.expiresIn * 1000)
    );
    
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(response.user));
    localStorage.setItem(this.AUTH_TOKEN_KEY, response.token);
    localStorage.setItem(this.TOKEN_EXPIRATION_KEY, expirationDate.toISOString());
    
    this.currentUserSubject.next(response.user);
    this.autoLogout(response.expiresIn * 1000);
    this.showToast('Sesión iniciada correctamente', 'success');
  }

  private handleAuthError(error: HttpErrorResponse, context: string): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.status === 401) {
      errorMessage = 'Credenciales inválidas';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error en el ${context}: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || error.message;
    }
    
    this.showToast(errorMessage, 'danger');
    return throwError(() => new Error(errorMessage));
  }

  logout(): void {
    this.clearAuthData();
    this.showToast('Sesión cerrada', 'success');
    this.router.navigate(['/login']);
  }

  private clearAuthData(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRATION_KEY);
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  getTokenExpiration(): number {
    const expirationDate = localStorage.getItem(this.TOKEN_EXPIRATION_KEY);
    if (!expirationDate) return 0;
    
    return Math.max(new Date(expirationDate).getTime() - Date.now(), 0);
  }

  isLoggedIn(): boolean {
    return this.getTokenExpiration() > 0;
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
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
      this.showToast('Tu sesión ha expirado', 'warning');
    }, expirationDuration);
  }

  refreshUserData(updatedUser: User): void {
    this.currentUserSubject.next(updatedUser);
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(updatedUser));
  }

  private async showToast(
    message: string, 
    color: 'success' | 'danger' | 'warning' = 'success'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}