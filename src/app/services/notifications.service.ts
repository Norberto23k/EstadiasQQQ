import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  getUserNotifications(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  sendToUser(userId: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/${userId}`, { message });
  }

  sendToAdmins(message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admins`, { message });
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {});
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'top',
      color,
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}
