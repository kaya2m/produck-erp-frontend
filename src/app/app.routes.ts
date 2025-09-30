import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/components/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },

  // Protected routes with layout
  {
    path: '',
    loadComponent: () => import('./layout/components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/components/dashboard.component').then(m => m.DashboardComponent),
        data: {
          breadcrumb: { label: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' }
        }
      },
      // CRM Routes
      {
        path: 'crm',
        data: {
          breadcrumb: { label: 'CRM' }
        },
        children: [
          {
            path: 'leads',
            loadComponent: () => import('./features/leads/components/leads.component').then(m => m.LeadsComponent),
            data: {
              breadcrumb: { label: 'Müşteri Adayları' }
            }
          },
          {
            path: 'opportunities',
            loadComponent: () => import('./features/opportunities/components/opportunities.component').then(m => m.OpportunitiesComponent),
            data: {
              breadcrumb: { label: 'Fırsatlar' }
            }
          },
          {
            path: 'accounts',
            loadComponent: () => import('./features/accounts/components/accounts.component').then(m => m.AccountsComponent),
            data: {
              breadcrumb: { label: 'Hesaplar' }
            }
          },
          {
            path: 'contacts',
            loadComponent: () => import('./features/contacts/components/contacts.component').then(m => m.ContactsComponent),
            data: {
              breadcrumb: { label: 'Kişiler' }
            }
          }
        ]
      },
      // Workflow Route
      {
        path: 'workflow',
        loadComponent: () => import('./features/workflow/components/workflow.component').then(m => m.WorkflowComponent),
        data: {
          breadcrumb: { label: 'İş Akışı' }
        }
      },
      // System Management Routes
      {
        path: 'system-management',
        loadChildren: () => import('./features/system-management/system-management.routes').then(m => m.systemManagementRoutes),
        data: {
          breadcrumb: { label: 'Sistem Yönetimi', url: '/system-management' }
        }
      },
      // General Settings Routes
      {
        path: 'settings',
        children: [
          {
            path: '',
            redirectTo: '/system-management',
            pathMatch: 'full'
          }
        ]
      }
    ]
  },

  // Unauthorized page
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // Fallback
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];