import { Component, Input, Output, EventEmitter, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectModule } from 'primeng/select';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  icon?: string;
}

export type SelectSize = 'sm' | 'default' | 'lg';

@Component({
  selector: 'erp-select',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Seçiniz...';
  @Input() options: SelectOption[] = [];
  @Input() size: SelectSize = 'default';
  @Input() helperText = '';
  @Input() errorMessage = signal('');
  @Input() required = false;
  @Input() disabled = signal(false);
  @Input() showSearch = false;
  @Input() selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  @Output() selectionChange = new EventEmitter<SelectOption>();

  value = signal<any>(null);
  focused = signal(false);

  // ControlValueAccessor
  private onChange = (_: any) => {};
  private onTouched = () => {};

  getStyleClass(): string {
    const classes = ['erp-select'];

    classes.push(`erp-select-${this.size}`);

    if (this.errorMessage()) {
      classes.push('erp-select-error');
    }

    return classes.join(' ');
  }

  onValueChange(value: any): void {
    this.value.set(value);
    this.onChange(value);

    const selectedOption = this.options.find(opt => opt.value === value);
    if (selectedOption) {
      this.selectionChange.emit(selectedOption);
    }
  }

  onFocus(): void {
    this.focused.set(true);
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value.set(value);
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