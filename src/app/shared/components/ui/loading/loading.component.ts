import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoadingType = 'spinner' | 'dots' | 'pulse' | 'skeleton';
export type LoadingSize = 'sm' | 'default' | 'lg';

@Component({
  selector: 'erp-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type) {
      @case ('spinner') {
        <div [class]="spinnerClasses()">
          <div class="animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        </div>
      }

      @case ('dots') {
        <div [class]="dotsContainerClasses()">
          <div class="animate-bounce" [style.animation-delay]="'0ms'"></div>
          <div class="animate-bounce" [style.animation-delay]="'150ms'"></div>
          <div class="animate-bounce" [style.animation-delay]="'300ms'"></div>
        </div>
      }

      @case ('pulse') {
        <div [class]="pulseClasses()">
          <div class="animate-pulse bg-current rounded"></div>
        </div>
      }

      @case ('skeleton') {
        <div class="animate-pulse space-y-3">
          @if (skeletonLines > 0) {
            @for (line of skeletonArray; track $index) {
              <div [class]="skeletonLineClasses($index)"></div>
            }
          }
        </div>
      }
    }

    @if (text && type !== 'skeleton') {
      <span [class]="textClasses()">{{ text }}</span>
    }
  `,
})
export class LoadingComponent {
  @Input() type: LoadingType = 'spinner';
  @Input() size: LoadingSize = 'default';
  @Input() text = '';
  @Input() color = 'text-primary-600';
  @Input() skeletonLines = 3;

  get skeletonArray(): number[] {
    return Array.from({ length: this.skeletonLines }, (_, i) => i);
  }

  spinnerClasses = computed(() => {
    const classes = ['flex items-center justify-center', this.color];

    switch (this.size) {
      case 'sm':
        classes.push('h-4 w-4');
        break;
      case 'default':
        classes.push('h-6 w-6');
        break;
      case 'lg':
        classes.push('h-8 w-8');
        break;
    }

    return classes.join(' ');
  });

  dotsContainerClasses = computed(() => {
    const classes = ['flex items-center gap-1', this.color];
    return classes.join(' ');
  });

  pulseClasses = computed(() => {
    const classes = ['flex items-center justify-center', this.color];

    switch (this.size) {
      case 'sm':
        classes.push('h-4 w-4');
        break;
      case 'default':
        classes.push('h-6 w-6');
        break;
      case 'lg':
        classes.push('h-8 w-8');
        break;
    }

    return classes.join(' ');
  });

  skeletonLineClasses = (index: number): string => {
    const classes = ['bg-gray-300 rounded'];

    // Vary the width for more realistic skeleton
    const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-3/4'];
    const width = widths[index % widths.length];
    classes.push(width);

    switch (this.size) {
      case 'sm':
        classes.push('h-3');
        break;
      case 'default':
        classes.push('h-4');
        break;
      case 'lg':
        classes.push('h-5');
        break;
    }

    return classes.join(' ');
  };

  textClasses = computed(() => {
    const classes = ['ml-2'];

    switch (this.size) {
      case 'sm':
        classes.push('text-sm');
        break;
      case 'default':
        classes.push('text-base');
        break;
      case 'lg':
        classes.push('text-lg');
        break;
    }

    return classes.join(' ');
  });
}