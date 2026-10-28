import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { TableService } from '../../../../core/services/table.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { VegBadgeComponent } from '../../../../shared/components/veg-badge/veg-badge.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { CurrencyInrPipe } from '../../../../shared/pipes/currency-inr.pipe';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';

type FilterTab = 'all' | 'placed' | 'preparing' | 'ready' | 'served' | 'completed';

@Component({
  selector: 'app-orders-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BadgeComponent,
    ButtonComponent,
    IconComponent,
    VegBadgeComponent,
    EmptyStateComponent,
    CurrencyInrPipe,
    TimeAgoPipe,
  ],
  template: `
    <div class="orders-page animate-fade-in">
      <!-- New Order Audio/Visual Alert Banner -->
      @if (orderService.hasNewOrderAlert()) {
        <div class="incoming-alert-banner">
          <div class="alert-content">
            <span class="pulsing-bell">
              <app-icon name="bell" [size]="20" color="#ffffff"></app-icon>
            </span>
            <div>
              <strong class="alert-title">New Table Order Arrived!</strong>
              <p class="alert-sub">Order #ORD-1042 just placed for Table T08. Ready for kitchen confirmation.</p>
            </div>
          </div>

          <div class="alert-actions">
            <button class="dismiss-alert-btn" (click)="orderService.clearNewOrderAlert()">
              Acknowledge
            </button>
          </div>
        </div>
      }

      <!-- Page Header -->
      <div class="orders-header">
        <div>
          <h1 class="page-title">Live Orders Dashboard</h1>
          <p class="page-subtitle">Track, prepare, and fulfill digital menu orders across all dining tables</p>
        </div>

        <div class="header-tools">
          <!-- Refresh Simulation Button -->
          <app-button
            variant="outline"
            iconLeft="refresh-cw"
            (btnClick)="refreshOrders()"
          >
            Refresh
          </app-button>
        </div>
      </div>

      <!-- Filter Controls & Search -->
      <div class="orders-control-bar df-card">
        <!-- Tabs -->
        <div class="status-tabs-row">
          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'all'"
            (click)="selectedTab.set('all')"
          >
            <span>All Orders</span>
            <span class="tab-count">{{ orderService.orders().length }}</span>
          </button>

          <button
            class="tab-btn new-tab"
            [class.active]="selectedTab() === 'placed'"
            (click)="selectedTab.set('placed')"
          >
            <span class="dot-new"></span>
            <span>New</span>
            <span class="tab-count count-new">{{ orderService.countsByStatus().placed }}</span>
          </button>

          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'preparing'"
            (click)="selectedTab.set('preparing')"
          >
            <span>Preparing</span>
            <span class="tab-count">{{ orderService.countsByStatus().preparing + orderService.countsByStatus().accepted }}</span>
          </button>

          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'ready'"
            (click)="selectedTab.set('ready')"
          >
            <span>Ready</span>
            <span class="tab-count">{{ orderService.countsByStatus().ready }}</span>
          </button>

          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'served'"
            (click)="selectedTab.set('served')"
          >
            <span>Served</span>
            <span class="tab-count">{{ orderService.countsByStatus().served }}</span>
          </button>

          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'completed'"
            (click)="selectedTab.set('completed')"
          >
            <span>Completed</span>
            <span class="tab-count">{{ orderService.countsByStatus().completed }}</span>
          </button>
        </div>

        <!-- Search & Table Filter -->
        <div class="search-filter-inputs">
          <div class="search-box">
            <app-icon name="search" [size]="16" class="search-icon"></app-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search by order #, customer name..."
              class="search-input"
            />
          </div>

          <select [value]="selectedTableFilter()" (change)="onTableFilterChange($event)" class="table-select">
            <option value="all">All Tables</option>
            @for (tbl of tableService.tables(); track tbl.id) {
              <option [value]="tbl.tableNumber">{{ tbl.tableNumber }} (Cap {{ tbl.capacity }})</option>
            }
          </select>
        </div>
      </div>

      <!-- Orders Grid -->
      @if (filteredOrders().length > 0) {
        <div class="orders-cards-grid">
          @for (order of filteredOrders(); track order.id) {
            <div
              class="order-card df-card"
              [class.card-new-pulse]="order.status === 'placed'"
            >
              <!-- Card Top Header -->
              <div class="order-card-header">
                <div class="order-id-group">
                  <span class="order-number-text">{{ order.orderNumber }}</span>
                  <span class="order-time-text">
                    <app-icon name="clock" [size]="13"></app-icon>
                    {{ order.createdAt | timeAgo }}
                  </span>
                </div>

                <div class="table-pill">
                  <span class="table-name">Table {{ order.tableNumber }}</span>
                </div>
              </div>

              <!-- Customer info if present -->
              @if (order.customerName) {
                <div class="customer-tag">
                  <app-icon name="user" [size]="14"></app-icon>
                  <span>{{ order.customerName }}</span>
                  @if (order.customerPhone) {
                    <span class="phone-muted">({{ order.customerPhone }})</span>
                  }
                </div>
              }

              <!-- Items Breakdown -->
              <div class="order-items-box">
                @for (item of order.items; track item.id) {
                  <div class="order-item-line">
                    <div class="item-left">
                      <app-veg-badge [veg]="item.veg"></app-veg-badge>
                      <span class="item-qty">{{ item.quantity }} ×</span>
                      <span class="item-name">{{ item.name }}</span>
                    </div>
                    <span class="item-price">{{ (item.price * item.quantity) | currencyInr }}</span>
                  </div>
                  @if (item.specialInstructions) {
                    <div class="item-instruction-sub">
                      "{{ item.specialInstructions }}"
                    </div>
                  }
                }
              </div>

              <!-- Special Cooking Notes -->
              @if (order.specialInstructions) {
                <div class="special-notes-box">
                  <app-icon name="info" [size]="15" color="var(--color-primary)"></app-icon>
                  <span class="notes-text">"{{ order.specialInstructions }}"</span>
                </div>
              }

              <!-- Bill Breakdown Summary -->
              <div class="order-total-row">
                <div class="payment-badge-combo">
                  <span class="total-label">Total Amount:</span>
                  <span class="total-val">{{ order.grandTotal | currencyInr }}</span>
                </div>

                <div class="payment-status-pill" [class.is-paid]="order.paymentStatus === 'paid'">
                  <app-icon
                    [name]="order.paymentStatus === 'paid' ? 'check-circle' : 'credit-card'"
                    [size]="13"
                  ></app-icon>
                  <span>{{ order.paymentStatus === 'paid' ? 'Paid (' + (order.paymentMethod | uppercase) + ')' : 'Payment Pending' }}</span>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="card-status-pill-row">
                <app-badge [variant]="order.status" size="md">
                  Status: {{ order.status | uppercase }}
                </app-badge>
              </div>

              <!-- Context-Aware Order Action Buttons -->
              <div class="card-action-bar">
                @if (order.status === 'placed') {
                  <button class="order-action-btn accept" (click)="updateStatus(order, 'accepted')">
                    <app-icon name="check" [size]="16"></app-icon>
                    <span>Accept Order</span>
                  </button>
                  <button class="order-action-btn cancel" (click)="updateStatus(order, 'cancelled')">
                    <span>Cancel</span>
                  </button>
                } @else if (order.status === 'accepted') {
                  <button class="order-action-btn prepare" (click)="updateStatus(order, 'preparing')">
                    <app-icon name="flame" [size]="16"></app-icon>
                    <span>Start Preparing</span>
                  </button>
                } @else if (order.status === 'preparing') {
                  <button class="order-action-btn ready" (click)="updateStatus(order, 'ready')">
                    <app-icon name="check-circle" [size]="16"></app-icon>
                    <span>Mark Ready</span>
                  </button>
                } @else if (order.status === 'ready') {
                  <button class="order-action-btn serve" (click)="updateStatus(order, 'served')">
                    <app-icon name="utensils" [size]="16"></app-icon>
                    <span>Mark Served</span>
                  </button>
                } @else if (order.status === 'served') {
                  <button class="order-action-btn complete" (click)="updateStatus(order, 'completed')">
                    <app-icon name="check-circle" [size]="16"></app-icon>
                    <span>Complete Order</span>
                  </button>
                } @else if (order.status === 'completed') {
                  <span class="completed-msg">
                    <app-icon name="check" [size]="16" color="#16a34a"></app-icon>
                    <span>Order Fulfilled</span>
                  </span>
                } @else if (order.status === 'cancelled') {
                  <span class="cancelled-msg">Order Cancelled</span>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <app-empty-state
          icon="clipboard-list"
          title="No Orders In This Stage"
          description="There are currently no orders matching your selected status filter or table selection."
        ></app-empty-state>
      }
    </div>
  `,
  styles: [
    `
      .orders-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* Flashing Incoming Alert */
      .incoming-alert-banner {
        background: linear-gradient(135deg, #e05326, #b33910);
        color: #ffffff;
        padding: 16px 22px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 8px 24px var(--color-primary-glow);
        animation: slideDown 300ms ease;
      }

      .alert-content {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .pulsing-bell {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulseGlow 1.2s infinite;
      }

      .alert-title {
        font-size: 1.05rem;
        font-weight: 800;
      }

      .alert-sub {
        font-size: 0.8125rem;
        opacity: 0.95;
      }

      .dismiss-alert-btn {
        padding: 8px 16px;
        background: #ffffff;
        color: var(--color-primary);
        font-weight: 700;
        font-size: 0.8125rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: transform var(--transition-fast);
      }
      .dismiss-alert-btn:hover {
        transform: scale(1.03);
      }

      .orders-header {
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

      /* Control Bar */
      .orders-control-bar {
        padding: 12px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .status-tabs-row {
        display: flex;
        align-items: center;
        gap: 6px;
        overflow-x: auto;
      }

      .tab-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: var(--radius-full);
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
        white-space: nowrap;
      }
      .tab-btn:hover {
        background: var(--color-surface-subtle);
        color: var(--color-text-primary);
      }
      .tab-btn.active {
        background: var(--color-secondary);
        color: #ffffff;
      }

      .tab-count {
        font-size: 0.725rem;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: var(--radius-full);
        background: rgba(0, 0, 0, 0.08);
      }
      .tab-btn.active .tab-count {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
      }

      .dot-new {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: var(--color-primary);
        animation: pulseGlow 1.2s infinite;
      }

      .count-new {
        background: #fef3c7;
        color: #b45309;
      }

      .search-filter-inputs {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .search-box {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 12px;
        color: var(--color-text-muted);
        pointer-events: none;
      }

      .search-input {
        padding: 8px 14px 8px 36px;
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        font-size: 0.8125rem;
        width: 220px;
        outline: none;
      }
      .search-input:focus {
        border-color: var(--color-primary);
        background: #ffffff;
      }

      .table-select {
        padding: 8px 14px;
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-text-primary);
        outline: none;
        cursor: pointer;
      }

      /* Orders Cards Grid */
      .orders-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 22px;
      }

      .order-card {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        position: relative;
        border-radius: var(--radius-xl);
        transition: transform var(--transition-fast), box-shadow var(--transition-normal);
      }
      .order-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      .order-card.card-new-pulse {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px var(--color-primary-light);
      }

      .order-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }

      .order-id-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .order-number-text {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--color-text-primary);
        letter-spacing: -0.01em;
      }

      .order-time-text {
        font-size: 0.75rem;
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .table-pill {
        padding: 6px 14px;
        background: var(--color-primary-light);
        border: 1px solid rgba(224, 83, 38, 0.25);
        border-radius: var(--radius-full);
      }

      .table-name {
        font-weight: 800;
        font-size: 0.875rem;
        color: var(--color-primary);
      }

      .customer-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
        font-weight: 600;
      }
      .phone-muted {
        color: var(--color-text-muted);
        font-weight: 400;
      }

      .order-items-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: var(--color-surface-subtle);
        border-radius: var(--radius-md);
      }

      .order-item-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.875rem;
      }

      .item-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .item-qty {
        font-weight: 700;
        color: var(--color-primary);
      }

      .item-name {
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .item-price {
        font-weight: 700;
        color: var(--color-text-secondary);
        font-size: 0.8125rem;
      }

      .item-instruction-sub {
        font-size: 0.725rem;
        color: var(--color-primary);
        font-style: italic;
        padding-left: 26px;
      }

      .special-notes-box {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 10px 12px;
        background: #fff8f5;
        border: 1px solid #fed7aa;
        border-radius: var(--radius-md);
      }

      .notes-text {
        font-size: 0.8125rem;
        color: #9a3412;
        font-style: italic;
      }

      .order-total-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 10px;
        border-top: 1px dashed var(--color-surface-border);
      }

      .payment-badge-combo {
        display: flex;
        align-items: baseline;
        gap: 6px;
      }

      .total-label {
        font-size: 0.75rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        font-weight: 600;
      }

      .total-val {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .payment-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.725rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: var(--radius-full);
        background: #fffbeb;
        color: #b45309;
        border: 1px solid #fde68a;
      }
      .payment-status-pill.is-paid {
        background: #ecfdf5;
        color: #047857;
        border-color: #a7f3d0;
      }

      .card-status-pill-row {
        display: flex;
        align-items: center;
      }

      .card-action-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: auto;
      }

      .order-action-btn {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        transition: all var(--transition-fast);
        border: 1px solid transparent;
      }

      .order-action-btn.accept {
        background: var(--color-primary);
        color: #ffffff;
      }
      .order-action-btn.accept:hover {
        background: var(--color-primary-hover);
      }

      .order-action-btn.prepare {
        background: #ea580c;
        color: #ffffff;
      }
      .order-action-btn.prepare:hover {
        background: #c2410c;
      }

      .order-action-btn.ready {
        background: #16a34a;
        color: #ffffff;
      }
      .order-action-btn.ready:hover {
        background: #15803d;
      }

      .order-action-btn.serve {
        background: #7c3aed;
        color: #ffffff;
      }
      .order-action-btn.serve:hover {
        background: #6d28d9;
      }

      .order-action-btn.complete {
        background: var(--color-secondary);
        color: #ffffff;
      }
      .order-action-btn.complete:hover {
        background: #000000;
      }

      .order-action-btn.cancel {
        flex: 0 0 auto;
        background: transparent;
        color: var(--color-danger);
        border-color: var(--color-surface-border);
      }
      .order-action-btn.cancel:hover {
        background: #fef2f2;
      }

      .completed-msg {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8125rem;
        font-weight: 700;
        color: #16a34a;
      }

      .cancelled-msg {
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--color-danger);
      }

      @media (max-width: 768px) {
        .orders-control-bar {
          flex-direction: column;
          align-items: stretch;
        }
        .search-filter-inputs {
          flex-direction: column;
        }
        .search-input {
          width: 100%;
        }
      }
    `,
  ],
})
export class OrdersBoardComponent {
  protected readonly orderService = inject(OrderService);
  protected readonly tableService = inject(TableService);

  public readonly selectedTab = signal<FilterTab>('all');
  public readonly searchQuery = signal<string>('');
  public readonly selectedTableFilter = signal<string>('all');

  public readonly filteredOrders = computed(() => {
    let list = this.orderService.orders();

    // Status Tab filter
    const tab = this.selectedTab();
    if (tab === 'placed') {
      list = list.filter((o) => o.status === 'placed');
    } else if (tab === 'preparing') {
      list = list.filter((o) => o.status === 'preparing' || o.status === 'accepted');
    } else if (tab === 'ready') {
      list = list.filter((o) => o.status === 'ready');
    } else if (tab === 'served') {
      list = list.filter((o) => o.status === 'served');
    } else if (tab === 'completed') {
      list = list.filter((o) => o.status === 'completed');
    }

    // Table filter
    const tbl = this.selectedTableFilter();
    if (tbl !== 'all') {
      list = list.filter((o) => o.tableNumber === tbl);
    }

    // Search query
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    return list;
  });

  onTableFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedTableFilter.set(target.value);
  }

  updateStatus(order: Order, newStatus: OrderStatus) {
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe();
  }

  refreshOrders() {
    this.orderService.getOrders().subscribe();
  }
}

