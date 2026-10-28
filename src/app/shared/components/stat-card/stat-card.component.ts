import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-title">{{ title }}</span>
        <div class="stat-icon-box" [style.background]="iconBg" [style.color]="iconColor">
          <app-icon [name]="icon" [size]="20"></app-icon>
        </div>
      </div>

      <div class="stat-body">
        <div class="stat-value">{{ value }}</div>

        @if (change !== undefined) {
          <div class="stat-trend" [class.is-positive]="change >= 0" [class.is-negative]="change < 0">
            <app-icon [name]="change >= 0 ? 'trending-up' : 'trending-down'" [size]="14"></app-icon>
            <span class="trend-value">{{ change > 0 ? '+' : '' }}{{ change }}%</span>
            <span class="trend-label">{{ subtitle || 'vs yesterday' }}</span>
          </div>
        } @else if (subtitle) {
          <div class="stat-subtext">{{ subtitle }}</div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .stat-card {
        background: var(--color-surface);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-lg);
        padding: 22px;
        box-shadow: var(--shadow-sm);
        transition: transform var(--transition-fast), box-shadow var(--transition-normal);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .stat-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .stat-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .stat-icon-box {
        width: 42px;
        height: 42px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-value {
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--color-text-primary);
        letter-spacing: -0.02em;
        line-height: 1.2;
        margin-bottom: 6px;
      }

      .stat-trend {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.775rem;
        font-weight: 600;
      }

      .stat-trend.is-positive {
        color: #15803d;
      }

      .stat-trend.is-negative {
        color: #dc2626;
      }

      .trend-label {
        color: var(--color-text-muted);
        font-weight: 400;
        margin-left: 2px;
      }

      .stat-subtext {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
      }
    `,
  ],
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() change?: number;
  @Input() subtitle?: string;
  @Input() icon: string = 'bar-chart';
  @Input() iconBg: string = 'var(--color-primary-light)';
  @Input() iconColor: string = 'var(--color-primary)';
}

