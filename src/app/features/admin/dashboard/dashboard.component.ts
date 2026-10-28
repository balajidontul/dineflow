import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestaurantService, DashboardAnalytics } from '../../../core/services/restaurant.service';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { VegBadgeComponent } from '../../../shared/components/veg-badge/veg-badge.component';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    BadgeComponent,
    ButtonComponent,
    IconComponent,
    VegBadgeComponent,
    CurrencyInrPipe,
    TimeAgoPipe,
  ],
  template: `
    <div class="dashboard-page animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Executive Dashboard</h1>
          <p class="page-subtitle">Real-time performance overview for {{ restaurantService.restaurant().name }}</p>
        </div>

        <div class="header-actions">
          <div class="live-pill">
            <span class="live-pulse"></span>
            <span>Live POS Sync</span>
          </div>

          <a [routerLink]="['/admin/orders']">
            <app-button variant="primary" iconLeft="clipboard-list">
              Manage Orders
            </app-button>
          </a>
        </div>
      </div>

      <!-- 4 KPI Summary Cards -->
      <div class="stats-grid">
        <app-stat-card
          title="Today's Revenue"
          [value]="(analytics()?.todayRevenue || 48650) | currencyInr"
          [change]="analytics()?.revenueChangePercentage || 14.2"
          subtitle="vs yesterday"
          icon="dollar-sign"
          iconBg="rgba(224, 83, 38, 0.12)"
          iconColor="var(--color-primary)"
        ></app-stat-card>

        <app-stat-card
          title="Today's Orders"
          [value]="analytics()?.todayOrdersCount || 42"
          [change]="analytics()?.ordersChangePercentage || 8.5"
          subtitle="vs yesterday"
          icon="shopping-bag"
          iconBg="rgba(37, 99, 235, 0.12)"
          iconColor="#2563eb"
        ></app-stat-card>

        <app-stat-card
          title="Active Tables"
          [value]="(analytics()?.activeTablesCount || 7) + ' / ' + (analytics()?.totalTablesCount || 12)"
          subtitle="58% Current Occupancy"
          icon="grid"
          iconBg="rgba(217, 119, 6, 0.12)"
          iconColor="#d97706"
        ></app-stat-card>

        <app-stat-card
          title="Average Order Value"
          [value]="(analytics()?.averageOrderValue || 1158) | currencyInr"
          [change]="analytics()?.aovChangePercentage || 5.3"
          subtitle="vs last week"
          icon="trending-up"
          iconBg="rgba(22, 163, 74, 0.12)"
          iconColor="#16a34a"
        ></app-stat-card>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid">
        <!-- 7-Day Revenue Chart -->
        <div class="df-card chart-card">
          <div class="chart-header">
            <div>
              <h3 class="card-heading">Revenue Trend (Last 7 Days)</h3>
              <p class="card-subheading">Total sales volume from in-restaurant QR orders</p>
            </div>
            <span class="chart-summary-tag">Peak: ₹84.3k (Sun)</span>
          </div>

          <div class="bar-chart-container">
            @for (item of analytics()?.revenueHistory7Days; track item.day) {
              <div class="bar-column">
                <div class="bar-tooltip">{{ item.revenue | currencyInr }} ({{ item.orders }} orders)</div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    [style.height.%]="(item.revenue / 90000) * 100"
                    [class.is-today]="item.day === 'Today'"
                  ></div>
                </div>
                <span class="bar-label" [class.is-today-label]="item.day === 'Today'">{{ item.day }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Hourly Peak Order Intensity Chart -->
        <div class="df-card chart-card">
          <div class="chart-header">
            <div>
              <h3 class="card-heading">Orders by Hour</h3>
              <p class="card-subheading">Dining rush hours (Lunch 1 PM & Dinner 9 PM peaks)</p>
            </div>
            <span class="chart-summary-tag">Peak: 9 PM (18 orders)</span>
          </div>

          <div class="bar-chart-container">
            @for (hour of analytics()?.hourlyOrders; track hour.hour) {
              <div class="bar-column">
                <div class="bar-tooltip">{{ hour.count }} orders at {{ hour.hour }}</div>
                <div class="bar-track">
                  <div
                    class="bar-fill fill-secondary"
                    [style.height.%]="(hour.count / 20) * 100"
                  ></div>
                </div>
                <span class="bar-label">{{ hour.hour }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Content Split: Live Orders & Popular Dishes -->
      <div class="content-split-grid">
        <!-- Live Incoming & In-Progress Orders -->
        <div class="df-card live-orders-card">
          <div class="section-card-header">
            <div class="header-left-combo">
              <h3 class="card-heading">Live Orders Stream</h3>
              <span class="badge-count">{{ orderService.liveOrders().length }} Active</span>
            </div>
            <a [routerLink]="['/admin/orders']" class="view-all-link">
              View All Orders <app-icon name="arrow-right" [size]="14"></app-icon>
            </a>
          </div>

          <div class="orders-list">
            @for (order of orderService.liveOrders().slice(0, 5); track order.id) {
              <div class="order-item-row" [class.highlight-row]="order.orderNumber === 'ORD-1042'">
                <div class="order-main-meta">
                  <div class="order-id-table">
                    <span class="order-num">{{ order.orderNumber }}</span>
                    <span class="table-badge">Table {{ order.tableNumber }}</span>
                  </div>
                  <div class="order-time">
                    <app-icon name="clock" [size]="13"></app-icon>
                    <span>{{ order.createdAt | timeAgo }}</span>
                  </div>
                </div>

                <div class="order-items-snippet">
                  <span class="items-count-tag">{{ order.items.length }} items:</span>
                  <span class="items-text">
                    {{ getItemSummary(order) }}
                  </span>
                </div>

                <div class="order-status-price">
                  <span class="order-price">{{ order.grandTotal | currencyInr }}</span>
                  <app-badge [variant]="order.status">
                    {{ order.status }}
                  </app-badge>
                </div>

                <div class="order-quick-actions">
                  @if (order.status === 'placed') {
                    <button class="action-btn accept" (click)="advanceStatus(order, 'accepted')">
                      Accept
                    </button>
                  } @else if (order.status === 'accepted') {
                    <button class="action-btn prepare" (click)="advanceStatus(order, 'preparing')">
                      Start Prep
                    </button>
                  } @else if (order.status === 'preparing') {
                    <button class="action-btn ready" (click)="advanceStatus(order, 'ready')">
                      Mark Ready
                    </button>
                  } @else if (order.status === 'ready') {
                    <button class="action-btn serve" (click)="advanceStatus(order, 'served')">
                      Mark Served
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Most Popular Dishes -->
        <div class="df-card popular-card">
          <div class="section-card-header">
            <div>
              <h3 class="card-heading">Top Performing Dishes</h3>
              <p class="card-subheading">Highest volume favorites today</p>
            </div>
            <a [routerLink]="['/admin/menu']" class="view-all-link">
              Manage Menu <app-icon name="arrow-right" [size]="14"></app-icon>
            </a>
          </div>

          <div class="popular-list">
            @for (dish of analytics()?.popularDishes; track dish.dishId) {
              <div class="popular-dish-row">
                <div class="dish-thumb">
                  <img [src]="dish.imageUrl" [alt]="dish.dishName" />
                </div>

                <div class="dish-info">
                  <div class="dish-name-line">
                    <app-veg-badge [veg]="dish.veg"></app-veg-badge>
                    <span class="dish-title">{{ dish.dishName }}</span>
                  </div>
                  @if (dish.localName) {
                    <span class="dish-local">{{ dish.localName }}</span>
                  }
                </div>

                <div class="dish-metrics">
                  <span class="dish-qty">{{ dish.quantitySold }} sold</span>
                  <span class="dish-rev">{{ dish.revenue | currencyInr }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-page {
        display: flex;
        flex-direction: column;
        gap: 28px;
      }

      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }

      .page-title {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--color-text-primary);
        letter-spacing: -0.02em;
      }

      .page-subtitle {
        color: var(--color-text-secondary);
        font-size: 0.9375rem;
        margin-top: 2px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .live-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: var(--radius-full);
        color: #047857;
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .live-pulse {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #10b981;
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
        animation: pulseGlow 1.5s infinite;
      }

      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
      }

      /* Charts Grid */
      .charts-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      .chart-card {
        padding: 24px;
        display: flex;
        flex-direction: column;
      }

      .chart-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 24px;
      }

      .card-heading {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .card-subheading {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-top: 2px;
      }

      .chart-summary-tag {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 4px 10px;
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
      }

      .bar-chart-container {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        height: 190px;
        padding-top: 20px;
        border-bottom: 1px dashed var(--color-surface-border);
      }

      .bar-column {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        position: relative;
        cursor: pointer;
      }

      .bar-track {
        flex: 1;
        width: 32px;
        display: flex;
        align-items: flex-end;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 6px 6px 0 0;
        overflow: hidden;
      }

      .bar-fill {
        width: 100%;
        background: linear-gradient(180deg, var(--color-primary), #f26c41);
        border-radius: 6px 6px 0 0;
        transition: height 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity var(--transition-fast);
      }
      .bar-fill.fill-secondary {
        background: linear-gradient(180deg, #d97706, #fbbf24);
      }
      .bar-fill.is-today {
        background: linear-gradient(180deg, #16a34a, #4ade80);
      }

      .bar-column:hover .bar-fill {
        opacity: 0.85;
      }

      .bar-tooltip {
        position: absolute;
        top: -10px;
        background: var(--color-secondary);
        color: #ffffff;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: var(--radius-xs);
        white-space: nowrap;
        opacity: 0;
        transform: translateY(4px);
        pointer-events: none;
        transition: all var(--transition-fast);
        z-index: 10;
      }

      .bar-column:hover .bar-tooltip {
        opacity: 1;
        transform: translateY(0);
      }

      .bar-label {
        margin-top: 10px;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-muted);
      }
      .bar-label.is-today-label {
        color: #16a34a;
        font-weight: 700;
      }

      /* Content Split Grid */
      .content-split-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 20px;
      }

      .section-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid var(--color-surface-border);
      }

      .header-left-combo {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .badge-count {
        font-size: 0.725rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: var(--radius-full);
        background: var(--color-primary-light);
        color: var(--color-primary);
      }

      .view-all-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-primary);
      }

      /* Orders List */
      .orders-list {
        display: flex;
        flex-direction: column;
      }

      .order-item-row {
        display: grid;
        grid-template-columns: 140px 1fr 140px 100px;
        align-items: center;
        gap: 16px;
        padding: 16px 24px;
        border-bottom: 1px solid var(--color-surface-border);
        transition: background-color var(--transition-fast);
      }
      .order-item-row:last-child {
        border-bottom: none;
      }
      .order-item-row:hover {
        background-color: var(--color-surface-hover);
      }
      .order-item-row.highlight-row {
        background: #fffcf8;
      }

      .order-id-table {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .order-num {
        font-weight: 700;
        font-size: 0.875rem;
        color: var(--color-text-primary);
      }

      .table-badge {
        font-size: 0.725rem;
        font-weight: 700;
        color: var(--color-primary);
      }

      .order-time {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.725rem;
        color: var(--color-text-muted);
        margin-top: 2px;
      }

      .order-items-snippet {
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
      }

      .items-count-tag {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
      }

      .items-text {
        font-size: 0.825rem;
        color: var(--color-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .order-status-price {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }

      .order-price {
        font-weight: 800;
        font-size: 0.95rem;
        color: var(--color-text-primary);
      }

      .order-quick-actions {
        display: flex;
        justify-content: flex-end;
      }

      .action-btn {
        padding: 6px 12px;
        font-size: 0.775rem;
        font-weight: 700;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
        border: 1px solid transparent;
      }
      .action-btn.accept {
        background: #eff6ff;
        color: #1d4ed8;
        border-color: #bfdbfe;
      }
      .action-btn.accept:hover {
        background: #1d4ed8;
        color: #ffffff;
      }

      .action-btn.prepare {
        background: #fff7ed;
        color: #c2410c;
        border-color: #fed7aa;
      }
      .action-btn.prepare:hover {
        background: #c2410c;
        color: #ffffff;
      }

      .action-btn.ready {
        background: #f0fdf4;
        color: #15803d;
        border-color: #bbf7d0;
      }
      .action-btn.ready:hover {
        background: #15803d;
        color: #ffffff;
      }

      .action-btn.serve {
        background: #f5f3ff;
        color: #6d28d9;
        border-color: #ddd6fe;
      }
      .action-btn.serve:hover {
        background: #6d28d9;
        color: #ffffff;
      }

      /* Popular dishes list */
      .popular-list {
        display: flex;
        flex-direction: column;
      }

      .popular-dish-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 20px;
        border-bottom: 1px solid var(--color-surface-border);
      }
      .popular-dish-row:last-child {
        border-bottom: none;
      }

      .dish-thumb {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        overflow: hidden;
        flex-shrink: 0;
      }
      .dish-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .dish-info {
        flex: 1;
        overflow: hidden;
      }

      .dish-name-line {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .dish-title {
        font-weight: 700;
        font-size: 0.875rem;
        color: var(--color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dish-local {
        display: block;
        font-size: 0.725rem;
        color: var(--color-text-muted);
      }

      .dish-metrics {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .dish-qty {
        font-size: 0.75rem;
        color: var(--color-text-muted);
        font-weight: 500;
      }

      .dish-rev {
        font-weight: 800;
        font-size: 0.875rem;
        color: var(--color-text-primary);
      }

      @media (max-width: 1100px) {
        .charts-grid {
          grid-template-columns: 1fr;
        }
        .content-split-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 680px) {
        .order-item-row {
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .order-items-snippet {
          grid-column: 1 / -1;
        }
        .order-quick-actions {
          grid-column: 1 / -1;
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  protected readonly restaurantService = inject(RestaurantService);
  protected readonly orderService = inject(OrderService);

  public readonly analytics = signal<DashboardAnalytics | null>(null);

  ngOnInit() {
    this.restaurantService.getAnalytics().subscribe((res) => {
      this.analytics.set(res);
    });
  }

  getItemSummary(order: Order): string {
    return order.items.map((i) => `${i.quantity} × ${i.name}`).join(', ');
  }

  advanceStatus(order: Order, newStatus: OrderStatus) {
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe();
  }
}

