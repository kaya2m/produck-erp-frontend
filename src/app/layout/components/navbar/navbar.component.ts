import { Component, signal, computed, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { ThemeService } from '@core/services/theme.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BreadcrumbComponent } from '@shared/components/ui/breadcrumb/breadcrumb.component';

@Component({
  selector: 'erp-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @Input() sidebarOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  isProfileMenuOpen = signal(false);
  isNotificationMenuOpen = signal(false);
  private readonly themeService = inject(ThemeService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  readonly isDarkMode = this.themeService.isDarkMode;
  readonly breadcrumbItems = this.breadcrumbService.items;

  // Mock notifications - replace with real service
  notifications = signal([
    { id: 1, title: 'Yeni Lead', message: 'Acme Corp firmasından yeni lead geldi', time: '2 dk önce', unread: false },
    { id: 2, title: 'Görev Tamamlandı', message: 'Proje analizi tamamlandı', time: '15 dk önce', unread: false },
    { id: 3, title: 'Sistem Güncellemesi', message: 'Sistem başarıyla güncellendi', time: '1 saat önce', unread: false }
  ]);

  unreadCount = computed(() =>
    this.notifications().filter(n => n.unread).length
  );

  user = computed(() => this.authService.user());

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // Close menus when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu') && !target.closest('.notification-menu')) {
        this.isProfileMenuOpen.set(false);
        this.isNotificationMenuOpen.set(false);
      }
    });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.set(!this.isProfileMenuOpen());
    this.isNotificationMenuOpen.set(false);
  }

  toggleNotificationMenu(): void {
    this.isNotificationMenuOpen.set(!this.isNotificationMenuOpen());
    this.isProfileMenuOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  markNotificationAsRead(notificationId: number): void {
    const notifications = this.notifications();
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, unread: false } : n
    );
    this.notifications.set(updatedNotifications);
  }

  markAllNotificationsAsRead(): void {
    const notifications = this.notifications();
    const updatedNotifications = notifications.map(n => ({ ...n, unread: false }));
    this.notifications.set(updatedNotifications);
  }

  onLogout(): void {
    this.authService.logout();
    this.notificationService.success('Başarıyla çıkış yapıldı');
  }

  navigateToProfile(): void {
    this.router.navigate(['/settings/profile']);
    this.isProfileMenuOpen.set(false);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
    this.isProfileMenuOpen.set(false);
  }
}
