import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableService } from '../../../../core/services/table.service';
import { RestaurantService } from '../../../../core/services/restaurant.service';
import { ToastService } from '../../../../core/services/toast.service';
import { RestaurantTable, TableStatus } from '../../../../core/models/table.model';
import { QrModalComponent } from '../qr-modal/qr-modal.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-tables-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    QrModalComponent,
    IconComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
  ],
  template: `
    <div class="tables-page animate-fade-in">
      <!-- Page Header -->
      <div class="tables-header">
        <div>
          <h1 class="page-title">Dining Tables & QR Codes</h1>
          <p class="page-subtitle">Generate print-ready QR codes, manage dining zones, and track real-time occupancy</p>
        </div>

        <div class="header-actions">
          <app-button variant="primary" iconLeft="plus" (btnClick)="openAddTableModal()">
            Add New Table
          </app-button>
        </div>
      </div>

      <!-- Quick Summary Metric Bar -->
      <div class="tables-summary-grid">
        <div class="summary-pill total">
          <span class="pill-number">{{ tableService.tables().length }}</span>
          <span class="pill-label">Total Tables</span>
        </div>
        <div class="summary-pill available">
          <span class="pill-number">{{ availableCount() }}</span>
          <span class="pill-label">Available</span>
        </div>
        <div class="summary-pill occupied">
          <span class="pill-number">{{ occupiedCount() }}</span>
          <span class="pill-label">Occupied</span>
        </div>
        <div class="summary-pill ordering">
          <span class="pill-number">{{ orderingCount() }}</span>
          <span class="pill-label">Ordering Now</span>
        </div>
        <div class="summary-pill payment">
          <span class="pill-number">{{ paymentCount() }}</span>
          <span class="pill-label">Awaiting Bill</span>
        </div>
      </div>

      <!-- Table Cards Grid -->
      <div class="tables-grid">
        @for (table of tableService.tables(); track table.id) {
          <div class="table-card df-card" [class]="'status-border-' + table.status">
            <!-- Card Header -->
            <div class="table-card-top">
              <div class="table-title-area">
                <h3 class="table-title">Table {{ table.tableNumber }}</h3>
                <span class="table-floor">{{ table.floor || 'Dining Hall' }}</span>
              </div>

              <app-badge [variant]="table.status" size="sm">
                {{ formatStatus(table.status) }}
              </app-badge>
            </div>

            <!-- Table Info Body -->
            <div class="table-card-body">
              <div class="capacity-line">
                <app-icon name="users" [size]="15" color="var(--color-text-muted)"></app-icon>
                <span>Capacity: <strong>{{ table.capacity }} Guests</strong></span>
              </div>

              @if (table.activeGuests) {
                <div class="guests-line">
                  <span class="dot-active"></span>
                  <span>{{ table.activeGuests }} seated • {{ table.lastActivity }}</span>
                </div>
              }

              <!-- QR Mini Preview Block -->
              <div class="qr-preview-box" (click)="openQrModal(table)">
                <div class="qr-symbol-box">
                  <app-icon name="qr-code" [size]="48" color="var(--color-primary)"></app-icon>
                </div>
                <div class="qr-hover-overlay">
                  <app-icon name="eye" [size]="18" color="#ffffff"></app-icon>
                  <span>View Printable QR</span>
                </div>
              </div>
            </div>

            <!-- Status Quick Switch Dropdown -->
            <div class="status-quick-switch">
              <label class="status-label">Update Status:</label>
              <select
                [value]="table.status"
                (change)="onStatusChange(table, $event)"
                class="status-dropdown"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="ordering">Ordering</option>
                <option value="waiting_payment">Waiting for Payment</option>
              </select>
            </div>

            <!-- Card Actions Footer -->
            <div class="table-card-footer">
              <button
                type="button"
                class="table-action-btn primary"
                (click)="openQrModal(table)"
                title="View & Print QR Stand"
              >
                <app-icon name="printer" [size]="15"></app-icon>
                <span>Print QR</span>
              </button>

              <a
                [routerLink]="['/r', restaurantService.restaurant().slug, 't', table.token]"
                target="_blank"
                class="table-action-btn secondary"
                title="Open customer view for this table"
              >
                <app-icon name="external-link" [size]="15"></app-icon>
                <span>Test Menu</span>
              </a>
            </div>
          </div>
        }
      </div>

      <!-- Printable QR Code Modal -->
      <app-qr-modal
        [isOpen]="isQrModalOpen()"
        [table]="selectedTableForQr()"
        [restaurant]="restaurantService.restaurant()"
        (closed)="closeQrModal()"
      ></app-qr-modal>

      <!-- Add Table Modal Dialog -->
      <app-modal
        [isOpen]="isAddModalOpen()"
        title="Add New Dining Table"
        subtitle="Register table number, capacity, and auto-generate QR payload"
        size="md"
        (closed)="closeAddModal()"
      >
        <div class="add-table-form">
          <div class="form-group">
            <label class="form-label" for="tblNum">Table Number / Label *</label>
            <input
              id="tblNum"
              type="text"
              [(ngModel)]="newTableData.tableNumber"
              placeholder="e.g. T13, T14, Outdoor-01..."
              class="df-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="tblCap">Seating Capacity (Guests) *</label>
            <input
              id="tblCap"
              type="number"
              min="1"
              max="30"
              [(ngModel)]="newTableData.capacity"
              class="df-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="tblFloor">Dining Zone / Floor</label>
            <select id="tblFloor" [(ngModel)]="newTableData.floor" class="df-select">
              <option value="Ground Floor Garden">Ground Floor Garden</option>
              <option value="Main Dining Hall">Main Dining Hall</option>
              <option value="First Floor AC Section">First Floor AC Section</option>
              <option value="Family Lounge">Family Lounge</option>
              <option value="Terrace View">Terrace View</option>
            </select>
          </div>
        </div>

        <div modal-footer>
          <app-button variant="outline" (btnClick)="closeAddModal()">Cancel</app-button>
          <app-button
            variant="primary"
            (btnClick)="saveNewTable()"
            [disabled]="!newTableData.tableNumber.trim()"
          >
            Create Table & Generate QR
          </app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [
    `
      .tables-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .tables-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .page-title {
        font-size: 1.75rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--color-text-primary);
      }

      .page-subtitle {
        color: var(--color-text-secondary);
        font-size: 0.9375rem;
        margin-top: 2px;
      }

      /* Summary Bar */
      .tables-summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 14px;
      }

      .summary-pill {
        padding: 14px 18px;
        background: var(--color-surface);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        box-shadow: var(--shadow-xs);
      }
      .summary-pill.total { border-left: 4px solid var(--color-secondary); }
      .summary-pill.available { border-left: 4px solid var(--color-success); }
      .summary-pill.occupied { border-left: 4px solid var(--color-danger); }
      .summary-pill.ordering { border-left: 4px solid var(--color-info); }
      .summary-pill.payment { border-left: 4px solid var(--color-warning); }

      .pill-number {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .pill-label {
        font-size: 0.775rem;
        font-weight: 600;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      /* Grid of Table Cards */
      .tables-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }

      .table-card {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        border-radius: var(--radius-xl);
        position: relative;
        transition: transform var(--transition-fast), box-shadow var(--transition-normal);
      }
      .table-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .status-border-available { border-top: 4px solid #16a34a; }
      .status-border-occupied { border-top: 4px solid #dc2626; }
      .status-border-ordering { border-top: 4px solid #2563eb; }
      .status-border-waiting_payment { border-top: 4px solid #d97706; }

      .table-card-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }

      .table-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .table-floor {
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }

      .table-card-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .capacity-line {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.825rem;
        color: var(--color-text-secondary);
      }

      .guests-line {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        color: var(--color-primary);
        font-weight: 600;
      }

      .dot-active {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: var(--color-primary);
        animation: pulseGlow 1.4s infinite;
      }

      /* QR Preview Box with hover effect */
      .qr-preview-box {
        margin: 6px 0;
        height: 110px;
        background: var(--color-surface-subtle);
        border: 1px dashed rgba(224, 83, 38, 0.4);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        overflow: hidden;
      }

      .qr-hover-overlay {
        position: absolute;
        inset: 0;
        background: rgba(224, 83, 38, 0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: #ffffff;
        font-size: 0.75rem;
        font-weight: 700;
        opacity: 0;
        transition: opacity var(--transition-fast);
      }
      .qr-preview-box:hover .qr-hover-overlay {
        opacity: 1;
      }

      /* Status Switcher */
      .status-quick-switch {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .status-label {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
      }

      .status-dropdown {
        padding: 6px 10px;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-sm);
        background: var(--color-surface-subtle);
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-text-primary);
        outline: none;
        cursor: pointer;
      }

      /* Card Footer */
      .table-card-footer {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: auto;
        padding-top: 10px;
        border-top: 1px solid var(--color-surface-border);
      }

      .table-action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px;
        border-radius: var(--radius-md);
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
        border: 1px solid var(--color-surface-border);
      }
      .table-action-btn.primary {
        background: var(--color-primary-light);
        color: var(--color-primary);
        border-color: rgba(224, 83, 38, 0.3);
      }
      .table-action-btn.primary:hover {
        background: var(--color-primary);
        color: #ffffff;
      }

      .table-action-btn.secondary {
        background: var(--color-surface-subtle);
        color: var(--color-text-secondary);
      }
      .table-action-btn.secondary:hover {
        background: #ffffff;
        color: var(--color-text-primary);
      }

      /* Add Table Form */
      .add-table-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-label {
        font-size: 0.875rem;
        font-weight: 600;
      }

      .df-input,
      .df-select {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        font-size: 0.9375rem;
        outline: none;
      }
      .df-input:focus,
      .df-select:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }
    `,
  ],
})
export class TablesListComponent implements OnInit {
  protected readonly tableService = inject(TableService);
  protected readonly restaurantService = inject(RestaurantService);
  private readonly toastService = inject(ToastService);

  public readonly isQrModalOpen = signal<boolean>(false);
  public readonly selectedTableForQr = signal<RestaurantTable | null>(null);

  public readonly isAddModalOpen = signal<boolean>(false);
  public newTableData = {
    tableNumber: '',
    capacity: 4,
    floor: 'Main Dining Hall',
  };

  public readonly availableCount = computed(
    () => this.tableService.tables().filter((t) => t.status === 'available').length
  );
  public readonly occupiedCount = computed(
    () => this.tableService.tables().filter((t) => t.status === 'occupied').length
  );
  public readonly orderingCount = computed(
    () => this.tableService.tables().filter((t) => t.status === 'ordering').length
  );
  public readonly paymentCount = computed(
    () => this.tableService.tables().filter((t) => t.status === 'waiting_payment').length
  );

  ngOnInit(): void {
    this.tableService.getTables().subscribe();
  }

  formatStatus(status: TableStatus): string {
    switch (status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'ordering':
        return 'Ordering';
      case 'waiting_payment':
        return 'Bill Waiting';
    }
  }

  onStatusChange(table: RestaurantTable, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as TableStatus;
    this.tableService.updateTableStatus(table.id, newStatus).subscribe(() => {
      this.toastService.info(`Table ${table.tableNumber} set to ${this.formatStatus(newStatus)}`, 'Status Updated');
    });
  }

  openQrModal(table: RestaurantTable) {
    this.selectedTableForQr.set(table);
    this.isQrModalOpen.set(true);
  }

  closeQrModal() {
    this.isQrModalOpen.set(false);
    this.selectedTableForQr.set(null);
  }

  openAddTableModal() {
    const nextNum = `T${String(this.tableService.tables().length + 1).padStart(2, '0')}`;
    this.newTableData = {
      tableNumber: nextNum,
      capacity: 4,
      floor: 'Main Dining Hall',
    };
    this.isAddModalOpen.set(true);
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
  }

  saveNewTable() {
    if (!this.newTableData.tableNumber.trim()) return;

    this.tableService
      .addTable({
        tableNumber: this.newTableData.tableNumber,
        capacity: Number(this.newTableData.capacity) || 4,
        floor: this.newTableData.floor,
        status: 'available',
        token: `tbl-${this.newTableData.tableNumber.toLowerCase()}`,
      })
      .subscribe((created) => {
        this.toastService.success(`Table ${created.tableNumber} added successfully!`, 'Table Created');
        this.closeAddModal();
      });
  }
}

