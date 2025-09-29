import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.currentToken();

  // Skip authentication for auth-related endpoints
  const skipAuth = ['/auth/login', '/auth/refresh-token', '/auth/register'].some(
    url => req.url.includes(url)
  );

  if (!token || skipAuth) {
    return next(req);
  }

  // Clone request and add authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};