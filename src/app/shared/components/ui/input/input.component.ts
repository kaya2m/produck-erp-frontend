import { Component, Input, forwardRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type InputSize = 'sm' | 'default' | 'lg';

@Component({
  selector: 'erp-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-1">
      @if (label) {
        <label [for]="inputId" [class]="labelClasses()">
          {{ label }}
          @if (required) {
            <span class="text-danger-500 ml-1">*</span>
          }
        </label>
      }

      <div [class]="containerClasses()">
        @if (prefixIcon) {
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <ng-content select="[slot=prefix-icon]"></ng-content>
          </div>
        }

        <input
          [id]="inputId"
          [type]="currentType()"
          [placeholder]="placeholder"
          [disabled]="disabled()"
          [readonly]="readonly"
          [class]="inputClasses()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />

        @if (type === 'password') {
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            (click)="togglePasswordVisibility()"
          >
            @if (showPassword()) {
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            } @else {
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            }
          </button>
        } @else if (suffixIcon) {
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ng-content select="[slot=suffix-icon]"></ng-content>
          </div>
        }
      </div>

      @if (helperText || errorMessage()) {
        <p [class]="helperTextClasses()">
          {{ errorMessage() || helperText }}
        </p>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'default';
  @Input() helperText = '';
  @Input() errorMessage = signal('');
  @Input() required = false;
  @Input() disabled = signal(false);
  @Input() readonly = false;
  @Input() prefixIcon = false;
  @Input() suffixIcon = false;
  @Input() inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  value = signal('');
  focused = signal(false);
  showPassword = signal(false);

  currentType = computed(() => {
    if (this.type === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type;
  });

  // ControlValueAccessor
  private onChange = (_: any) => {};
  private onTouched = () => {};

  containerClasses = computed(() => {
    return 'relative';
  });

  inputClasses = computed(() => {
    const classes = ['block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1'];

    // Size classes
    switch (this.size) {
      case 'sm':
        classes.push('text-sm');
        if (this.prefixIcon) {
          classes.push('pl-10 pr-3 py-2');
        } else if (this.suffixIcon || this.type === 'password') {
          classes.push('pl-3 pr-10 py-2');
        } else {
          classes.push('px-3 py-2');
        }
        break;
      case 'default':
        classes.push('text-sm');
        if (this.prefixIcon) {
          classes.push('pl-10 pr-3 py-2.5');
        } else if (this.suffixIcon || this.type === 'password') {
          classes.push('pl-3 pr-10 py-2.5');
        } else {
          classes.push('px-3 py-2.5');
        }
        break;
      case 'lg':
        classes.push('text-base');
        if (this.prefixIcon) {
          classes.push('pl-12 pr-4 py-3');
        } else if (this.suffixIcon || this.type === 'password') {
          classes.push('pl-4 pr-12 py-3');
        } else {
          classes.push('px-4 py-3');
        }
        break;
    }

    // State classes
    if (this.errorMessage()) {
      classes.push('border-danger-300 text-danger-900 placeholder-danger-300 focus:border-danger-500 focus:ring-danger-500');
    } else if (this.focused()) {
      classes.push('border-primary-300 focus:border-primary-500 focus:ring-primary-500');
    } else {
      classes.push('border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500');
    }

    if (this.disabled()) {
      classes.push('bg-gray-50 text-gray-500 cursor-not-allowed');
    } else {
      classes.push('bg-white');
    }

    return classes.join(' ');
  });

  labelClasses = computed(() => {
    const classes = ['block text-sm font-medium'];

    if (this.errorMessage()) {
      classes.push('text-danger-700');
    } else {
      classes.push('text-gray-700');
    }

    return classes.join(' ');
  });

  helperTextClasses = computed(() => {
    const classes = ['text-sm'];

    if (this.errorMessage()) {
      classes.push('text-danger-600');
    } else {
      classes.push('text-gray-500');
    }

    return classes.join(' ');
  });

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  onFocus(): void {
    this.focused.set(true);
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value.set(value || '');
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