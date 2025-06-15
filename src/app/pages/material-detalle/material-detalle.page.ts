import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton,
  IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonLabel, IonItem, IonButton, IonIcon,
  AlertController, ToastController, IonSpinner, IonAvatar } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from '../../services/material.service';
import { UserService } from '../../services/user.service';
import { Material } from 'src/app/models/material.model';
import { Loan } from 'src/app/interfaces/loan.interface';
import { lastValueFrom, Observable } from 'rxjs';

@Component({
  selector: 'app-material-detalle',
  templateUrl: './material-detalle.page.html',
  styleUrls: ['./material-detalle.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonSpinner, 
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton,
    IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonLabel, IonItem, IonButton, IonIcon
  ]
})
export class MaterialDetallePage implements OnInit {
  material: Material | null = null;
  currentLoan: Loan | null = null;
  loading = true;
  puedeReservar = false;
  usuarioPrestamo: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private userService: UserService,
    private toastController: ToastController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    const materialId = this.route.snapshot.paramMap.get('id');
    if (materialId) {
      await this.cargarDetalleMaterial(materialId);
    } else {
      await this.router.navigate(['/categorias']);
    }
  }

  async cargarDetalleMaterial(materialId: string) {
    try {
      this.material = await lastValueFrom(this.materialService.getMaterialById(materialId));
      
      if (this.material?.estado === 'Ocupado') {
        const loans = await lastValueFrom(
          this.materialService.getActiveLoans() as Observable<Loan[]>
        );
        
        this.currentLoan = loans.find(loan => 
          loan.materialId === materialId && loan.status === 'active'
        ) || null;

        if (this.currentLoan) {
          this.usuarioPrestamo = await lastValueFrom(
            this.userService.getUserById(this.currentLoan.userId)
          );
        }
      }

      this.puedeReservar = this.material?.estado === 'Disponible';
    } catch (error) {
      console.error('Error loading material details:', error);
      this.showToast('Error loading material details', 'danger');
      this.router.navigate(['/categorias']);
    } finally {
      this.loading = false;
    }
  }

  reservarMaterial() {
    // Implement reservation logic here
  }

  formatearFecha(fecha: string | Date): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString();
  }

  async verQR() {
    if (!this.material) return;
    
    const alert = await this.alertCtrl.create({
      header: 'Material QR Code',
      message: `
        <div style="text-align: center;">
          <p>Scan this code to manage the material</p>
          <img src="${this.material.codigoQR}" alt="QR Code" style="width: 200px; height: 200px; margin: auto; display: block;">
          <p><strong>${this.material.nombre}</strong></p>
        </div>
      `,
      buttons: ['Close']
    });
    await alert.present();
  }

  async marcarComoUsado() {
    if (!this.material) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirm usage',
      message: 'Are you sure you want to mark this material as in use?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Confirm',
          handler: async () => {
            try {
              await lastValueFrom(
                this.materialService.updateMaterial(this.material!.id, { estado: 'Ocupado' })
              );
              this.material!.estado = 'Ocupado';
              this.showToast('Material marked as in use', 'success');
            } catch (err) {
              this.showToast('Error updating status', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  getEstadoColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'disponible': return 'success';
      case 'ocupado': return 'danger';
      case 'reparación': return 'warning';
      case 'pendiente': return 'tertiary';
      default: return 'medium';
    }
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}