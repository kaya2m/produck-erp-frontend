import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'info' | 'warn';
export type ButtonSize = 'sm' | 'default' | 'lg';

@Component({
  selector: 'erp-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'default';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() iconLeft = false;
  @Input() iconRight = false;
  @Input() iconOnly = signal(false);
  @Input() disabled = signal(false);
  @Input() loading = signal(false);
  @Input() fullWidth = false;

  @Output() click = new EventEmitter<Event>();

  getSeverity(): 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    switch (this.variant) {
      case 'primary':
        return null; // default primary
      case 'secondary':
        return 'secondary';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      case 'warn':
        return 'warn';
      case 'destructive':
        return 'danger';
      case 'outline':
        return 'secondary';
      case 'ghost':
        return 'secondary';
      default:
        return null;
    }
  }

  getSize(): 'small' | 'large' | undefined {
    switch (this.size) {
      case 'sm':
        return 'small';
      case 'lg':
        return 'large';
      default:
        return undefined;
    }
  }

  handleClick(event: Event): void {
    if (!this.disabled() && !this.loading()) {
      this.click.emit(event);
    }
  }
}