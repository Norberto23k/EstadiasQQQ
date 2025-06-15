import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, ToastController, AlertController, IonSpinner } from '@ionic/angular/standalone';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { Router } from '@angular/router';
import { MaterialService } from 'src/app/services/material.service';
import { NotificationService } from 'src/app/services/notifications.service';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { qrCodeOutline, cameraOutline, checkmarkOutline } from 'ionicons/icons';

addIcons({ qrCodeOutline, cameraOutline });

@Component({
  selector: 'app-qr',
  templateUrl: './qr.page.html',
  styleUrls: ['./qr.page.scss'],
  standalone: true,
  imports: [IonSpinner, 
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, CommonModule
  ],
  providers: [BarcodeScanner]
})
export class QrPage {
  scannedData: any;
  isScanning = false;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private router: Router,
    private materialService: MaterialService,
    private toastController: ToastController,
    private alertCtrl: AlertController,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
      addIcons({cameraOutline,checkmarkOutline});}

  async scanQR() {
    this.isScanning = true;
    try {
      const result = await this.barcodeScanner.scan();
      if (!result.cancelled) {
        this.scannedData = result.text;
        this.handleScannedData(this.scannedData);
      }
    } catch (error) {
      this.showToast('Error al escanear el código QR', 'danger');
    } finally {
      this.isScanning = false;
    }
  }

  async handleScannedData(materialId: string) {
    try {
      const material = await this.materialService.getMaterialById(materialId).toPromise();
      if (!material) return this.showToast('Material no encontrado', 'warning');

      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return this.router.navigate(['/login']);

      // Cambiar el estado automáticamente
      const nuevoEstado = material.estado === 'Disponible' ? 'Ocupado' : 'Disponible';
      await this.materialService.updateMaterial(materialId, { estado: nuevoEstado }).toPromise();

      // Notificación para admin
      const mensaje = `El material '${material.nombre}' fue marcado como ${nuevoEstado.toLowerCase()} por ${currentUser.name}`;
      this.notificationService.sendToAdmins(mensaje).subscribe();

      // Toast y navegación a detalle
      this.showToast(`Material ${nuevoEstado}`, 'success');
      this.router.navigate(['/material-detalle', materialId]);
    } catch (error) {
      this.showToast('Error al procesar el QR', 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}