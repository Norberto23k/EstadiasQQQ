import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonLabel,
  IonItem, IonDatetimeButton, IonModal, IonDatetime, IonButton
} from '@ionic/angular/standalone';
import { MaterialService } from 'src/app/services/material.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoanService } from 'src/app/services/loan.service';
import { ReservationService } from 'src/app/services/reservation.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonLabel,
    IonItem, IonDatetimeButton, IonModal, IonDatetime, IonButton
  ]
})
export class HistoryPage implements OnInit {
  historial: any[] = [];
  fechaInicio: string = '';
  fechaFin: string = '';
  isLoading = true;

  constructor(
    private loanService: LoanService,
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.cargarHistorial();
  }

  async cargarHistorial() {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();
    if (!user) return;

    try {
      const [prestamos, reservas] = await Promise.all([
        lastValueFrom(this.loanService.getLoansByUser(user.id)),
        lastValueFrom(this.reservationService.getReservationsByUser(user.id))
      ]);

      this.historial = [
        ...(prestamos || []).map((p: any) => ({ tipo: 'Préstamo', ...p })),
        ...(reservas || []).map((r: any) => ({ tipo: 'Reserva', ...r }))
      ];

      this.historial = this.filtrarPorFechas(this.historial);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      this.isLoading = false;
    }
  }

  filtrarPorFechas(registros: any[]): any[] {
    if (!this.fechaInicio && !this.fechaFin) return registros;
    
    const inicio = this.fechaInicio ? new Date(this.fechaInicio) : null;
    const fin = this.fechaFin ? new Date(this.fechaFin) : null;

    return registros.filter(r => {
      const fecha = new Date(r.fechaPrestamo || r.fechaSolicitud);
      return (!inicio || fecha >= inicio) && (!fin || fecha <= fin);
    });
  }

  buscar() {
    this.cargarHistorial();
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getEstadoColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'aprobado': case 'completado': return 'success';
      case 'rechazado': return 'danger';
      case 'pendiente': return 'warning';
      default: return 'medium';
    }
  }
}