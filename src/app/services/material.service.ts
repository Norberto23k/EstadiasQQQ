import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Material, Prestamo } from 'src/app/models/material.model';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private apiUrl = `${environment.apiUrl}/materials`;

  constructor(private http: HttpClient) {}

  getAllMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl);
  }

  getMaterialById(id: string): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/${id}`);
  }

  createMaterial(material: any): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, material);
  }

  getActiveLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/loans/active`);
  }

  updateMaterial(id: string, material: any): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}/${id}`, material);
  }

  deleteMaterial(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getMaterialByQR(code: string): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/qr/${code}`);
  }

  getAvailableMaterials(): Observable<Material[]> {
    return this.getAllMaterials().pipe(
      map(materials => materials.filter(m => m.estado === 'Disponible'))
    );
  }

  getCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/materials/categories`).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of(['Proyectores', 'Computadoras', 'Cámaras', 'Accesorios']);
      })
    );
  }

  getBorrowedMaterials(): Observable<Material[]> {
    return this.getAllMaterials().pipe(
      map(materials => materials.filter(m => m.estado === 'Ocupado'))
    );
  }

  returnMaterial(materialId: string): Observable<Material> {
    return this.http.patch<Material>(`${this.apiUrl}/${materialId}/devolver`, {
      estado: 'Disponible',
      fechaDevolucion: new Date().toISOString()
    });
  }

  updateLoanStatus(loanId: string, status: 'completado' | 'retrasado'): Observable<Prestamo> {
    return this.http.patch<Prestamo>(`${environment.apiUrl}/loans/${loanId}`, {
      estado: status,
      fechaDevolucion: status === 'completado' ? new Date().toISOString() : undefined
    });
  }
}
