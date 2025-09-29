import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'erp-opportunities',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Fırsatlar</h1>
      <div class="card">
        <p>Fırsat yönetim sayfası yakında...</p>
      </div>
    </div>
  `
})
export class OpportunitiesComponent {}