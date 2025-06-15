import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
  IonButtons, IonIcon, IonInput, IonItem, IonLabel, 
  IonList, IonSelect, IonSelectOption, IonTextarea, 
  IonFooter, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { register } from 'swiper/element/bundle';
import { SwiperContainer } from 'swiper/element';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MaterialService } from '../../../services/material.service';
import { Material } from '../../../models/material.model';
import { lastValueFrom } from 'rxjs';

register();

@Component({
  selector: 'app-add-material',
  templateUrl: './add-material.page.html',
  styleUrls: ['./add-material.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonButtons, IonIcon, IonInput, IonItem, IonLabel,
    IonList, IonSelect, IonSelectOption, IonTextarea,
    IonFooter, IonSpinner
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddMaterialPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('materialForm') materialForm!: NgForm;
  @ViewChild('nombreInput') nombreInput!: IonInput;
  @ViewChild('swiperContainer') swiperContainer!: ElementRef<SwiperContainer>;

  selectedMaterial: Partial<Material> = this.createNewMaterial();
  categorias: string[] = [];
  estados: string[] = ['Disponible', 'Ocupado', 'Reparación'];
  isSaving: boolean = false;

  constructor(
    private materialService: MaterialService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.loadInitialData();
    setTimeout(() => {
      this.nombreInput.setFocus();
    }, 300);
  }

  ngAfterViewInit() {
    this.initializeSwiper();
  }

  private initializeSwiper() {
    if (this.swiperContainer?.nativeElement) {
      Object.assign(this.swiperContainer.nativeElement, {
        slidesPerView: 1,
        spaceBetween: 10,
        pagination: { clickable: true },
        navigation: true
      });
      this.swiperContainer.nativeElement.initialize();
    }
  }

  async loadInitialData() {
    try {
      const categorias = await lastValueFrom(this.materialService.getCategorias());
      this.categorias = categorias || ['Proyectores', 'Computadoras', 'Cámaras', 'Accesorios'];
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.categorias = ['Proyectores', 'Computadoras', 'Cámaras', 'Accesorios'];
      this.showToast('Error loading categories', 'danger');
    }
  }

  createNewMaterial(): Partial<Material> {
    return {
      nombre: '',
      descripcion: '',
      imagenes: ['assets/imgs/default-item.jpg'],
      estado: 'Disponible',
      categoria: this.categorias[0] || 'Accesorios',
      modelo: '',
      codigoSerie: '',
      codigoQR: ''
    };
  }

  async loadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (!files || files.length === 0) return;

    if (this.selectedMaterial.imagenes && 
        this.selectedMaterial.imagenes.length + files.length > 5) {
      this.showToast('Maximum 5 images allowed', 'warning');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = () => {
        if (!this.selectedMaterial.imagenes) {
          this.selectedMaterial.imagenes = [];
        }

        if (this.selectedMaterial.imagenes.length === 1 && 
            this.selectedMaterial.imagenes[0] === 'assets/imgs/default-item.jpg') {
          this.selectedMaterial.imagenes = [reader.result as string];
        } else {
          this.selectedMaterial.imagenes = [...this.selectedMaterial.imagenes, reader.result as string];
        }
        
        setTimeout(() => this.initializeSwiper(), 100);
      };
      reader.readAsDataURL(file);
    }
    
    input.value = '';
  }

  removeImage(index: number) {
    if (this.selectedMaterial.imagenes) {
      this.selectedMaterial.imagenes.splice(index, 1);
      if (this.selectedMaterial.imagenes.length === 0) {
        this.selectedMaterial.imagenes = ['assets/imgs/default-item.jpg'];
      }
      setTimeout(() => this.initializeSwiper(), 100);
    }
  }

  changeStatus(status: 'Disponible' | 'Ocupado' | 'Reparación') {
    this.selectedMaterial.estado = status;
    this.showStatusToast(status);
  }

  private async showStatusToast(status: string) {
    const messages: Record<string, string> = {
      'Disponible': 'Material is available for use',
      'Ocupado': 'Material is currently in use',
      'Reparación': 'Material is under maintenance'
    };
    this.showToast(messages[status], 'success');
  }

  isFormValid(): boolean {
    return !!this.selectedMaterial.nombre?.trim() && 
           !!this.selectedMaterial.categoria &&
           !!this.selectedMaterial.estado;
  }

  async saveMaterial() {
    if (this.isSaving || !this.isFormValid()) return;
    
    this.isSaving = true;
    
    try {
      await lastValueFrom(this.materialService.createMaterial(this.selectedMaterial as Material));
      this.showToast('Material saved successfully', 'success');
      this.resetForm();
    } catch (error) {
      console.error('Error saving material:', error);
      this.showToast('Error saving material', 'danger');
    } finally {
      this.isSaving = false;
    }
  }

  resetForm() {
    this.selectedMaterial = this.createNewMaterial();
    this.materialForm?.resetForm();
    setTimeout(() => this.nombreInput?.setFocus(), 300);
  }

  cancel() {
    this.resetForm();
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