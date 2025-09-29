import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'default' | 'lg';

@Component({
  selector: 'erp-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()">
      @if (hasHeader) {
        <div [class]="headerClasses()">
          @if (title) {
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          }
          @if (subtitle) {
            <p class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
          }
          <ng-content select="[slot=header]"></ng-content>
        </div>
      }

      <div [class]="contentClasses()">
        <ng-content></ng-content>
      </div>

      @if (hasFooter) {
        <div [class]="footerClasses()">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      }
    </div>
  `,
})
export class CardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() variant: CardVariant = 'default';
  @Input() padding: CardPadding = 'default';
  @Input() hasHeader = false;
  @Input() hasFooter = false;
  @Input() hover = false;
  @Input() clickable = false;

  cardClasses = computed(() => {
    const classes = ['bg-white rounded-lg transition-all duration-200'];

    // Variant styles
    switch (this.variant) {
      case 'default':
        classes.push('border border-gray-200');
        break;
      case 'outlined':
        classes.push('border-2 border-gray-300');
        break;
      case 'elevated':
        classes.push('shadow-lg border border-gray-100');
        break;
    }

    // Interactive states
    if (this.hover || this.clickable) {
      classes.push('hover:shadow-md');
    }

    if (this.clickable) {
      classes.push('cursor-pointer hover:border-primary-300');
    }

    return classes.join(' ');
  });

  headerClasses = computed(() => {
    const classes = ['border-b border-gray-200'];

    // Padding for header
    switch (this.padding) {
      case 'none':
        classes.push('p-0');
        break;
      case 'sm':
        classes.push('px-4 py-3');
        break;
      case 'default':
        classes.push('px-6 py-4');
        break;
      case 'lg':
        classes.push('px-8 py-6');
        break;
    }

    return classes.join(' ');
  });

  contentClasses = computed(() => {
    const classes = [];

    // Padding for content
    switch (this.padding) {
      case 'none':
        classes.push('p-0');
        break;
      case 'sm':
        classes.push('p-4');
        break;
      case 'default':
        classes.push('p-6');
        break;
      case 'lg':
        classes.push('p-8');
        break;
    }

    return classes.join(' ');
  });

  footerClasses = computed(() => {
    const classes = ['border-t border-gray-200 bg-gray-50'];

    // Padding for footer
    switch (this.padding) {
      case 'none':
        classes.push('p-0');
        break;
      case 'sm':
        classes.push('px-4 py-3');
        break;
      case 'default':
        classes.push('px-6 py-4');
        break;
      case 'lg':
        classes.push('px-8 py-6');
        break;
    }

    return classes.join(' ');
  });
}