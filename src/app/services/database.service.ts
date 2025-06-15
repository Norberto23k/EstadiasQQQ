// src/app/services/database.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  /** Subject reactivo con la lista de usuarios */
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  /** Endpoint base del backend */
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  /* ------------------ CRUD Usuarios ------------------ */

  /** Obtener todos los usuarios desde el backend */
  private loadInitialData(): void {
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: users => this.usersSubject.next(users),
      error: err => console.error('[DB] Error cargando usuarios:', err)
    });
  }

  /** Actualizar un usuario y refrescar el subject */
  updateUser(updatedUser: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${updatedUser.id}`, updatedUser).pipe(
      tap(user => {
        const list = this.usersSubject
          .value
          .map(u => (u.id=== user.id ? user : u));
        this.usersSubject.next(list);
      })
    );
  }

  /** Crear un usuario */
  createUser(newUser: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, newUser).pipe(
      tap(user => this.usersSubject.next([...this.usersSubject.value, user]))
    );
  }

  /** Eliminar un usuario */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const list = this.usersSubject.value.filter(u => u.id !== id);
        this.usersSubject.next(list);
      })
    );
  }
}
