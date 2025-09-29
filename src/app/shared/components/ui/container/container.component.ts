import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ContainerMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'default' | 'lg';

@Component({
  selector: 'erp-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class ContainerComponent {
  @Input() maxWidth: ContainerMaxWidth = 'full';
  @Input() padding: ContainerPadding = 'default';
  @Input() centerContent = false;

  containerClasses = computed(() => {
    const classes = ['w-full mx-auto'];

    // Max width
    switch (this.maxWidth) {
      case 'xs':
        classes.push('max-w-xs');
        break;
      case 'sm':
        classes.push('max-w-sm');
        break;
      case 'md':
        classes.push('max-w-md');
        break;
      case 'lg':
        classes.push('max-w-4xl');
        break;
      case 'xl':
        classes.push('max-w-6xl');
        break;
      case '2xl':
        classes.push('max-w-7xl');
        break;
      case 'full':
        classes.push('max-w-full');
        break;
    }

    // Padding
    switch (this.padding) {
      case 'none':
        // No padding
        break;
      case 'sm':
        classes.push('px-4 py-2');
        break;
      case 'default':
        classes.push('px-6 py-4');
        break;
      case 'lg':
        classes.push('px-8 py-6');
        break;
    }

    // Center content
    if (this.centerContent) {
      classes.push('flex items-center justify-center');
    }

    return classes.join(' ');
  });
}