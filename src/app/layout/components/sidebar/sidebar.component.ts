import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { filter } from 'rxjs';

export interface MenuItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  badge?: string;
  badgeColor?: 'primary' | 'success' | 'warning' | 'danger';
  permission?: string;
}

@Component({
  selector: 'erp-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Input() isMobile = false;
  @Output() close = new EventEmitter<void>();
  @Output() expand = new EventEmitter<void>();

  expandedMenus = signal<Set<string>>(new Set());
  currentRoute = signal('');

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Ana Sayfa',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M9 9h6v6H9z',
      route: '/dashboard'
    },
    {
      id: 'crm',
      title: 'CRM',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      children: [
        {
          id: 'leads',
          title: 'Potansiyel Müşteriler',
          icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
          route: '/crm/leads',
          badgeColor: 'primary'
        },
        {
          id: 'opportunities',
          title: 'Fırsatlar',
          icon: 'M13 10V3L4 14h7v7l9-11h-7z',
          route: '/crm/opportunities',
          badgeColor: 'success'
        },
        {
          id: 'accounts',
          title: 'Hesaplar',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
          route: '/crm/accounts'
        },
        {
          id: 'contacts',
          title: 'Kişiler',
          icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
          route: '/crm/contacts'
        }
      ]
    },
    {
      id: 'workflow',
      title: 'İş Akışı',
      icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
      route: '/workflow'
    },
    {
      id: 'system-management',
      title: 'Sistem Yönetimi', 
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      children: [
        {
          id: 'user-management',
          title: 'Kullanıcı Yönetimi',
          icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
          route: '/system-management/users',
          permission: 'user_management'
        },
        {
          id: 'role-management',
          title: 'Rol Yönetimi',
          icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
          route: '/system-management/roles',
          permission: 'role_management'
        },
        {
          id: 'security-dashboard',
          title: 'Güvenlik Yönetimi',
          icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
          route: '/system-management/security',
          permission: 'security_management'
        },
        {
          id: 'system-settings',
          title: 'Sistem Ayarları',
          icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
          route: '/system-management/settings',
          permission: 'system_settings'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Genel Ayarlar',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      children: [
        {
          id: 'profile',
          title: 'Profil',
          icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
          route: '/settings/profile'
        },
        {
          id: 'preferences',
          title: 'Tercihler',
          icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4',
          route: '/settings/preferences'
        }
      ]
    }
  ];

  // Filter menu items based on user permissions
  filteredMenuItems = computed(() => {
    return this.filterMenuByPermissions(this.menuItems);
  });

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Track current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.urlAfterRedirects);
        this.autoExpandActiveItems();
      });

    // Set initial route
    this.currentRoute.set(this.router.url);
    this.autoExpandActiveItems();
  }

  private filterMenuByPermissions(items: MenuItem[]): MenuItem[] {
    return items.filter(item => {
      // TODO: Check permissions when backend supports them
      // For now, show all items to authenticated users
      // if (item.permission && !this.authService.hasPermission(item.permission)) {
      //   return false;
      // }

      // Filter children recursively
      if (item.children) {
        item.children = this.filterMenuByPermissions(item.children);
        // Only show parent if it has visible children or a route
        return item.children.length > 0 || item.route;
      }

      return true;
    });
  }

  private autoExpandActiveItems(): void {
    const currentRoute = this.currentRoute();
    const expandedItems = new Set<string>();

    // Find parent items that should be expanded based on current route
    this.findExpandedItems(this.menuItems, currentRoute, expandedItems);
    this.expandedMenus.set(expandedItems);
  }

  private findExpandedItems(items: MenuItem[], currentRoute: string, expanded: Set<string>): void {
    for (const item of items) {
      if (item.children) {
        const hasActiveChild = item.children.some(child =>
          child.route && currentRoute.startsWith(child.route)
        );
        if (hasActiveChild) {
          expanded.add(item.id);
        }
        this.findExpandedItems(item.children, currentRoute, expanded);
      }
    }
  }

  toggleMenu(menuId: string): void {
    const expanded = this.expandedMenus();
    if (expanded.has(menuId)) {
      expanded.delete(menuId);
    } else {
      expanded.add(menuId);
    }
    this.expandedMenus.set(new Set(expanded));
  }

  isMenuExpanded(menuId: string): boolean {
    return this.expandedMenus().has(menuId);
  }

  isActive(item: MenuItem): boolean {
    if (!item.route) return false;

    const currentRoute = this.currentRoute();
    return currentRoute === item.route || currentRoute.startsWith(item.route + '/');
  }

  hasActiveChild(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => this.isActive(child));
  }

  onItemClick(item: MenuItem): void {
    // Eğer sidebar kapalıysa ve mobile değilse, önce sidebar'ı aç
    if (!this.isOpen && !this.isMobile) {
      this.expand.emit();
      // Kısa bir gecikme sonrasında menu işlemini yap
      setTimeout(() => {
        this.handleMenuAction(item);
      }, 150);
    } else {
      this.handleMenuAction(item);
    }
  }

  private handleMenuAction(item: MenuItem): void {
    if (item.children && item.children.length > 0) {
      this.toggleMenu(item.id);
    } else if (item.route) {
      this.router.navigate([item.route]);
      // Close sidebar on mobile after navigation
      if (this.isMobile) {
        this.close.emit();
      }
    }
  }

  onBackdropClick(): void {
    this.close.emit();
  }

  onToggleSidebar(): void {
    this.close.emit();
  }

  getBadgeColor(color?: string): string {
    switch (color) {
      case 'primary': return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'danger': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }
}
