import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

export type ModalSize = 'sm' | 'default' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'erp-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
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

  getStyleClass(): string {
    const classes = ['erp-modal'];
    classes.push(`erp-modal-${this.size}`);
    return classes.join(' ');
  }

  getDialogStyle(): any {
    switch (this.size) {
      case 'sm':
        return { width: '30rem' };
      case 'default':
        return { width: '40rem' };
      case 'lg':
        return { width: '50rem' };
      case 'xl':
        return { width: '60rem' };
      case 'full':
        return { width: '90vw' };
      default:
        return { width: '40rem' };
    }
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onClose(): void {
    this.closed.emit();
  }

  cancel(): void {
    this.canceled.emit();
    this.close();
  }

  confirm(): void {
    this.confirmed.emit();
  }
}