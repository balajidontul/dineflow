import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="quantity-control" [class]="'size-' + size">
      <button
        type="button"
        class="qty-btn"
        [disabled]="value <= min"
        (click)="decrement($event)"
        aria-label="Decrease quantity"
      >
        <app-icon [name]="value <= 1 && allowDeleteIcon ? 'trash' : 'minus'" [size]="iconSize"></app-icon>
      </button>

      <span class="qty-display">{{ value }}</span>

      <button
        type="button"
        class="qty-btn"
        [disabled]="value >= max"
        (click)="increment($event)"
        aria-label="Increase quantity"
      >
        <app-icon name="plus" [size]="iconSize"></app-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .quantity-control {
        display: inline-flex;
        align-items: center;
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        padding: 2px;
        user-select: none;
        box-shadow: var(--shadow-xs);
      }

      .qty-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        color: var(--color-text-primary);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: all var(--transition-fast);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .qty-btn:hover:not(:disabled) {
        background: var(--color-primary);
        color: #ffffff;
        border-color: var(--color-primary);
      }

      .qty-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      .qty-display {
        font-weight: 700;
        text-align: center;
        color: var(--color-text-primary);
      }

      /* Sizes */
      .size-sm {
        height: 28px;
        padding: 1px;
      }
      .size-sm .qty-btn {
        width: 24px;
        height: 24px;
      }
      .size-sm .qty-display {
        min-width: 26px;
        font-size: 0.8125rem;
      }

      .size-md {
        height: 36px;
      }
      .size-md .qty-btn {
        width: 30px;
        height: 30px;
      }
      .size-md .qty-display {
        min-width: 34px;
        font-size: 0.9375rem;
      }

      .size-lg {
        height: 44px;
        padding: 3px;
      }
      .size-lg .qty-btn {
        width: 36px;
        height: 36px;
      }
      .size-lg .qty-display {
        min-width: 44px;
        font-size: 1.125rem;
      }
    `,
  ],
})
export class QuantitySelectorComponent {
  @Input() value: number = 1;
  @Input() min: number = 0;
  @Input() max: number = 99;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() allowDeleteIcon: boolean = false;

  @Output() valueChange = new EventEmitter<number>();

  get iconSize(): number {
    if (this.size === 'sm') return 12;
    if (this.size === 'lg') return 18;
    return 14;
  }

  increment(event: MouseEvent) {
    event.stopPropagation();
    if (this.value < this.max) {
      this.value++;
      this.valueChange.emit(this.value);
    }
  }

  decrement(event: MouseEvent) {
    event.stopPropagation();
    if (this.value > this.min) {
      this.value--;
      this.valueChange.emit(this.value);
    }
  }
}

