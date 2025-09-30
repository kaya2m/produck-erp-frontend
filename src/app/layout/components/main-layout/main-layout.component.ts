import { Component, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'erp-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  isSidebarOpen = signal(true);
  isMobile = computed(() => window.innerWidth < 768);

  constructor(protected loadingService: LoadingService) {
    // Set initial sidebar state based on screen size
    this.isSidebarOpen.set(!this.isMobile());
  }

  @HostListener('window:resize')
  onResize(): void {
    // Auto-close sidebar on mobile
    if (this.isMobile() && this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
    }
    // Auto-open sidebar on desktop
    if (!this.isMobile() && !this.isSidebarOpen()) {
      this.isSidebarOpen.set(true);
    }
  }

  onToggleSidebar(): void {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  onCloseSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  onExpandSidebar(): void {
    this.isSidebarOpen.set(true);
  }
}