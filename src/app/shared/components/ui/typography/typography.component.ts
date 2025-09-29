import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline';
export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';
export type TypographyColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted' | 'inherit';

@Component({
  selector: 'erp-typography',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container [ngSwitch]="element()">
      <h1 *ngSwitchCase="'h1'" [class]="classes()"><ng-content></ng-content></h1>
      <h2 *ngSwitchCase="'h2'" [class]="classes()"><ng-content></ng-content></h2>
      <h3 *ngSwitchCase="'h3'" [class]="classes()"><ng-content></ng-content></h3>
      <h4 *ngSwitchCase="'h4'" [class]="classes()"><ng-content></ng-content></h4>
      <h5 *ngSwitchCase="'h5'" [class]="classes()"><ng-content></ng-content></h5>
      <h6 *ngSwitchCase="'h6'" [class]="classes()"><ng-content></ng-content></h6>
      <p *ngSwitchDefault [class]="classes()"><ng-content></ng-content></p>
    </ng-container>
  `,
})
export class TypographyComponent {
  @Input() variant: TypographyVariant = 'body1';
  @Input() align: TypographyAlign = 'left';
  @Input() color: TypographyColor = 'inherit';
  @Input() gutterBottom = false;
  @Input() noWrap = false;
  @Input() truncate = false;

  element = computed(() => {
    switch (this.variant) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return this.variant;
      default:
        return 'p';
    }
  });

  classes = computed(() => {
    const classes = [];

    // Variant styles
    switch (this.variant) {
      case 'h1':
        classes.push('text-4xl font-bold tracking-tight');
        break;
      case 'h2':
        classes.push('text-3xl font-bold tracking-tight');
        break;
      case 'h3':
        classes.push('text-2xl font-semibold tracking-tight');
        break;
      case 'h4':
        classes.push('text-xl font-semibold tracking-tight');
        break;
      case 'h5':
        classes.push('text-lg font-semibold');
        break;
      case 'h6':
        classes.push('text-base font-semibold');
        break;
      case 'subtitle1':
        classes.push('text-lg font-medium');
        break;
      case 'subtitle2':
        classes.push('text-base font-medium');
        break;
      case 'body1':
        classes.push('text-base');
        break;
      case 'body2':
        classes.push('text-sm');
        break;
      case 'caption':
        classes.push('text-xs');
        break;
      case 'overline':
        classes.push('text-xs font-medium uppercase tracking-wider');
        break;
    }

    // Alignment
    switch (this.align) {
      case 'left':
        classes.push('text-left');
        break;
      case 'center':
        classes.push('text-center');
        break;
      case 'right':
        classes.push('text-right');
        break;
      case 'justify':
        classes.push('text-justify');
        break;
    }

    // Color
    switch (this.color) {
      case 'primary':
        classes.push('text-primary-600');
        break;
      case 'secondary':
        classes.push('text-gray-600');
        break;
      case 'success':
        classes.push('text-success-600');
        break;
      case 'warning':
        classes.push('text-warning-600');
        break;
      case 'danger':
        classes.push('text-danger-600');
        break;
      case 'muted':
        classes.push('text-gray-500');
        break;
      case 'inherit':
        // No color class added
        break;
    }

    // Spacing
    if (this.gutterBottom) {
      classes.push('mb-4');
    }

    // Text wrapping
    if (this.noWrap) {
      classes.push('whitespace-nowrap');
    }

    if (this.truncate) {
      classes.push('truncate');
    }

    return classes.join(' ');
  });
}