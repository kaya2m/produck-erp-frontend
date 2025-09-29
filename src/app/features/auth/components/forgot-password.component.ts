import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'erp-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = signal(false);
  isEmailSent = signal(false);
  isDarkMode = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    // Set initial theme based on system preference
    this.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading.set(true);

      const email = this.forgotPasswordForm.get('email')?.value;

      // TODO: Implement when backend adds password reset functionality
      // this.authService.requestPasswordReset(email).subscribe({
      //   next: () => {
      //     this.isLoading.set(false);
      //     this.isEmailSent.set(true);
      //     this.notificationService.success('Şifre sıfırlama bağlantısı email adresinize gönderildi.');
      //   },
      //   error: (error: any) => {

      // Temporary implementation until backend is ready
      setTimeout(() => {
        this.isLoading.set(false);
        this.notificationService.info('Şifre sıfırlama özelliği henüz aktif değil. Lütfen sistem yöneticisine başvurun.');
      }, 1000);

      // TODO: Remove this temporary code when backend implements password reset
    } else {
      this.markFormGroupTouched();
      this.notificationService.warning('Lütfen geçerli bir email adresi girin.');
    }
  }

  toggleTheme(): void {
    this.isDarkMode.set(!this.isDarkMode());
  }

  getFieldError(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Email adresi gereklidir.';
      }
      if (field.errors['email']) {
        return 'Geçerli bir email adresi girin.';
      }
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  resendEmail(): void {
    this.isEmailSent.set(false);
    this.onSubmit();
  }
}