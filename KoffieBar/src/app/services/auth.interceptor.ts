import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth';

function tokenVerlopen(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    const claims = JSON.parse(atob(payload));
    return typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (!token || tokenVerlopen(token)) {
    if (token) {
      auth.uitloggen();
      void router.navigate(['/login']);
    }

    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.uitloggen();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
