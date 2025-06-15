import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
  IonButtons, IonBackButton, IonList, IonCard, IonItem,
  IonLabel, IonButton, IonSelect, IonSelectOption, IonSpinner,
  IonImg
} from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { MaterialService } from '../../../services/material.service';
import { Material } from 'src/app/models/material.model';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
    IonButtons, IonBackButton, IonList, IonCard, IonItem,
    IonLabel, IonButton, IonSelect, IonSelectOption, IonSpinner,
    IonImg
  ]
})
export class CategoriesPage implements OnInit {
  @ViewChild('selectEstado') selectEstado!: IonSelect;

  // Filtros
  filtroEstado = '';
  filtroCategoria = '';

  // Estados
  isLoading = true;
  errorMessage = '';

  // Datos
  allItems: Material[] = [];
  itemsFiltrados: Material[] = [];

  constructor(
    private materialService: MaterialService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
    this.route.queryParams.subscribe(params => {
      this.filtroCategoria = params['categoria'] || '';
      this.filtrarItems();
    });
  }

  async cargarDatos() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      const materiales = await lastValueFrom(this.materialService.getAllMaterials());
      this.allItems = materiales;
      this.filtrarItems();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.errorMessage = 'Error al cargar los materiales. Por favor intente nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  filtrarItems() {
    this.itemsFiltrados = this.allItems.filter(item => {
      const coincideCategoria = !this.filtroCategoria || 
        item.categoria.toLowerCase() === this.filtroCategoria.toLowerCase();
      const coincideEstado = !this.filtroEstado || 
        item.estado === this.filtroEstado;
      return coincideCategoria && coincideEstado;
    });
  }

  verDetalle(materialId: string) {
    this.router.navigate(['/material-detalle', materialId]);
  }

  abrirFiltro() {
    if (this.selectEstado) {
      this.selectEstado.open();
    }
  }

  getEstadoColor(estado: string): string {
    switch(estado) {
      case 'Disponible': return '#2dd36f';
      case 'Ocupado': return '#ffc409';
      case 'Reparación': return '#eb445a';
      default: return '#92949c';
    }
  }
}