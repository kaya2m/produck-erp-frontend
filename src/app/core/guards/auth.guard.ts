import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page with return url
  return router.parseUrl('/login');
};

// TODO: Implement when backend adds role/permission support
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.parseUrl('/login');
    }

    // TODO: Implement role checking when backend supports it
    // For now, just check if user is authenticated
    return true;

    // Redirect to unauthorized page
    // return router.parseUrl('/unauthorized');
  };
};

export const permissionGuard = (requiredPermissions: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.parseUrl('/login');
    }

    // TODO: Implement permission checking when backend supports it
    // For now, just check if user is authenticated
    return true;

    // Redirect to unauthorized page
    // return router.parseUrl('/unauthorized');
  };
};