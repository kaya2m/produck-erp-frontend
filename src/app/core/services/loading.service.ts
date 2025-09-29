import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCount = signal(0);

  // Public readonly signal
  readonly isLoading = signal(false);

  show(): void {
    const currentCount = this.loadingCount();
    this.loadingCount.set(currentCount + 1);
    this.updateLoadingState();
  }

  hide(): void {
    const currentCount = this.loadingCount();
    if (currentCount > 0) {
      this.loadingCount.set(currentCount - 1);
    }
    this.updateLoadingState();
  }

  reset(): void {
    this.loadingCount.set(0);
    this.updateLoadingState();
  }

  private updateLoadingState(): void {
    this.isLoading.set(this.loadingCount() > 0);
  }
}