import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-veg-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="veg-indicator"
      [class.is-veg]="veg"
      [class.is-nonveg]="!veg"
      [attr.title]="veg ? 'Pure Vegetarian' : 'Non-Vegetarian'"
      [attr.aria-label]="veg ? 'Pure Vegetarian' : 'Non-Vegetarian'"
    >
      <span class="symbol"></span>
    </span>
  `,
  styles: [
    `
      .veg-indicator {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 17px;
        height: 17px;
        border-radius: 4px;
        flex-shrink: 0;
        background: #ffffff;
      }

      .veg-indicator.is-veg {
        border: 1.5px solid #16a34a;
      }

      .veg-indicator.is-veg .symbol {
        width: 7.5px;
        height: 7.5px;
        border-radius: 50%;
        background-color: #16a34a;
      }

      .veg-indicator.is-nonveg {
        border: 1.5px solid #dc2626;
      }

      .veg-indicator.is-nonveg .symbol {
        width: 0;
        height: 0;
        border-left: 4.5px solid transparent;
        border-right: 4.5px solid transparent;
        border-bottom: 7.5px solid #dc2626;
        border-radius: 1px;
      }
    `,
  ],
})
export class VegBadgeComponent {
  @Input() veg: boolean = true;
}

