import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButton, IonButtons, IonIcon, IonDatetime,
  IonDatetimeButton, IonModal, IonItem, IonLabel,
  IonSelect, IonSelectOption, IonTextarea
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-loan-modal',
  templateUrl: './loan-modal.component.html',
  styleUrls: ['./loan-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonIcon, IonDatetime,
    IonDatetimeButton, IonModal, IonItem, IonLabel,
    IonSelect, IonSelectOption, IonTextarea
  ]
})
export class LoanModalComponent {
  @Input() material: any;
  @Input() userId: string = '';

  loanData = {
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas por defecto
    purpose: '',
    notes: ''
  };

  constructor(private modalCtrl: ModalController) {
    addIcons({ closeOutline, checkmarkOutline });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  confirm() {
    this.modalCtrl.dismiss({
      success: true,
      endDate: this.loanData.endDate,
      purpose: this.loanData.purpose,
      notes: this.loanData.notes
    });
  }

  getMinDate(): string {
    return new Date().toISOString();
  }

  getMaxDate(): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7); // Máximo 7 días
    return maxDate.toISOString();
  }
}