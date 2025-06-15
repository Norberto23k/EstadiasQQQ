import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonIcon, 
  IonItem, 
  IonLabel, 
  IonInput,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { lastValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { personAddOutline } from 'ionicons/icons';

addIcons({
  'person-add-outline': personAddOutline
});

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    IonLabel, 
    IonItem, 
    IonIcon, 
    IonButton,
    IonInput,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar
  ]
})
export class LoginPage {
  loginForm: FormGroup;
  showPassword = false;
  isAdminLogin = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { 
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async login() {
    if (!this.loginForm.valid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos correctamente',
        duration: 2000,
        position: 'top'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { email, password } = this.loginForm.value;
      const success = await lastValueFrom(this.authService.login(email, password));

      if (success) {
        const user = this.authService.getCurrentUser();
        
        if (!user) {
          throw new Error('No se pudo obtener la información del usuario');
        }

        switch (user.role) {
          case 'super-admin':
            await this.router.navigate(['/admin-dashboard']);
            break;
          case 'admin':
            await this.router.navigate(['/admin-tabs']);
            break;
          default:
            await this.router.navigate(['/user-tabs']);
            break;
        }
      } else {
        throw new Error('Credenciales incorrectas');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      
      const errorMessage = error.message.includes('Credenciales incorrectas') 
        ? 'Email o contraseña incorrectos' 
        : 'Error al iniciar sesión';

      const toast = await this.toastCtrl.create({
        message: errorMessage,
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleLoginMode() {
    this.isAdminLogin = !this.isAdminLogin;
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToAdminRegister() {
    this.router.navigate(['/admin-register']);
  }
}