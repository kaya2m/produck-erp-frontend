import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface NotificationOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  richColors?: boolean;
  closeButton?: boolean;
  // İstersen buraya ngx-sonner'ın diğer opsiyonlarını da ekleyebilirsin (class, description, action, cancel, vs.)
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private defaultOptions: NotificationOptions = {
    duration: 4000,
    position: 'top-right',
    richColors: true,
    closeButton: true,
  };

  success(message: string, options?: NotificationOptions): string | number {
    return toast.success(message, { ...this.defaultOptions, ...options });
  }

  error(message: string, options?: NotificationOptions): string | number {
    return toast.error(message, { ...this.defaultOptions, ...options });
  }

  warning(message: string, options?: NotificationOptions): string | number {
    return toast.warning(message, { ...this.defaultOptions, ...options });
  }

  info(message: string, options?: NotificationOptions): string | number {
    return toast.info(message, { ...this.defaultOptions, ...options });
  }

  loading(message: string, options?: NotificationOptions): string | number {
    return toast.loading(message, {
      ...this.defaultOptions,
      duration: Number.POSITIVE_INFINITY,
      ...options,
    });
  }

  promise<T>(
    promise: Promise<T>,
    texts: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: any) => string);
    } = { loading: 'Loading...', success: 'Success!', error: 'Error occurred' },
    options?: NotificationOptions
  ): Promise<T> {
    toast.promise(promise, {
      loading: texts.loading ?? 'Loading...',
      success: texts.success ?? 'Success!',
      error: texts.error ?? 'Error occurred',
      // Not: defaultOptions'ı burada ayrı bir parametre gibi veremiyoruz;
      // per-toast konum/süre vs. gerekiyorsa promise'in resolve/reject olmayan
      // varyantında toast.loading + manual update tercih edebilirsin.
    });
    return promise;
  }

  dismiss(toastId?: string | number): void {
    toast.dismiss(toastId as any);
  }

  dismissAll(): void {
    toast.dismiss();
  }
}
