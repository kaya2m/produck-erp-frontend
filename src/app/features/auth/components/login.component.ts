import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'erp-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private loadingService: LoadingService
  ) {
    this.loginForm = this.fb.group({
      username: ['admin', [Validators.required]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);

      const credentials = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.notificationService.success('Giriş başarılı! Hoş geldiniz!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Login error:', error);

          let errorMessage = 'Giriş başarısız oldu.';

          if (error.status === 401) {
            errorMessage = 'Kullanıcı adı veya şifre hatalı.';
          } else if (error.status === 422) {
            errorMessage = 'Geçersiz veri formatı.';
          } else if (error.status === 0) {
            errorMessage = 'Sunucu bağlantısı kurulamadı.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.notificationService.error(errorMessage);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.notificationService.warning('Lütfen tüm gerekli alanları doldurun.');
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} gereklidir.`;
      }
      if (field.errors['email']) {
        return 'Geçerli bir email adresi girin.';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} en az ${field.errors['minlength'].requiredLength} karakter olmalıdır.`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      username: 'Kullanıcı Adı',
      password: 'Şifre'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Demo credentials helper
  fillDemoCredentials(): void {
    this.loginForm.patchValue({
      username: 'admin',
      password: '123456'
    });
    this.notificationService.info('Demo giriş bilgileri dolduruldu');
  }
}