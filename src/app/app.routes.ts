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
        loadComponent: () => import('./features/dashboard/components/dashboard.component').then(m => m.DashboardComponent)
      },
      // CRM Routes
      {
        path: 'crm',
        children: [
          {
            path: 'leads',
            loadComponent: () => import('./features/leads/components/leads.component').then(m => m.LeadsComponent)
          },
          {
            path: 'opportunities',
            loadComponent: () => import('./features/opportunities/components/opportunities.component').then(m => m.OpportunitiesComponent)
          },
          {
            path: 'accounts',
            loadComponent: () => import('./features/accounts/components/accounts.component').then(m => m.AccountsComponent)
          },
          {
            path: 'contacts',
            loadComponent: () => import('./features/contacts/components/contacts.component').then(m => m.ContactsComponent)
          }
        ]
      },
      // Workflow Route
      {
        path: 'workflow',
        loadComponent: () => import('./features/workflow/components/workflow.component').then(m => m.WorkflowComponent)
      },
      // Settings Routes
      {
        path: 'settings',
        children: [
          {
            path: 'users',
            loadComponent: () => import('./features/security/components/users.component').then(m => m.UsersComponent)
          },
          {
            path: 'security',
            loadComponent: () => import('./features/security/components/security.component').then(m => m.SecurityComponent)
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