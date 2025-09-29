import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { toast } from 'ngx-sonner';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request';
          break;
        case 401:
          errorMessage = 'Authentication required';
          router.navigate(['/login']);
          break;
        case 403:
          errorMessage = 'Access denied';
          router.navigate(['/unauthorized']);
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation error';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        case 0:
          errorMessage = 'Network connection failed';
          break;
        default:
          errorMessage = error.error?.message || error.message || 'Unknown error';
      }

      // Show error toast notification
      toast.error(errorMessage);

      console.error('HTTP Error:', error);

      return throwError(() => error);
    })
  );
};