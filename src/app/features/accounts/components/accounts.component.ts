import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'erp-accounts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Hesaplar</h1>
      <div class="card">
        <p>Hesap yönetim sayfası yakında...</p>
      </div>
    </div>
  `
})
export class AccountsComponent {}