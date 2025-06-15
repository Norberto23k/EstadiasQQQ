import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonIcon, IonItem, IonLabel, IonAvatar, IonCard,
  ToastController, IonSpinner, IonButtons } from '@ionic/angular/standalone';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { logOutOutline, cameraOutline, createOutline } from 'ionicons/icons';
import { lastValueFrom } from 'rxjs';
import { EditProfileDialogComponent } from '../../../components/edit-profile-dialog/edit-profile-dialog.component';
import { MatDialog } from '@angular/material/dialog';

addIcons({
  'log-out-outline': logOutOutline,
  'camera-outline': cameraOutline,
  'create-outline': createOutline
});

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonButtons, 
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonItem, IonLabel, IonAvatar, IonCard,
    IonSpinner
  ]
})
export class ProfilePage implements OnInit {
  user: any = null;
  isLoading = true;
  isAdmin = false;
  profileImage: string | null = null;
  profileForm!: FormGroup;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private router: Router,
      private dialog: MatDialog
  ) {
      addIcons({logOutOutline,cameraOutline,createOutline});}

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    this.isLoading = true;
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.user = user;
        this.profileImage = user.imageUrl || null;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.showToast('Error al cargar perfil', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async changeProfileImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });
      
      if (image.dataUrl) {
        this.profileImage = image.dataUrl;
        if (this.user) {
          const updatedUser = { ...this.user, imageUrl: image.dataUrl };
          await lastValueFrom(this.profileService.updateProfile(updatedUser));
          this.authService.refreshUserData(updatedUser);
          this.showToast('Imagen actualizada', 'success');
        }
      }
    } catch (error) {
      console.error('Error changing image:', error);
      this.showToast('Error al cambiar imagen', 'danger');
    }
  }

  getAvatarInitials(name: string): string {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  }

    openEditDialog(): void {
    if (!this.user) return;

    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '450px',
      data: { ...this.user },
      panelClass: 'custom-dialog-container'
    });
  }

  logout() {
    this.authService.logout();
    this.showToast('Sesión cerrada', 'success');
    this.router.navigate(['/login']);
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