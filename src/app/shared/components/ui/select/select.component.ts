import { Component, Input, Output, EventEmitter, forwardRef, computed, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-1">
      @if (label) {
        <label [for]="selectId" [class]="labelClasses()">
          {{ label }}
          @if (required) {
            <span class="text-danger-500 ml-1">*</span>
          }
        </label>
      }

      <div class="relative">
        <button
          #selectButton
          [id]="selectId"
          type="button"
          [class]="selectClasses()"
          [disabled]="disabled()"
          (click)="toggleDropdown()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          aria-haspopup="listbox"
          [attr.aria-expanded]="isOpen()"
        >
          <span class="flex items-center">
            @if (selectedOption()?.icon) {
              <span class="mr-2">{{ selectedOption()?.icon }}</span>
            }
            <span class="block truncate">
              {{ selectedOption()?.label || placeholder }}
            </span>
          </span>

          <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg class="h-5 w-5 text-gray-400 transition-transform duration-200"
                 [class.rotate-180]="isOpen()"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        @if (isOpen()) {
          <ul
            #dropdown
            class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="listbox"
            [attr.aria-labelledby]="selectId"
          >
            @if (showSearch && options.length > searchThreshold) {
              <li class="px-3 py-2 border-b border-gray-200">
                <input
                  #searchInput
                  type="text"
                  class="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ara..."
                  [value]="searchTerm()"
                  (input)="onSearch($event)"
                  (keydown)="onSearchKeyDown($event)"
                />
              </li>
            }

            @for (option of filteredOptions(); track option.value) {
              <li
                [class]="optionClasses(option)"
                [attr.aria-selected]="isSelected(option)"
                role="option"
                (click)="selectOption(option)"
                (mouseenter)="highlightedIndex.set($index)"
              >
                <div class="flex items-center">
                  @if (option.icon) {
                    <span class="mr-2">{{ option.icon }}</span>
                  }
                  <span [class]="isSelected(option) ? 'font-semibold' : 'font-normal'">
                    {{ option.label }}
                  </span>
                </div>

                @if (isSelected(option)) {
                  <span class="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                }
              </li>
            } @empty {
              <li class="px-3 py-2 text-gray-500 text-sm">
                {{ searchTerm() ? 'Sonuç bulunamadı' : 'Seçenek yok' }}
              </li>
            }
          </ul>
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
export class SelectComponent implements ControlValueAccessor {
  @ViewChild('selectButton') selectButton!: ElementRef;
  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  @Input() label = '';
  @Input() placeholder = 'Seçiniz...';
  @Input() options: SelectOption[] = [];
  @Input() size: SelectSize = 'default';
  @Input() helperText = '';
  @Input() errorMessage = signal('');
  @Input() required = false;
  @Input() disabled = signal(false);
  @Input() multiple = false;
  @Input() showSearch = false;
  @Input() searchThreshold = 5;
  @Input() selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  @Output() selectionChange = new EventEmitter<SelectOption | SelectOption[]>();

  value = signal<any>(null);
  isOpen = signal(false);
  searchTerm = signal('');
  highlightedIndex = signal(-1);

  // ControlValueAccessor
  private onChange = (_: any) => {};
  private onTouched = () => {};

  selectedOption = computed(() => {
    if (this.multiple) {
      return null; // Handle multiple selection separately
    }
    return this.options.find(option => option.value === this.value());
  });

  filteredOptions = computed(() => {
    if (!this.searchTerm()) {
      return this.options;
    }

    const term = this.searchTerm().toLowerCase();
    return this.options.filter(option =>
      option.label.toLowerCase().includes(term)
    );
  });

  selectClasses = computed(() => {
    const classes = ['relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1'];

    // Size classes
    switch (this.size) {
      case 'sm':
        classes.push('text-sm py-1.5');
        break;
      case 'default':
        classes.push('text-sm py-2');
        break;
      case 'lg':
        classes.push('text-base py-2.5');
        break;
    }

    // State classes
    if (this.errorMessage()) {
      classes.push('border-danger-300 text-danger-900 focus:border-danger-500 focus:ring-danger-500');
    } else if (this.isOpen()) {
      classes.push('border-primary-300 focus:border-primary-500 focus:ring-primary-500');
    } else {
      classes.push('border-gray-300 text-gray-900 focus:border-primary-500 focus:ring-primary-500');
    }

    if (this.disabled()) {
      classes.push('bg-gray-50 text-gray-500 cursor-not-allowed');
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

  optionClasses = (option: SelectOption): string => {
    const classes = ['cursor-default select-none relative py-2 pl-3 pr-9 transition-colors duration-150'];

    if (option.disabled) {
      classes.push('text-gray-400 cursor-not-allowed');
    } else if (this.isSelected(option)) {
      classes.push('text-white bg-primary-600');
    } else {
      classes.push('text-gray-900 hover:bg-primary-50 hover:text-primary-900');
    }

    return classes.join(' ');
  };

  toggleDropdown(): void {
    if (this.disabled()) return;

    this.isOpen.update(open => !open);

    if (this.isOpen()) {
      // Focus search input if available
      setTimeout(() => {
        if (this.showSearch && this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      });
    }
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    this.value.set(option.value);
    this.onChange(option.value);
    this.selectionChange.emit(option);
    this.isOpen.set(false);
    this.searchTerm.set('');
  }

  isSelected(option: SelectOption): boolean {
    return option.value === this.value();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.highlightedIndex.set(-1);
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.isOpen.set(false);
      this.selectButton.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleDropdown();
        break;
      case 'Escape':
        this.isOpen.set(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.isOpen.set(true);
        } else {
          this.highlightedIndex.update(index =>
            Math.min(index + 1, this.filteredOptions().length - 1)
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          this.highlightedIndex.update(index => Math.max(index - 1, 0));
        }
        break;
    }
  }

  onBlur(): void {
    // Close dropdown with a small delay to allow option selection
    setTimeout(() => {
      this.isOpen.set(false);
      this.onTouched();
    }, 150);
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