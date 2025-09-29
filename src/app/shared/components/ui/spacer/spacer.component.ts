import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpacerSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl' | '3xl';
export type SpacerDirection = 'horizontal' | 'vertical' | 'both';

@Component({
  selector: 'erp-spacer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="spacerClasses()"></div>
  `,
})
export class SpacerComponent {
  @Input() size: SpacerSize = 'default';
  @Input() direction: SpacerDirection = 'vertical';

  spacerClasses = computed(() => {
    const classes = [];

    // Size mapping
    const sizeMap = {
      'xs': 1,
      'sm': 2,
      'default': 4,
      'lg': 6,
      'xl': 8,
      '2xl': 12,
      '3xl': 16
    };

    const sizeValue = sizeMap[this.size];

    // Direction classes
    switch (this.direction) {
      case 'horizontal':
        classes.push(`w-${sizeValue}`);
        break;
      case 'vertical':
        classes.push(`h-${sizeValue}`);
        break;
      case 'both':
        classes.push(`w-${sizeValue}`, `h-${sizeValue}`);
        break;
    }

    return classes.join(' ');
  });
}