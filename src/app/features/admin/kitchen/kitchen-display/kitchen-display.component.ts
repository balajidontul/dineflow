import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/services/order.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { VegBadgeComponent } from '../../../../shared/components/veg-badge/veg-badge.component';

@Component({
  selector: 'app-kitchen-display',
  standalone: true,
  imports: [CommonModule, IconComponent, VegBadgeComponent],
  template: `
    <div class="kds-screen animate-fade-in">
      <!-- KDS Header Bar -->
      <div class="kds-header">
        <div class="header-left">
          <div class="chef-logo">
            <app-icon name="chef-hat" [size]="24" color="#ffffff"></app-icon>
          </div>
          <div>
            <h1 class="kds-title">Kitchen Display System (KDS)</h1>
            <p class="kds-subtitle">Live Kitchen Production Line • High Distance Visibility</p>
          </div>
        </div>

        <div class="header-right">
          <div class="active-orders-pill">
            <span class="pulse-dot"></span>
            <span>{{ activeOrdersCount() }} Cooking Tickets</span>
          </div>
        </div>
      </div>

      <!-- KDS 3-Column Board -->
      <div class="kds-columns-container">
        <!-- Column 1: NEW (Placed & Accepted) -->
        <div class="kds-column column-new">
          <div class="column-header">
            <div class="col-title-group">
              <span class="col-pill new-pill">1</span>
              <h2 class="col-title">NEW ORDERS</h2>
            </div>
            <span class="col-count">{{ newOrders().length }}</span>
          </div>

          <div class="kds-cards-stream">
            @for (order of newOrders(); track order.id) {
              <div class="kds-card card-new">
                <div class="card-kds-head">
                  <div class="table-mega-badge">
                    TABLE {{ order.tableNumber }}
                  </div>
                  <div class="kds-timer timer-new">
                    <app-icon name="clock" [size]="15"></app-icon>
                    <span>{{ getElapsedMinutes(order.createdAt) }} min</span>
                  </div>
                </div>

                <div class="ticket-meta">
                  <span class="ticket-id">{{ order.orderNumber }}</span>
                  <span class="ticket-guest">{{ order.customerName || 'Dine-in Customer' }}</span>
                </div>

                <!-- Items Checklist -->
                <div class="kds-items-list">
                  @for (item of order.items; track item.id) {
                    <div class="kds-item-row">
                      <div class="kds-item-main">
                        <app-veg-badge [veg]="item.veg"></app-veg-badge>
                        <span class="item-qty-huge">{{ item.quantity }} ×</span>
                        <span class="item-name-bold">{{ item.name }}</span>
                      </div>
                      @if (item.specialInstructions) {
                        <div class="item-instruction-warn">
                          ⚠️ {{ item.specialInstructions }}
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Kitchen Special Note Banner -->
                @if (order.specialInstructions) {
                  <div class="kds-special-alert">
                    <app-icon name="alert-circle" [size]="18" color="#d97706"></app-icon>
                    <div>
                      <span class="alert-heading">Special Instruction:</span>
                      <p class="alert-body">"{{ order.specialInstructions }}"</p>
                    </div>
                  </div>
                }

                <!-- KDS Push Button -->
                <div class="kds-card-footer">
                  <button class="kds-btn btn-start-prep" (click)="updateStatus(order, 'preparing')">
                    <app-icon name="flame" [size]="18"></app-icon>
                    <span>Start Cooking</span>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="kds-empty-column">No new orders waiting</div>
            }
          </div>
        </div>

        <!-- Column 2: PREPARING (Cooking on Stove / Tandoor) -->
        <div class="kds-column column-preparing">
          <div class="column-header">
            <div class="col-title-group">
              <span class="col-pill prep-pill">2</span>
              <h2 class="col-title">PREPARING</h2>
            </div>
            <span class="col-count">{{ preparingOrders().length }}</span>
          </div>

          <div class="kds-cards-stream">
            @for (order of preparingOrders(); track order.id) {
              <div class="kds-card card-prep">
                <div class="card-kds-head">
                  <div class="table-mega-badge is-prep">
                    TABLE {{ order.tableNumber }}
                  </div>
                  <div class="kds-timer timer-prep">
                    <app-icon name="clock" [size]="15"></app-icon>
                    <span>{{ getElapsedMinutes(order.createdAt) }} min</span>
                  </div>
                </div>

                <div class="ticket-meta">
                  <span class="ticket-id">{{ order.orderNumber }}</span>
                  <span class="ticket-target">Est: {{ order.prepTimeMinutes }}m</span>
                </div>

                <!-- Items Checklist -->
                <div class="kds-items-list">
                  @for (item of order.items; track item.id) {
                    <div class="kds-item-row">
                      <div class="kds-item-main">
                        <app-veg-badge [veg]="item.veg"></app-veg-badge>
                        <span class="item-qty-huge prep-qty">{{ item.quantity }} ×</span>
                        <span class="item-name-bold">{{ item.name }}</span>
                      </div>
                      @if (item.specialInstructions) {
                        <div class="item-instruction-warn">
                          ⚠️ {{ item.specialInstructions }}
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Kitchen Special Note Banner -->
                @if (order.specialInstructions) {
                  <div class="kds-special-alert">
                    <app-icon name="alert-circle" [size]="18" color="#d97706"></app-icon>
                    <div>
                      <span class="alert-heading">Special Instruction:</span>
                      <p class="alert-body">"{{ order.specialInstructions }}"</p>
                    </div>
                  </div>
                }

                <!-- KDS Push Button -->
                <div class="kds-card-footer">
                  <button class="kds-btn btn-mark-ready" (click)="updateStatus(order, 'ready')">
                    <app-icon name="check-circle" [size]="18"></app-icon>
                    <span>Pass to Food Expeditor</span>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="kds-empty-column">No orders currently cooking</div>
            }
          </div>
        </div>

        <!-- Column 3: READY FOR SERVING -->
        <div class="kds-column column-ready">
          <div class="column-header">
            <div class="col-title-group">
              <span class="col-pill ready-pill">3</span>
              <h2 class="col-title">READY TO SERVE</h2>
            </div>
            <span class="col-count">{{ readyOrders().length }}</span>
          </div>

          <div class="kds-cards-stream">
            @for (order of readyOrders(); track order.id) {
              <div class="kds-card card-ready">
                <div class="card-kds-head">
                  <div class="table-mega-badge is-ready">
                    TABLE {{ order.tableNumber }}
                  </div>
                  <div class="kds-timer timer-ready">
                    <app-icon name="check-circle" [size]="15"></app-icon>
                    <span>Plated</span>
                  </div>
                </div>

                <div class="ticket-meta">
                  <span class="ticket-id">{{ order.orderNumber }}</span>
                  <span class="ticket-expedite">Call Waiter to Table {{ order.tableNumber }}</span>
                </div>

                <!-- Items Checklist -->
                <div class="kds-items-list">
                  @for (item of order.items; track item.id) {
                    <div class="kds-item-row ready-item">
                      <div class="kds-item-main">
                        <app-icon name="check" [size]="16" color="#16a34a"></app-icon>
                        <span class="item-qty-huge">{{ item.quantity }} ×</span>
                        <span class="item-name-bold strike">{{ item.name }}</span>
                      </div>
                    </div>
                  }
                </div>

                <!-- KDS Push Button -->
                <div class="kds-card-footer">
                  <button class="kds-btn btn-mark-served" (click)="updateStatus(order, 'served')">
                    <app-icon name="utensils" [size]="18"></app-icon>
                    <span>Served to Table</span>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="kds-empty-column">No orders waiting for pickup</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .kds-screen {
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-height: calc(100vh - 120px);
      }

      .kds-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: #1e1b19;
        border: 1px solid #2e2a27;
        border-radius: var(--radius-lg);
        color: #ffffff;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .chef-logo {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        background: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .kds-title {
        font-size: 1.35rem;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.01em;
      }

      .kds-subtitle {
        font-size: 0.8125rem;
        color: #9c958f;
      }

      .active-orders-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(224, 83, 38, 0.2);
        border: 1px solid var(--color-primary);
        border-radius: var(--radius-full);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.875rem;
      }

      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--color-primary);
        box-shadow: 0 0 0 4px rgba(224, 83, 38, 0.4);
        animation: pulseGlow 1.2s infinite;
      }

      /* 3-Column Layout */
      .kds-columns-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        align-items: flex-start;
      }

      .kds-column {
        background: #f1eee9;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-xl);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-height: 600px;
      }

      .column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 12px;
        border-bottom: 2px solid rgba(0, 0, 0, 0.08);
      }

      .col-title-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .col-pill {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.8125rem;
        color: #ffffff;
      }
      .new-pill { background: #b45309; }
      .prep-pill { background: #c2410c; }
      .ready-pill { background: #15803d; }

      .col-title {
        font-size: 1.05rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: var(--color-text-primary);
      }

      .col-count {
        font-size: 0.875rem;
        font-weight: 800;
        padding: 4px 10px;
        background: #ffffff;
        border-radius: var(--radius-full);
        box-shadow: var(--shadow-xs);
      }

      /* Stream of Cards */
      .kds-cards-stream {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .kds-card {
        background: #ffffff;
        border: 2px solid transparent;
        border-radius: var(--radius-lg);
        padding: 18px;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 14px;
        transition: transform var(--transition-fast);
      }
      .kds-card:hover {
        transform: translateY(-2px);
      }

      .card-new {
        border-color: #fde68a;
      }
      .card-prep {
        border-color: #fed7aa;
        background: #fffcf9;
      }
      .card-ready {
        border-color: #bbf7d0;
        background: #fcfdfc;
      }

      .card-kds-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .table-mega-badge {
        font-size: 1.35rem;
        font-weight: 900;
        color: #1a1817;
        letter-spacing: -0.01em;
      }
      .table-mega-badge.is-prep {
        color: #c2410c;
      }
      .table-mega-badge.is-ready {
        color: #15803d;
      }

      .kds-timer {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.8125rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: var(--radius-full);
      }
      .timer-new {
        background: #fef3c7;
        color: #b45309;
      }
      .timer-prep {
        background: #fff7ed;
        color: #c2410c;
        animation: pulseDot 2s infinite;
      }
      .timer-ready {
        background: #ecfdf5;
        color: #15803d;
      }

      .ticket-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.775rem;
        font-weight: 600;
        color: var(--color-text-muted);
        padding-bottom: 8px;
        border-bottom: 1px dashed var(--color-surface-border);
      }

      .ticket-expedite {
        color: #15803d;
        font-weight: 700;
      }

      /* KDS Items List - Large typography for distance viewing */
      .kds-items-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .kds-item-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .kds-item-main {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .item-qty-huge {
        font-size: 1.25rem;
        font-weight: 900;
        color: var(--color-primary);
        min-width: 38px;
      }
      .item-qty-huge.prep-qty {
        color: #c2410c;
      }

      .item-name-bold {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--color-text-primary);
        line-height: 1.25;
      }
      .item-name-bold.strike {
        text-decoration: line-through;
        color: var(--color-text-muted);
      }

      .item-instruction-warn {
        font-size: 0.8125rem;
        font-weight: 700;
        color: #b45309;
        background: #fffbeb;
        padding: 4px 10px;
        border-radius: var(--radius-sm);
        margin-left: 28px;
      }

      /* Special Note Alert */
      .kds-special-alert {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 14px;
        background: #fffbeb;
        border: 1.5px solid #fde68a;
        border-radius: var(--radius-md);
      }

      .alert-heading {
        display: block;
        font-size: 0.725rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #b45309;
        margin-bottom: 2px;
      }

      .alert-body {
        font-size: 0.875rem;
        font-weight: 700;
        color: #92400e;
        line-height: 1.35;
      }

      /* KDS Action Buttons */
      .kds-card-footer {
        padding-top: 10px;
        border-top: 1px solid var(--color-surface-border);
      }

      .kds-btn {
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px;
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        font-weight: 800;
        cursor: pointer;
        transition: all var(--transition-fast);
        border: none;
      }

      .btn-start-prep {
        background: linear-gradient(135deg, #c2410c, #ea580c);
        color: #ffffff;
      }
      .btn-start-prep:hover {
        background: #9a3412;
      }

      .btn-mark-ready {
        background: linear-gradient(135deg, #15803d, #16a34a);
        color: #ffffff;
      }
      .btn-mark-ready:hover {
        background: #166534;
      }

      .btn-mark-served {
        background: var(--color-secondary);
        color: #ffffff;
      }
      .btn-mark-served:hover {
        background: #000000;
      }

      .kds-empty-column {
        padding: 40px 20px;
        text-align: center;
        color: var(--color-text-muted);
        font-weight: 600;
        font-size: 0.875rem;
      }

      @media (max-width: 1100px) {
        .kds-columns-container {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class KitchenDisplayComponent {
  protected readonly orderService = inject(OrderService);

  public readonly newOrders = computed(() => {
    return this.orderService.orders().filter((o) => o.status === 'placed' || o.status === 'accepted');
  });

  public readonly preparingOrders = computed(() => {
    return this.orderService.orders().filter((o) => o.status === 'preparing');
  });

  public readonly readyOrders = computed(() => {
    return this.orderService.orders().filter((o) => o.status === 'ready');
  });

  public readonly activeOrdersCount = computed(() => {
    return this.newOrders().length + this.preparingOrders().length + this.readyOrders().length;
  });

  getElapsedMinutes(isoString: string): number {
    const elapsed = Date.now() - new Date(isoString).getTime();
    return Math.max(1, Math.floor(elapsed / (60 * 1000)));
  }

  updateStatus(order: Order, newStatus: OrderStatus) {
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe();
  }
}

