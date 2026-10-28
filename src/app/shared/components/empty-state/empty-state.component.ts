import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  template: `
    <div class="empty-state-card">
      <div class="empty-icon-wrapper">
        <app-icon [name]="icon" [size]="36" color="var(--color-primary)"></app-icon>
      </div>

      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>

      @if (actionLabel) {
        <app-button
          variant="primary"
          size="md"
          [iconLeft]="actionIcon"
          (btnClick)="action.emit()"
          class="empty-action"
        >
          {{ actionLabel }}
        </app-button>
      }

      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .empty-state-card {
        padding: 48px 24px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        max-width: 440px;
        margin: 0 auto;
      }

      .empty-icon-wrapper {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: var(--color-primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
      }

      .empty-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 8px;
      }

      .empty-description {
        font-size: 0.9375rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
        margin-bottom: 24px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon: string = 'inbox';
  @Input() title: string = 'No items found';
  @Input() description: string = 'There is nothing to display here at the moment.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;

  @Output() action = new EventEmitter<void>();
}

