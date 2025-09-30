import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreadcrumbItem } from '@shared/components/ui/breadcrumb/breadcrumb.component';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbItems = signal<BreadcrumbItem[]>([]);

  get items() {
    return this.breadcrumbItems.asReadonly();
  }

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumb();
      });
  }

  private updateBreadcrumb(): void {
    const breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
    this.breadcrumbItems.set(breadcrumbs);
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const breadcrumbData = child.snapshot.data['breadcrumb'];
      if (breadcrumbData) {
        const breadcrumb: BreadcrumbItem = {
          label: breadcrumbData.label,
          url: breadcrumbData.url || url,
          icon: breadcrumbData.icon
        };
        breadcrumbs.push(breadcrumb);
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  setBreadcrumb(items: BreadcrumbItem[]): void {
    this.breadcrumbItems.set(items);
  }

  clearBreadcrumb(): void {
    this.breadcrumbItems.set([]);
  }

  addBreadcrumbItem(item: BreadcrumbItem): void {
    const current = this.breadcrumbItems();
    this.breadcrumbItems.set([...current, item]);
  }

  removeBreadcrumbItem(index: number): void {
    const current = this.breadcrumbItems();
    const updated = current.filter((_, i) => i !== index);
    this.breadcrumbItems.set(updated);
  }
}