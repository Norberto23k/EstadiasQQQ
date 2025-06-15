import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { ToastController } from '@ionic/angular/standalone';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private toastCtrl = inject(ToastController);
  private apiUrl = environment.apiUrl;

  /** Obtener todos los administradores */
  getAdmins(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/admins`).pipe(
      catchError(err => this.handleError('Error al obtener administradores', err))
    );
  }

  /** Actualizar datos de un administrador */
  updateAdmin(admin: User): Observable<User> {
    return this.http
      .put<User>(`${this.apiUrl}/users/${admin.id}`, admin)
      .pipe(catchError(err => this.handleError('Error al actualizar admin', err)));
  }

  /** Promover usuario a administrador */
  promoteToAdmin(user: User): Observable<User> {
    return this.http
      .put<User>(`${this.apiUrl}/users/${user.id}/promote`, {})
      .pipe(catchError(err => this.handleError('Error al promover a admin', err)));
  }

  /** Degradar administrador a usuario normal */
  demoteAdmin(userId: string): Observable<User> {
    return this.http
      .put<User>(`${this.apiUrl}/users/${userId}/demote`, {})
      .pipe(catchError(err => this.handleError('Error al degradar admin', err)));
  }

  /** Crear usuario (solo admins) */
  createUser(user: Omit<User, '_id'>): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/users`, user)
      .pipe(catchError(err => this.handleError('Error al crear usuario', err)));
  }

  /* ----------------------- Helpers ----------------------- */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, position: 'bottom', color });
    await toast.present();
  }

  private handleError(msg: string, err: any) {
    this.showToast(msg, 'danger');
    return throwError(() => err);
  }
}
