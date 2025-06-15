import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'user-tabs',
    loadComponent: () => import('./tabs/user-tabs/user-tabs.page').then(m => m.UserTabsPage),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'qr',
        loadComponent: () => import('./pages/user/qr/qr.page').then(m => m.QrPage)
      },
      {
        path: 'categoriasu',
        loadComponent: () => import('./pages/user/categories/categories.page').then(m => m.CategoriesPage)
      },
      {
        path: 'profiles',
        loadComponent: () => import('./pages/user/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'qr',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'admin-tabs',
    loadComponent: () => import('./tabs/admin-tabs/admin-tabs.page').then(m => m.AdminTabsPage),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'in-use',
        loadComponent: () => import('./pages/admin/in-use/in-use.page').then(m => m.InUsePage)
      },
      {
        path: 'history',
        loadComponent: () => import('./pages/admin/history/history.page').then(m => m.HistoryPage)
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/admin/categories/categories.page').then(m => m.CategoriesPage)
      },
      
      {
        path: 'add-material',
        loadComponent: () => import('./pages/admin/add-material/add-material.page').then(m => m.AddMaterialPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/admin/profile/profile.page').then(m => m.ProfilePage)
      },
      
      {
        path: '',
        redirectTo: 'in-use',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
{
  path: 'material-detalle/:id',
  loadComponent: () => import('./pages/material-detalle/material-detalle.page').then(m => m.MaterialDetallePage),
  canActivate: [AuthGuard] // Opcional si requiere autenticación
},
  {
    path: 'modal-reserva',
    loadComponent: () => import('./pages/modal-reserva/modal-reserva.page').then( m => m.ModalReservaPage)
  },
  // Elimina las rutas duplicadas que ya están dentro de los tabs
];