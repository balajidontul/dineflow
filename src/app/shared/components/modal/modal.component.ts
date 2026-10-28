import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal-card" [class]="'modal-' + size" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ title }}</h3>
              @if (subtitle) {
                <p class="modal-subtitle">{{ subtitle }}</p>
              }
            </div>
            <button type="button" class="modal-close-btn" (click)="close()" aria-label="Close modal">
              <app-icon name="x" [size]="20"></app-icon>
            </button>
          </div>

          <div class="modal-body">
            <ng-content select="[body], [modal-body], :not([modal-footer])"></ng-content>
          </div>

          <div class="modal-footer">
            <ng-content select="[modal-footer], [footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(20, 18, 17, 0.6);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 1050;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .modal-card {
        background: var(--color-surface);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xl);
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        animation: slideUp 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        overflow: hidden;
      }

      .modal-sm { max-width: 440px; }
      .modal-md { max-width: 580px; }
      .modal-lg { max-width: 780px; }
      .modal-xl { max-width: 960px; }

      .modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid var(--color-surface-border);
      }

      .modal-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-text-primary);
        line-height: 1.3;
      }

      .modal-subtitle {
        font-size: 0.875rem;
        color: var(--color-text-muted);
        margin-top: 2px;
      }

      .modal-close-btn {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-muted);
        background: var(--color-surface-subtle);
        transition: all var(--transition-fast);
      }
      .modal-close-btn:hover {
        background: var(--color-danger-bg);
        color: var(--color-danger);
      }

      .modal-body {
        padding: 24px;
        overflow-y: auto;
        flex: 1;
      }

      .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid var(--color-surface-border);
        background: var(--color-surface-subtle);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
      }

      @media (max-width: 640px) {
        .modal-backdrop {
          align-items: flex-end;
          padding: 0;
        }
        .modal-card {
          max-height: 92vh;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
      }
    `,
  ],
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closeOnBackdrop: boolean = true;

  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }

  close() {
    this.closed.emit();
  }
}

