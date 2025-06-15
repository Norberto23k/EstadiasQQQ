import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../interfaces/user.interface';
import { AuthService } from './auth.service';
import { ToastController } from '@ionic/angular/standalone';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private apiUrl = environment.apiUrl;

  private currentProfileSubject = new BehaviorSubject<User | null>(null);
  public currentProfile$ = this.currentProfileSubject.asObservable();

  getCurrentProfile(): Observable<User | null> {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return new Observable(subscriber => subscriber.next(null));

    return this.http.get<User>(`${this.apiUrl}/users/${userId}`).pipe(
      tap(profile => this.currentProfileSubject.next(profile)),
      catchError(error => {
        this.showToast('Error al cargar el perfil', 'danger');
        throw error;
      })
    );
  }

  updateProfile(userData: Partial<User> | FormData): Observable<User> {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) throw new Error('No user logged in');

    const url = `${this.apiUrl}/users/${userId}`;
    const request = userData instanceof FormData
      ? this.http.put<User>(url, userData)
      : this.http.put<User>(url, userData);

    return request.pipe(
      tap(updated => {
        this.currentProfileSubject.next(updated);
        this.authService.refreshUserData(updated);
        this.showToast('Perfil actualizado correctamente', 'success');
      }),
      catchError(error => {
        this.showToast('Error al actualizar el perfil', 'danger');
        throw error;
      })
    );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<void> {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) throw new Error('No user logged in');

    return this.http.put<void>(`${this.apiUrl}/users/${userId}/password`, {
      currentPassword,
      newPassword
    }).pipe(
      tap(() => this.showToast('Contraseña actualizada correctamente', 'success')),
      catchError(error => {
        const message = error.error?.message || 'Error al actualizar la contraseña';
        this.showToast(message, 'danger');
        throw error;
      })
    );
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
