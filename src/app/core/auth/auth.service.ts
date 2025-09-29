import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, map, tap, catchError, of } from 'rxjs';
import { environment } from '@env/environment';

export interface User {
  id: string;
  username: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdDate: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly userKey = 'user_data';

  // Signals for reactive state
  private userSignal = signal<User | null>(this.getUserFromStorage());
  private tokenSignal = signal<string | null>(this.getTokenFromStorage());

  // Computed signals
  readonly user = this.userSignal.asReadonly();
  readonly currentToken = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal() && !!this.userSignal());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize signals from localStorage
    this.initializeFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Login failed:', error);
          throw error;
        })
      );
  }


  logout(): void {
    // Send logout request to server (requires Authorization header)
    this.http.post(`${environment.apiUrl}/auth/logout`, {})
      .subscribe({
        complete: () => {
          this.clearAuthData();
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.warn('Logout request failed:', error);
          // Still clear local data even if logout request fails
          this.clearAuthData();
          this.router.navigate(['/login']);
        }
      });
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) {
      this.logout();
      return of();
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(() => {
          this.logout();
          return of();
        })
      );
  }

  // Additional methods can be added here when backend implements them
  // TODO: Implement when backend adds these endpoints:
  // - Password reset functionality
  // - Password change functionality
  // - User profile update functionality
  // - Role and permission management

  // Private Methods
  private handleAuthSuccess(response: AuthResponse): void {
    // Update signals
    this.userSignal.set(response.user);
    this.tokenSignal.set(response.accessToken);

    // Store in localStorage
    localStorage.setItem(this.tokenKey, response.accessToken);
    localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }

  private clearAuthData(): void {
    // Clear signals
    this.userSignal.set(null);
    this.tokenSignal.set(null);

    // Clear localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  private initializeFromStorage(): void {
    const user = this.getUserFromStorage();
    const token = this.getTokenFromStorage();

    if (user && token) {
      this.userSignal.set(user);
      this.tokenSignal.set(token);
    }
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}