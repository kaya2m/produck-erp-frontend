import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'erp-security',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Güvenlik Ayarları</h1>
      <div class="card">
        <p>Güvenlik ayarları sayfası yakında...</p>
      </div>
    </div>
  `
})
export class SecurityComponent {}