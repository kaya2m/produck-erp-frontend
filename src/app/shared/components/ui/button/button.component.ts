import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

@Component({
  selector: 'erp-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses()"
      [disabled]="disabled() || loading()"
      [type]="type"
      (click)="handleClick($event)"
    >
      <div [class]="contentClasses()">
        @if (loading()) {
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
        }

        @if (iconLeft && !loading()) {
          <ng-content select="[slot=icon-left]"></ng-content>
        }

        @if (!iconOnly() || loading()) {
          <span [class]="textClasses()">
            <ng-content></ng-content>
          </span>
        }

        @if (iconRight && !loading()) {
          <ng-content select="[slot=icon-right]"></ng-content>
        }
      </div>
    </button>
  `,
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

  private baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  buttonClasses = computed(() => {
    const classes = [this.baseClasses];

    // Size classes
    switch (this.size) {
      case 'sm':
        classes.push(this.iconOnly() ? 'h-8 w-8' : 'h-8 px-3 text-sm');
        break;
      case 'default':
        classes.push(this.iconOnly() ? 'h-10 w-10' : 'h-10 px-4 text-sm');
        break;
      case 'lg':
        classes.push(this.iconOnly() ? 'h-12 w-12' : 'h-12 px-6 text-base');
        break;
      case 'icon':
        classes.push('h-10 w-10');
        break;
    }

    // Variant classes
    switch (this.variant) {
      case 'primary':
        classes.push('bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800');
        break;
      case 'secondary':
        classes.push('bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 active:bg-gray-300');
        break;
      case 'outline':
        classes.push('border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500 active:bg-gray-100');
        break;
      case 'ghost':
        classes.push('text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200');
        break;
      case 'destructive':
        classes.push('bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 active:bg-danger-800');
        break;
    }

    // Full width
    if (this.fullWidth) {
      classes.push('w-full');
    }

    return classes.join(' ');
  });

  contentClasses = computed(() => {
    const classes = ['flex items-center justify-center'];

    if (this.loading()) {
      classes.push('gap-2');
    } else if ((this.iconLeft || this.iconRight) && !this.iconOnly()) {
      classes.push('gap-2');
    }

    return classes.join(' ');
  });

  textClasses = computed(() => {
    const classes = [];

    if (this.loading()) {
      classes.push('opacity-0');
    }

    return classes.join(' ');
  });

  handleClick(event: Event): void {
    if (!this.disabled() && !this.loading()) {
      this.click.emit(event);
    }
  }
}