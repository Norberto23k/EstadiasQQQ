export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'super-admin';
  matricule?: string;
  group?: string;
  termsAccepted?: boolean;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  status?: 'active' | 'inactive' | 'suspended';
  notificationsEnabled?: boolean;
  phone?: string;
}