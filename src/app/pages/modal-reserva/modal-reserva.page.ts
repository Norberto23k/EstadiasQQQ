import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton, IonContent, IonHeader, IonTitle, IonToolbar,
  ModalController, ToastController, IonButtons, IonIcon, IonCard,
  IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonChip, IonItem, IonLabel, IonSpinner
} from '@ionic/angular/standalone';
import { MaterialService } from 'src/app/services/material.service';
import { AuthService } from 'src/app/services/auth.service';
import { ReservationService } from 'src/app/services/reservation.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-modal-reserva',
  templateUrl: './modal-reserva.page.html',
  styleUrls: ['./modal-reserva.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonButton, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonIcon, IonCard, IonCardHeader, IonCardSubtitle,
    IonCardTitle, IonCardContent, IonChip, IonItem, IonLabel,IonSpinner
  ]
})
export class ModalReservaPage implements OnInit {
  @Input() material: any;
  availableHours: number[] = [];
  selectedHours: number[] = [];
  bookedHours: number[] = [];
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private reservationService: ReservationService,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.generateAvailableHours();
    this.loadBookedHours();
  }

  generateAvailableHours() {
    this.availableHours = Array.from({ length: 13 }, (_, i) => i + 8); // 8AM to 8PM
  }

  async loadBookedHours() {
    this.isLoading = true;
    try {
      const reservations = await lastValueFrom(
        this.reservationService.getAllReservations()
      );
      this.bookedHours = reservations
        .filter((r: any) => r.materialId === this.material.id)
        .map((r: any) => new Date(r.fechaInicio).getHours());
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      this.isLoading = false;
    }
  }

  toggleHourSelection(hour: number) {
    if (this.isHourBooked(hour)) return;

    const index = this.selectedHours.indexOf(hour);
    if (index > -1) {
      this.selectedHours.splice(index, 1);
    } else {
      this.selectedHours.push(hour);
    }
    this.selectedHours.sort((a, b) => a - b);
  }

  get hasBookedHours(): boolean {
  return this.selectedHours.some(hour => this.bookedHours.includes(hour));
}

  isHourBooked(hour: number): boolean {
    return this.bookedHours.includes(hour);
  }

  isHourSelected(hour: number): boolean {
    return this.selectedHours.includes(hour);
  }

  async confirmar() {
    if (this.selectedHours.length === 0) {
      this.showToast('Selecciona al menos una hora', 'warning');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.showToast('Debes iniciar sesión', 'danger');
      return;
    }

    const startHour = Math.min(...this.selectedHours);
    const endHour = Math.max(...this.selectedHours) + 1;

    const reservationData = {
      userId: user.id,
      materialId: this.material.id,
      fechaInicio: new Date().setHours(startHour, 0, 0, 0),
      fechaFin: new Date().setHours(endHour, 0, 0, 0),
      estado: 'Pendiente'
    };

    try {
      await lastValueFrom(
        this.reservationService.createReservation(reservationData)
      );
      this.showToast('Reserva solicitada', 'success');
      this.modalCtrl.dismiss({ success: true });
    } catch (error) {
      console.error('Error creating reservation:', error);
      this.showToast('Error al reservar', 'danger');
    }
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}