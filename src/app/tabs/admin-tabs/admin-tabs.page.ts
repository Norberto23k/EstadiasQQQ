import { Component, inject } from '@angular/core';
import { 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { personAddOutline } from 'ionicons/icons';

interface Categoria {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-admin-tabs',
  templateUrl: './admin-tabs.page.html',
  styleUrls: ['./admin-tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
  IonLabel
  ]
})
export class AdminTabsPage {
  categorias: Categoria[] = [];
  private apiUrl = 'http://localhost:3000';

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private http: HttpClient
  ) {
    this.obtenerCategorias();
  }

  obtenerCategorias() {
    this.http.get<Categoria[]>(`${this.apiUrl}/categorias`).subscribe({
      next: (data) => {
        this.categorias = Array.isArray(data) ? data : this.getDefaultCategorias();
      },
      error: (err) => {
        console.error('Error al obtener categorías:', err);
        this.categorias = this.getDefaultCategorias();
      }
    });
  }

  private getDefaultCategorias(): Categoria[] {
    return [
      {id: 1, nombre: 'Proyectores'},
      {id: 2, nombre: 'Componentes Electronicos'},
      {id: 3, nombre: 'Herramientas'},
      {id: 4, nombre: 'Accesorios'},
      {id: 5, nombre: 'Materiales Elecricos'},
      {id: 6, nombre: 'Instumentos de medicion'}
    ];
  }

  async abrirFiltroCategorias() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Filtrar por Categoría',
      buttons: [
        ...this.categorias.map(categoria => ({
          text: categoria.nombre,
          handler: () => {
            this.router.navigate(['/admin-tabs/categories'], {
              queryParams: { categoria: categoria.nombre.toLowerCase() }
            });
          }
        })),
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }
}