import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type">
          <div class="toast-icon">
            <app-icon [name]="getIcon(toast.type)" [size]="20"></app-icon>
          </div>

          <div class="toast-content">
            @if (toast.title) {
              <div class="toast-title">{{ toast.title }}</div>
            }
            <div class="toast-message">{{ toast.message }}</div>
          </div>

          <button type="button" class="toast-dismiss" (click)="toastService.dismiss(toast.id)" aria-label="Close notification">
            <app-icon name="x" [size]="16"></app-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        width: calc(100vw - 48px);
        pointer-events: none;
      }

      .toast-item {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px;
        background: #ffffff;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--color-surface-border);
        animation: slideUp 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .toast-icon {
        flex-shrink: 0;
        margin-top: 1px;
      }

      .toast-content {
        flex: 1;
      }

      .toast-title {
        font-weight: 700;
        font-size: 0.875rem;
        color: var(--color-text-primary);
        line-height: 1.25;
        margin-bottom: 2px;
      }

      .toast-message {
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
        line-height: 1.4;
      }

      .toast-dismiss {
        flex-shrink: 0;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: 2px;
        border-radius: var(--radius-xs);
        transition: color var(--transition-fast);
      }
      .toast-dismiss:hover {
        color: var(--color-text-primary);
      }

      /* Variant colors */
      .toast-success {
        border-left: 4px solid var(--color-success);
      }
      .toast-success .toast-icon {
        color: var(--color-success);
      }

      .toast-error {
        border-left: 4px solid var(--color-danger);
      }
      .toast-error .toast-icon {
        color: var(--color-danger);
      }

      .toast-warning {
        border-left: 4px solid var(--color-warning);
      }
      .toast-warning .toast-icon {
        color: var(--color-warning);
      }

      .toast-info {
        border-left: 4px solid var(--color-info);
      }
      .toast-info .toast-icon {
        color: var(--color-info);
      }

      @media (max-width: 640px) {
        .toast-container {
          left: 16px;
          right: 16px;
          bottom: 16px;
          width: auto;
        }
      }
    `,
  ],
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'x-circle';
      case 'warning':
        return 'alert-circle';
      default:
        return 'info';
    }
  }
}

