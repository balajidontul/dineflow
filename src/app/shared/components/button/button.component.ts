import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="'btn btn-' + variant + ' btn-' + size"
      [class.btn-full]="fullWidth"
      [class.btn-loading]="loading"
      (click)="handleClick($event)"
    >
      @if (loading) {
        <span class="spinner"></span>
      } @else {
        @if (iconLeft) {
          <app-icon [name]="iconLeft" [size]="iconSize" class="btn-icon-left"></app-icon>
        }
        <span class="btn-content">
          <ng-content></ng-content>
        </span>
        @if (iconRight) {
          <app-icon [name]="iconRight" [size]="iconSize" class="btn-icon-right"></app-icon>
        }
      }
    </button>
  `,
  styles: [
    `
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: inherit;
        font-weight: 600;
        border-radius: var(--radius-md);
        border: 1px solid transparent;
        cursor: pointer;
        transition: all var(--transition-fast);
        white-space: nowrap;
        user-select: none;
        outline: none;
      }

      .btn:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }

      .btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        box-shadow: none !important;
        transform: none !important;
      }

      .btn-full {
        width: 100%;
      }

      /* Sizes */
      .btn-sm {
        height: 34px;
        padding: 0 12px;
        font-size: 0.8125rem;
        border-radius: var(--radius-sm);
      }

      .btn-md {
        height: 42px;
        padding: 0 18px;
        font-size: 0.9375rem;
      }

      .btn-lg {
        height: 50px;
        padding: 0 24px;
        font-size: 1.0625rem;
        border-radius: var(--radius-lg);
      }

      /* Variants */
      .btn-primary {
        background-color: var(--color-primary);
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(224, 83, 38, 0.25);
      }
      .btn-primary:hover:not(:disabled) {
        background-color: var(--color-primary-hover);
        box-shadow: 0 4px 14px rgba(224, 83, 38, 0.35);
        transform: translateY(-1px);
      }
      .btn-primary:active:not(:disabled) {
        transform: translateY(0);
      }

      .btn-secondary {
        background-color: var(--color-secondary);
        color: #ffffff;
      }
      .btn-secondary:hover:not(:disabled) {
        background-color: var(--color-secondary-hover);
        transform: translateY(-1px);
      }

      .btn-outline {
        background-color: transparent;
        border-color: var(--color-surface-border);
        color: var(--color-text-primary);
      }
      .btn-outline:hover:not(:disabled) {
        background-color: var(--color-surface-subtle);
        border-color: rgba(224, 83, 38, 0.4);
        color: var(--color-primary);
      }

      .btn-ghost {
        background-color: transparent;
        color: var(--color-text-secondary);
      }
      .btn-ghost:hover:not(:disabled) {
        background-color: var(--color-surface-subtle);
        color: var(--color-text-primary);
      }

      .btn-danger {
        background-color: var(--color-danger);
        color: #ffffff;
      }
      .btn-danger:hover:not(:disabled) {
        background-color: #b91c1c;
      }

      .btn-success {
        background-color: var(--color-success);
        color: #ffffff;
      }
      .btn-success:hover:not(:disabled) {
        background-color: #15803d;
      }

      /* Loading Spinner */
      .spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #ffffff;
        animation: spin 0.8s linear infinite;
      }

      .btn-outline .spinner,
      .btn-ghost .spinner {
        border-color: rgba(0, 0, 0, 0.15);
        border-top-color: var(--color-primary);
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;

  @Output() btnClick = new EventEmitter<MouseEvent>();

  get iconSize(): number {
    if (this.size === 'sm') return 15;
    if (this.size === 'lg') return 20;
    return 18;
  }

  handleClick(event: MouseEvent) {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit(event);
    }
  }
}

