import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'erp-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 class="text-6xl font-bold text-gray-400">403</h1>
          <h2 class="mt-6 text-3xl font-bold text-gray-900">
            Yetkisiz Erişim
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </p>
        </div>
        <div class="mt-8">
          <button
            (click)="goBack()"
            class="btn-primary">
            Geri Dön
          </button>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}