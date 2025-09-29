import { Component, Input, forwardRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type CheckboxSize = 'sm' | 'default' | 'lg';

@Component({
  selector: 'erp-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex items-start">
      <div class="flex items-center h-5">
        <input
          [id]="checkboxId"
          type="checkbox"
          [class]="checkboxClasses()"
          [checked]="checked()"
          [disabled]="disabled()"
          [indeterminate]="indeterminate()"
          (change)="onToggle($event)"
          (blur)="onBlur()"
        />
      </div>

      @if (label || description) {
        <div class="ml-3 text-sm">
          @if (label) {
            <label [for]="checkboxId" [class]="labelClasses()">
              {{ label }}
              @if (required) {
                <span class="text-danger-500 ml-1">*</span>
              }
            </label>
          }

          @if (description) {
            <p class="text-gray-500">{{ description }}</p>
          }
        </div>
      }
    </div>

    @if (errorMessage()) {
      <p class="mt-1 text-sm text-danger-600">
        {{ errorMessage() }}
      </p>
    }
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() description = '';
  @Input() size: CheckboxSize = 'default';
  @Input() required = false;
  @Input() disabled = signal(false);
  @Input() indeterminate = signal(false);
  @Input() errorMessage = signal('');
  @Input() checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  checked = signal(false);

  // ControlValueAccessor
  private onChange = (_: any) => {};
  private onTouched = () => {};

  checkboxClasses = computed(() => {
    const classes = ['border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 transition-colors duration-200'];

    // Size classes
    switch (this.size) {
      case 'sm':
        classes.push('h-4 w-4 rounded');
        break;
      case 'default':
        classes.push('h-4 w-4 rounded');
        break;
      case 'lg':
        classes.push('h-5 w-5 rounded');
        break;
    }

    // State classes
    if (this.errorMessage()) {
      classes.push('border-danger-300 text-danger-600 focus:ring-danger-500');
    }

    if (this.disabled()) {
      classes.push('opacity-50 cursor-not-allowed');
    } else {
      classes.push('cursor-pointer');
    }

    return classes.join(' ');
  });

  labelClasses = computed(() => {
    const classes = ['font-medium cursor-pointer'];

    if (this.errorMessage()) {
      classes.push('text-danger-700');
    } else {
      classes.push('text-gray-900');
    }

    if (this.disabled()) {
      classes.push('opacity-50 cursor-not-allowed');
    }

    return classes.join(' ');
  });

  onToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.indeterminate.set(false);
    this.onChange(target.checked);
  }

  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}