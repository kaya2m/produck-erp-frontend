import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { LoadingService } from '@core/services/loading.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'erp-root',
  imports: [CommonModule, RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Produck ERP');

  constructor(protected loadingService: LoadingService) {}
}
