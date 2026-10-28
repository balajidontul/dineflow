import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantTable } from '../../../../core/models/table.model';
import { Restaurant } from '../../../../core/models/restaurant.model';
import { TableService } from '../../../../core/services/table.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-qr-modal',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  template: `
    @if (isOpen && table) {
      <div class="qr-modal-overlay" (click)="close()">
        <div class="qr-modal-dialog" (click)="$event.stopPropagation()">
          <!-- Modal Top Toolbar (Hidden on Print) -->
          <div class="modal-toolbar no-print">
            <div class="toolbar-title">
              <h3>Table {{ table.tableNumber }} Stand QR</h3>
              <p>Printable table tent card for physical dining placement</p>
            </div>

            <div class="toolbar-buttons">
              <app-button variant="outline" size="sm" iconLeft="download" (btnClick)="downloadQR()">
                Download PNG
              </app-button>
              <app-button variant="primary" size="sm" iconLeft="printer" (btnClick)="printQR()">
                Print Stand
              </app-button>
              <button class="close-x-btn" (click)="close()" aria-label="Close dialog">
                <app-icon name="x" [size]="18"></app-icon>
              </button>
            </div>
          </div>

          <!-- Printable Table Stand Canvas -->
          <div class="printable-stand-sheet" id="printableTableStand">
            <div class="stand-border-box">
              <!-- Top Branding Header -->
              <div class="stand-header">
                <div class="stand-logo-circle">
                  <img [src]="restaurant.logoUrl" alt="Restaurant Logo" />
                </div>
                <h1 class="stand-restaurant-name">{{ restaurant.name }}</h1>
                @if (restaurant.localName) {
                  <span class="stand-marathi-name">{{ restaurant.localName }}</span>
                }
                <p class="stand-location">{{ restaurant.city }} • Authentic Dining</p>
              </div>

              <!-- Call to Action Banner -->
              <div class="scan-instructions-banner">
                <span class="instruction-lead">SCAN TO VIEW MENU</span>
                <span class="instruction-marathi">मेनू पाहण्यासाठी स्कॅन करा</span>
              </div>

              <!-- High-Res Generated QR Code Box -->
              <div class="qr-code-frame">
                @if (qrDataUrl()) {
                  <img [src]="qrDataUrl()" alt="QR Code for Table" class="qr-image" />
                } @else {
                  <div class="qr-loading">Generating QR...</div>
                }
              </div>

              <!-- Prominent Table Number Callout -->
              <div class="table-identifier-block">
                <span class="table-prefix">TABLE</span>
                <span class="table-huge-num">{{ table.tableNumber }}</span>
              </div>

              <!-- Bottom Reassurance -->
              <div class="stand-footer">
                <div class="footer-feature">
                  <app-icon name="smartphone" [size]="16" color="var(--color-primary)"></app-icon>
                  <span>Order directly from your phone</span>
                </div>
                <div class="footer-feature">
                  <app-icon name="shield-check" [size]="16" color="#16a34a"></app-icon>
                  <span>No App Download Required</span>
                </div>
              </div>

              <div class="powered-by-tag">
                Powered by DineFlow SaaS
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .qr-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(20, 18, 17, 0.7);
        backdrop-filter: blur(5px);
        z-index: 1200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: fadeIn 200ms ease;
      }

      .qr-modal-dialog {
        background: #ffffff;
        border-radius: var(--radius-xl);
        max-width: 520px;
        width: 100%;
        max-height: 94vh;
        overflow-y: auto;
        box-shadow: var(--shadow-xl);
        display: flex;
        flex-direction: column;
      }

      .modal-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--color-surface-border);
        background: var(--color-surface-subtle);
      }

      .toolbar-title h3 {
        font-size: 1.05rem;
        font-weight: 800;
      }
      .toolbar-title p {
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }

      .toolbar-buttons {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .close-x-btn {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        background: #ffffff;
        border: 1px solid var(--color-surface-border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-muted);
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .close-x-btn:hover {
        color: var(--color-danger);
      }

      /* Printable Stand Styling */
      .printable-stand-sheet {
        padding: 30px;
        background: #ffffff;
        display: flex;
        justify-content: center;
      }

      .stand-border-box {
        width: 100%;
        max-width: 380px;
        border: 2px solid #1a1817;
        border-radius: 20px;
        padding: 28px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        background: #ffffff;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }

      .stand-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        margin-bottom: 16px;
      }

      .stand-logo-circle {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid var(--color-primary);
        margin-bottom: 6px;
      }
      .stand-logo-circle img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .stand-restaurant-name {
        font-size: 1.35rem;
        font-weight: 800;
        color: #1a1817;
        letter-spacing: -0.01em;
      }

      .stand-marathi-name {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--color-primary);
      }

      .stand-location {
        font-size: 0.75rem;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .scan-instructions-banner {
        width: 100%;
        background: linear-gradient(135deg, #e05326, #c94317);
        color: #ffffff;
        padding: 8px 12px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        margin-bottom: 16px;
      }

      .instruction-lead {
        font-size: 0.875rem;
        font-weight: 800;
        letter-spacing: 0.05em;
      }

      .instruction-marathi {
        font-size: 0.75rem;
        opacity: 0.9;
      }

      .qr-code-frame {
        width: 210px;
        height: 210px;
        background: #ffffff;
        padding: 8px;
        border: 2px dashed #e05326;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 18px;
      }

      .qr-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .qr-loading {
        font-size: 0.8125rem;
        color: #888;
      }

      .table-identifier-block {
        display: flex;
        align-items: baseline;
        gap: 6px;
        padding: 6px 20px;
        background: #f7f5f2;
        border: 1px solid #ddd;
        border-radius: 12px;
        margin-bottom: 16px;
      }

      .table-prefix {
        font-size: 0.875rem;
        font-weight: 800;
        color: #666;
        letter-spacing: 0.06em;
      }

      .table-huge-num {
        font-size: 2.1rem;
        font-weight: 900;
        color: #1a1817;
        line-height: 1;
      }

      .stand-footer {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.775rem;
        font-weight: 600;
        color: #444;
        width: 100%;
        padding-top: 10px;
        border-top: 1px dashed #e0e0e0;
      }

      .footer-feature {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .powered-by-tag {
        margin-top: 14px;
        font-size: 0.65rem;
        font-weight: 700;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      @media print {
        .no-print {
          display: none !important;
        }
        .qr-modal-overlay {
          position: static !important;
          background: transparent !important;
          padding: 0 !important;
        }
        .qr-modal-dialog {
          box-shadow: none !important;
          border-radius: 0 !important;
          max-width: 100% !important;
        }
      }
    `,
  ],
})
export class QrModalComponent implements OnChanges {
  private tableService = inject(TableService);
  private toastService = inject(ToastService);

  @Input() isOpen = false;
  @Input() table: RestaurantTable | null = null;
  @Input() restaurant!: Restaurant;

  @Output() closed = new EventEmitter<void>();

  public qrDataUrl = signal<string>('');

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.isOpen && this.table) {
      // Build full customer URL e.g. window.location.origin + /r/hotel-jagdamba/t/abc123
      const fullUrl = `${window.location.origin}/r/${this.restaurant.slug}/t/${this.table.token}`;
      const dataUrl = await this.tableService.generateQRCodeDataUrl(fullUrl);
      this.qrDataUrl.set(dataUrl);
    }
  }

  close() {
    this.closed.emit();
  }

  printQR() {
    window.print();
  }

  downloadQR() {
    const dataUrl = this.qrDataUrl();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `QR-${this.table?.tableNumber}-${this.restaurant.slug}.png`;
    link.click();

    this.toastService.success(`Downloaded QR Code for Table ${this.table?.tableNumber}!`, 'File Downloaded');
  }
}
