import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonItem, 
  IonIcon, 
  IonLabel,
  IonInput,
  IonCheckbox,
  IonToggle,
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
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonToggle,
    IonCheckbox,
    ReactiveFormsModule,
    IonLabel,
    IonInput, 
    IonIcon, 
    IonItem, 
    IonButton, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    CommonModule, 
    FormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  isAdmin = false;
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { 
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      matricula: ['', Validators.required],
      grupo: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terms: [false, Validators.requiredTrue]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleRole() {
    this.isAdmin = !this.isAdmin;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async register() {
    if (this.registerForm.invalid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos correctamente',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
      return;
    }

    if (!this.registerForm.value.terms) {
      const toast = await this.toastCtrl.create({
        message: 'Debes aceptar los términos y condiciones',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Registrando...'
    });
    await loading.present();

    try {
      const userData = {
        ...this.registerForm.value,
        role: this.isAdmin ? 'admin' : 'user',
        imageUrl: this.imagePreview as string,
        termsAccepted: this.registerForm.value.terms
      };

      const success = await lastValueFrom(this.authService.register(userData));
      if (success) {
        const route = this.isAdmin ? '/admin-tabs' : '/user-tabs';
        await this.router.navigate([route]);
        this.showToast('Registro exitoso', 'success');
      } else {
        throw new Error('Error en el registro');
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      const errorMessage = error.error?.message || 'Error en el registro';
      this.showToast(errorMessage, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  ngOnInit() {
  }
}