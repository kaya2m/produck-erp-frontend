import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'erp-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() sidebarOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  dropdownOpen = signal(false);
  notificationsOpen = signal(false);

  // Mock notifications for demo
  notifications = [
    { id: 1, title: 'Yeni sipariş alındı', message: 'Müşteri #1234 sipariş verdi', time: '2 dakika önce', read: false },
    { id: 2, title: 'Rapor hazır', message: 'Aylık satış raporu oluşturuldu', time: '1 saat önce', read: false },
    { id: 3, title: 'Sistem güncellendi', message: 'v1.2.0 güncellemesi tamamlandı', time: '3 saat önce', read: true }
  ];

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleDropdown(): void {
    this.dropdownOpen.set(!this.dropdownOpen());
    this.notificationsOpen.set(false);
  }

  toggleNotifications(): void {
    this.notificationsOpen.set(!this.notificationsOpen());
    this.dropdownOpen.set(false);
  }

  closeDropdowns(): void {
    this.dropdownOpen.set(false);
    this.notificationsOpen.set(false);
  }

  onLogout(): void {
    this.authService.logout();
    this.notificationService.success('Başarıyla çıkış yapıldı');
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeDropdowns();
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
    this.closeDropdowns();
  }

  markNotificationAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  markAllNotificationsAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notificationService.success('Tüm bildirimler okundu olarak işaretlendi');
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get userDisplayName(): string {
    const user = this.authService.user();
    if (user) {
      return user.username || user.email;
    }
    return 'Kullanıcı';
  }

  get userInitials(): string {
    const user = this.authService.user();
    if (user) {
      const username = user.username || user.email;
      return username.charAt(0).toUpperCase();
    }
    return 'U';
  }
}