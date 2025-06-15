import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    // Clonar la solicitud y agregar el token si existe
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores 401 (No autorizado)
        if (error.status === 401 && !request.url.includes('/auth')) {
          this.handleUnauthorizedError();
        }
        
        // Puedes agregar más manejo de errores aquí según necesites
        // Por ejemplo, para errores 403 (Prohibido)
        // else if (error.status === 403) {...}

        // Propagar el error
        return throwError(() => error);
      })
    );
  }

  private handleUnauthorizedError(): void {
    this.authService.logout(); // Evita doble navegación
    this.router.navigate(['/login'], { 
      queryParams: { sessionExpired: true } 
    });
    this.showToast('Tu sesión ha expirado; inicia sesión nuevamente', 'warning');
  }

  private async showToast(
    message: string, 
    color: 'danger' | 'warning' | 'success' = 'danger'
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