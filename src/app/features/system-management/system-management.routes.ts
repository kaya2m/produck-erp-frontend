import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const systemManagementRoutes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [authGuard],
    data: {
      title: 'Kullanıcı Yönetimi',
      permissions: ['user_management'],
      breadcrumb: { label: 'Kullanıcı Yönetimi' }
    }
  },
  {
    path: 'roles',
    loadComponent: () => import('./pages/role-management/role-management.component').then(m => m.RoleManagementComponent),
    canActivate: [authGuard],
    data: {
      title: 'Rol Yönetimi',
      permissions: ['role_management'],
      breadcrumb: { label: 'Rol Yönetimi' }
    }
  },
  {
    path: 'security',
    loadComponent: () => import('./pages/security-dashboard/security-dashboard.component').then(m => m.SecurityDashboardComponent),
    canActivate: [authGuard],
    data: {
      title: 'Güvenlik Yönetimi',
      permissions: ['security_management'],
      breadcrumb: { label: 'Güvenlik Yönetimi' }
    }
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/system-settings/system-settings.component').then(m => m.SystemSettingsComponent),
    canActivate: [authGuard],
    data: {
      title: 'Sistem Ayarları',
      permissions: ['system_settings'],
      breadcrumb: { label: 'Sistem Ayarları' }
    }
  }
];