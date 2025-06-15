export interface Material {
  id: string;
  nombre: string;
  descripcion: string;
  modelo: string;
  codigoSerie: string;
  codigoQR: string;
  imagenes: string[];
  estado: 'Disponible' | 'Ocupado' | 'Reparación' | 'Reservado';
  categoria: string;
  fechaRegistro: string;
  ubicacion?: string;
  especificacionesTecnicas?: Record<string, string>;
  historialPrestamos?: Prestamo[];
  mantenimientos?: Mantenimiento[];
}

export interface Prestamo {
  id?: string;
  userId: string;
  materialId: string;
  fechaPrestamo: string;
  fechaDevolucion?: string;
  estado: 'activo' | 'completado' | 'retrasado';
  notas?: string;
  userName?: string;
  userMatricule?: string;
  materialNombre?: string;
}

interface Mantenimiento {
  fecha: string;
  tipo: 'preventivo' | 'correctivo';
  descripcion: string;
  tecnico: string;
}