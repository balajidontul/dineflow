import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled'
  | 'available'
  | 'occupied'
  | 'ordering'
  | 'waiting_payment'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary'
  | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="df-badge" [class]="'badge-' + variant" [class.badge-sm]="size === 'sm'" [class.badge-lg]="size === 'lg'">
      @if (showDot) {
        <span class="badge-dot"></span>
      }
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      .df-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        font-size: 0.775rem;
        font-weight: 600;
        border-radius: var(--radius-full);
        line-height: 1.2;
        letter-spacing: 0.02em;
        text-transform: capitalize;
        white-space: nowrap;
        border: 1px solid transparent;
        transition: all var(--transition-fast);
      }

      .badge-sm {
        padding: 2px 7px;
        font-size: 0.7rem;
        gap: 4px;
      }

      .badge-lg {
        padding: 6px 14px;
        font-size: 0.85rem;
        gap: 8px;
      }

      .badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: currentColor;
        flex-shrink: 0;
      }

      /* Status Badges */
      .badge-placed {
        background: #fef3c7;
        color: #b45309;
        border-color: #fde68a;
      }

      .badge-accepted {
        background: #eff6ff;
        color: #1d4ed8;
        border-color: #bfdbfe;
      }

      .badge-preparing {
        background: #fff7ed;
        color: #c2410c;
        border-color: #ffedd5;
      }
      .badge-preparing .badge-dot {
        animation: pulseDot 1.4s infinite;
      }

      .badge-ready {
        background: #f0fdf4;
        color: #15803d;
        border-color: #bbf7d0;
      }

      .badge-served {
        background: #f5f3ff;
        color: #6d28d9;
        border-color: #ddd6fe;
      }

      .badge-completed {
        background: #f1f5f9;
        color: #475569;
        border-color: #e2e8f0;
      }

      .badge-cancelled {
        background: #fef2f2;
        color: #b91c1c;
        border-color: #fecaca;
      }

      /* Table Statuses */
      .badge-available {
        background: #ecfdf5;
        color: #047857;
        border-color: #a7f3d0;
      }

      .badge-occupied {
        background: #fff1f2;
        color: #be123c;
        border-color: #fecdd3;
      }

      .badge-ordering {
        background: #eff6ff;
        color: #1d4ed8;
        border-color: #bfdbfe;
      }

      .badge-waiting_payment {
        background: #fffbeb;
        color: #b45309;
        border-color: #fde68a;
      }

      /* Semantic Generic */
      .badge-primary {
        background: var(--color-primary-light);
        color: var(--color-primary);
        border-color: rgba(224, 83, 38, 0.25);
      }

      .badge-success {
        background: #ecfdf5;
        color: #059669;
        border-color: #a7f3d0;
      }

      .badge-warning {
        background: #fffbeb;
        color: #d97706;
        border-color: #fde68a;
      }

      .badge-danger {
        background: #fef2f2;
        color: #dc2626;
        border-color: #fecaca;
      }

      .badge-info {
        background: #eff6ff;
        color: #2563eb;
        border-color: #bfdbfe;
      }

      .badge-neutral {
        background: #f5f3f0;
        color: #5c5651;
        border-color: #e6e1d9;
      }

      @keyframes pulseDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(1.3); }
      }
    `,
  ],
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showDot: boolean = true;
}

