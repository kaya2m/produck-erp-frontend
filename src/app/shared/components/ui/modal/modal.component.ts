import { Component, Input, Output, EventEmitter, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

export type ModalSize = 'sm' | 'default' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'erp-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm p-4"
           (click)="onOverlayClick($event)"
           [@fadeIn]>

        <div #modalContent
             [class]="modalClasses()"
             [@slideIn]
             (click)="$event.stopPropagation()"
             role="dialog"
             aria-modal="true"
             [attr.aria-labelledby]="title ? 'modal-title' : null">

          <!-- Header -->
          @if (title || showCloseButton) {
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              @if (title) {
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900">
                  {{ title }}
                </h2>
              }

              @if (showCloseButton) {
                <erp-button
                  variant="ghost"
                  size="icon"
                  (click)="close()"
                  class="ml-auto"
                >
                  <svg slot="icon" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </erp-button>
              }
            </div>
          }

          <!-- Content -->
          <div [class]="contentClasses()">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          @if (showFooter) {
            <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <ng-content select="[slot=footer]"></ng-content>

              @if (!hasCustomFooter) {
                @if (showCancelButton) {
                  <erp-button
                    variant="outline"
                    (click)="cancel()"
                  >
                    {{ cancelText }}
                  </erp-button>
                }

                @if (showConfirmButton) {
                  <erp-button
                    [variant]="confirmVariant"
                    [loading]="loading"
                    (click)="confirm()"
                  >
                    {{ confirmText }}
                  </erp-button>
                }
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  animations: [
    // Animation imports would go here in a real implementation
  ]
})
export class ModalComponent {
  @ViewChild('modalContent') modalContent!: ElementRef;

  @Input() title = '';
  @Input() size: ModalSize = 'default';
  @Input() showCloseButton = true;
  @Input() showFooter = true;
  @Input() showCancelButton = true;
  @Input() showConfirmButton = true;
  @Input() cancelText = 'İptal';
  @Input() confirmText = 'Tamam';
  @Input() confirmVariant: 'primary' | 'destructive' = 'primary';
  @Input() closeOnOverlayClick = true;
  @Input() loading = signal(false);
  @Input() hasCustomFooter = false;

  @Output() closed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  isOpen = signal(false);

  constructor() {
    // Handle escape key
    effect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      };

      if (this.isOpen()) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
          document.removeEventListener('keydown', handleEscape);
          document.body.style.overflow = 'unset';
        };
      }

      return () => {};
    });
  }

  modalClasses = () => {
    const classes = ['bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col'];

    switch (this.size) {
      case 'sm':
        classes.push('max-w-sm w-full');
        break;
      case 'default':
        classes.push('max-w-md w-full');
        break;
      case 'lg':
        classes.push('max-w-2xl w-full');
        break;
      case 'xl':
        classes.push('max-w-4xl w-full');
        break;
      case 'full':
        classes.push('max-w-7xl w-full mx-4');
        break;
    }

    return classes.join(' ');
  };

  contentClasses = () => {
    const classes = ['flex-1 overflow-auto'];

    if (!this.title && !this.showCloseButton && !this.showFooter) {
      classes.push('p-6');
    } else if (!this.showFooter) {
      classes.push('p-6 pb-6');
    } else {
      classes.push('p-6');
    }

    return classes.join(' ');
  };

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  cancel(): void {
    this.canceled.emit();
    this.close();
  }

  confirm(): void {
    this.confirmed.emit();
  }

  onOverlayClick(event: Event): void {
    if (this.closeOnOverlayClick && event.target === event.currentTarget) {
      this.close();
    }
  }
}