import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonItem,
  IonLabel, IonRefresher, IonRefresherContent, IonList,
  IonSpinner, IonThumbnail, IonButton, IonIcon, IonBadge,
  IonItemSliding, IonItemOption, IonItemOptions, IonAlert
} from '@ionic/angular/standalone';
import { MaterialService } from 'src/app/services/material.service';
import { Router } from '@angular/router';
import { Material, Prestamo } from 'src/app/models/material.model';
import { lastValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  warningOutline, refreshOutline, cubeOutline,
  arrowUndoOutline, alertCircleOutline, checkmarkOutline
} from 'ionicons/icons';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-in-use',
  templateUrl: './in-use.page.html',
  styleUrls: ['./in-use.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonItem,
    IonLabel, IonRefresher, IonRefresherContent, IonList,
    IonSpinner, IonThumbnail, IonButton, IonIcon, IonBadge,
    IonItemSliding, IonItemOption, IonItemOptions, IonAlert,
  ]
})
export class InUsePage implements OnInit {
  materiales: Material[] = [];
  isLoading = true;
  error = '';
  materialParaDevolver: Material | null = null;

  constructor(
    private materialService: MaterialService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({
      warningOutline, refreshOutline, cubeOutline,
      arrowUndoOutline, alertCircleOutline, checkmarkOutline
    });
  }

  async ngOnInit() {
    await this.loadMaterialsInUse();
  }

  async loadMaterialsInUse() {
    this.isLoading = true;
    this.error = '';
    try {
      const response = await lastValueFrom(
        this.materialService.getBorrowedMaterials()
      );
      this.materiales = response;
    } catch (err) {
      console.error('Error loading materials:', err);
      this.error = 'Error al cargar los materiales. Por favor, inténtalo de nuevo.';
      this.materiales = [];
    } finally {
      this.isLoading = false;
    }
  }

  getActiveLoan(material: Material): Prestamo | undefined {
    return material.historialPrestamos?.find(p => p.estado === 'activo');
  }

  async refresh(event: any) {
    await this.loadMaterialsInUse();
    event.target.complete();
  }

  viewDetail(materialId: string) {
    this.router.navigate(['/admin/material-detail', materialId]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Disponible': return 'success';
      case 'Ocupado': return 'danger';
      case 'Reparación': return 'warning';
      case 'Reservado': return 'primary';
      default: return 'medium';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async initiateReturn(material: Material) {
    const alert = await this.alertController.create({
      header: 'Confirmar devolución',
      message: `¿Estás seguro de que quieres devolver ${material.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Devolver',
          handler: () => this.confirmReturn(material)
        }
      ]
    });

    await alert.present();
  }

  async confirmReturn(material: Material) {
    try {
      await lastValueFrom(
        this.materialService.returnMaterial(material.id)
      );
      
      const materialIndex = this.materiales.findIndex(m => m.id === material.id);
      if (materialIndex !== -1) {
        this.materiales[materialIndex].estado = 'Disponible';
        const activeLoan = this.getActiveLoan(this.materiales[materialIndex]);
        if (activeLoan && activeLoan.id) {
          activeLoan.estado = 'completado';
          activeLoan.fechaDevolucion = new Date().toISOString();
          
          await lastValueFrom(
            this.materialService.updateLoanStatus(activeLoan.id, 'completado')
          );
        }
      }

      const successAlert = await this.alertController.create({
        header: 'Devolución exitosa',
        message: `${material.nombre} ha sido devuelto correctamente.`,
        buttons: ['OK']
      });
      await successAlert.present();

    } catch (error) {
      console.error('Error al devolver el material:', error);
      const errorAlert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo completar la devolución. Por favor, inténtalo de nuevo.',
        buttons: ['OK']
      });
      await errorAlert.present();
    }
  }

  reportProblem(material: Material) {
    this.router.navigate(['/admin/report-problem', material.id], {
      state: { material }
    });
  }

  trackByMaterialId(index: number, material: Material): string {
    return material.id;
  }
}