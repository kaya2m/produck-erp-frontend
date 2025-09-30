import { Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

export type CheckboxSize = 'sm' | 'default' | 'lg';

@Component({
  selector: 'erp-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss'
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() description = '';
  @Input() size: CheckboxSize = 'default';
  @Input() required = false;
  @Input() disabled = signal(false);
  @Input() errorMessage = signal('');
  @Input() checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  checked = signal(false);

  // ControlValueAccessor
  private onChange = (_: any) => {};
  private onTouched = () => {};

  getStyleClass(): string {
    const classes = ['erp-checkbox'];

    classes.push(`erp-checkbox-${this.size}`);

    if (this.errorMessage()) {
      classes.push('erp-checkbox-error');
    }

    return classes.join(' ');
  }

  onToggle(value: boolean): void {
    this.checked.set(value);
    this.onChange(value);
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