import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'default' | 'lg';

@Component({
  selector: 'erp-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
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

  getStyleClass(): string {
    const classes = ['erp-card'];

    classes.push(`erp-card-${this.variant}`);
    classes.push(`erp-card-padding-${this.padding}`);

    if (this.hover) {
      classes.push('erp-card-hover');
    }

    if (this.clickable) {
      classes.push('erp-card-clickable');
    }

    return classes.join(' ');
  }
}