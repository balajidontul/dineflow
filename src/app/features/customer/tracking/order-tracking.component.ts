import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { VegBadgeComponent } from '../../../shared/components/veg-badge/veg-badge.component';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';

interface TrackingStage {
  status: OrderStatus;
  title: string;
  localTitle: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    VegBadgeComponent,
    CurrencyInrPipe,
  ],
  template: `
    <div class="tracking-viewport animate-fade-in">
      <!-- Top Navigation -->
      <header class="tracking-topbar">
        <a [routerLink]="['/r', restaurantSlug(), 't', tableToken()]" class="back-circle-btn">
          <app-icon name="arrow-left" [size]="18"></app-icon>
        </a>

        <div class="topbar-center">
          <h1 class="screen-title">Order Status</h1>
          <span class="table-sub">Table {{ order()?.tableNumber || '08' }}</span>
        </div>

        <button class="waiter-bell-btn" (click)="callWaiter()" title="Call Waiter">
          <app-icon name="bell" [size]="18" color="var(--color-primary)"></app-icon>
        </button>
      </header>

      <!-- Main Tracking Content -->
      <main class="tracking-main">
        <!-- Active Status Spotlight Hero -->
        <div class="status-hero-card df-card">
          <div class="hero-icon-pulsar">
            <app-icon [name]="currentStageInfo().icon" [size]="32" color="#ffffff"></app-icon>
          </div>

          <div class="hero-text-block">
            <h2 class="stage-active-title">{{ currentStageInfo().title }}</h2>
            <span class="stage-marathi-tag">{{ currentStageInfo().localTitle }}</span>
            <p class="stage-active-desc">{{ currentStageInfo().description }}</p>
          </div>

          <!-- Quick Test Advance Control for Interactive Demos -->
          <div class="demo-advance-bar">
            <span class="advance-label">Simulate Flow:</span>
            <div class="advance-buttons">
              <button
                class="step-pill"
                [class.current]="order()?.status === 'placed'"
                (click)="simulateStatus('placed')"
              >
                Placed
              </button>
              <button
                class="step-pill"
                [class.current]="order()?.status === 'accepted'"
                (click)="simulateStatus('accepted')"
              >
                Accepted
              </button>
              <button
                class="step-pill"
                [class.current]="order()?.status === 'preparing'"
                (click)="simulateStatus('preparing')"
              >
                Cooking
              </button>
              <button
                class="step-pill"
                [class.current]="order()?.status === 'ready'"
                (click)="simulateStatus('ready')"
              >
                Ready
              </button>
              <button
                class="step-pill"
                [class.current]="order()?.status === 'served'"
                (click)="simulateStatus('served')"
              >
                Served
              </button>
            </div>
          </div>
        </div>

        <!-- Vertical Timeline Progress Tracker -->
        <div class="timeline-card df-card">
          <h3 class="timeline-title">Kitchen Progress Tracker</h3>

          <div class="timeline-stream">
            @for (stage of stages; track stage.status; let i = $index) {
              <div
                class="timeline-node"
                [class.is-done]="isStagePassed(stage.status)"
                [class.is-active]="order()?.status === stage.status"
              >
                <!-- Line Indicator -->
                <div class="node-left">
                  <div class="node-icon-circle">
                    @if (isStagePassed(stage.status)) {
                      <app-icon name="check" [size]="14" color="#ffffff"></app-icon>
                    } @else {
                      <span class="step-num">{{ i + 1 }}</span>
                    }
                  </div>
                  @if (i < stages.length - 1) {
                    <div class="connector-line" [class.line-done]="isStagePassed(stages[i + 1].status)"></div>
                  }
                </div>

                <!-- Text Info -->
                <div class="node-body">
                  <div class="node-header">
                    <span class="node-title">{{ stage.title }}</span>
                    <span class="node-local">{{ stage.localTitle }}</span>
                  </div>
                  <p class="node-desc">{{ stage.description }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Ordered Items Recap -->
        @if (order(); as ord) {
          <div class="order-items-recap df-card">
            <div class="recap-title-row">
              <span class="recap-num">Order #{{ ord.orderNumber }}</span>
              <span class="items-total-pill">{{ ord.items.length }} dishes</span>
            </div>

            <div class="dish-item-rows">
              @for (item of ord.items; track item.id) {
                <div class="dish-row">
                  <div class="dish-left">
                    <app-veg-badge [veg]="item.veg"></app-veg-badge>
                    <span class="dish-qty">{{ item.quantity }} ×</span>
                    <span class="dish-name">{{ item.name }}</span>
                  </div>
                  <span class="dish-price">{{ (item.price * item.quantity) | currencyInr }}</span>
                </div>
              }
            </div>

            <div class="bill-total-bar">
              <span class="tot-label">Total Bill</span>
              <span class="tot-val">{{ ord.grandTotal | currencyInr }}</span>
            </div>
          </div>
        }
      </main>

      <!-- Bottom Sticky Payment CTA Bar -->
      <footer class="tracking-footer">
        <div class="footer-bill-info">
          <span class="status-indicator-tag" [class.is-paid]="order()?.paymentStatus === 'paid'">
            <app-icon [name]="order()?.paymentStatus === 'paid' ? 'check-circle' : 'credit-card'" [size]="14"></app-icon>
            {{ order()?.paymentStatus === 'paid' ? 'Paid in Full' : 'Payment Due' }}
          </span>
          <span class="footer-amount">{{ order()?.grandTotal | currencyInr }}</span>
        </div>

        <div class="footer-action-col">
          @if (order()?.paymentStatus !== 'paid') {
            <a
              [routerLink]="['/r', restaurantSlug(), 't', tableToken(), 'pay', order()?.id || 'ord-1042']"
              class="btn-pay-now"
            >
              <app-icon name="smartphone" [size]="17"></app-icon>
              <span>Pay Online</span>
            </a>
          } @else {
            <div class="paid-badge-box">
              <app-icon name="check-circle" [size]="18" color="#16a34a"></app-icon>
              <span>Bill Settled</span>
            </div>
          }
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      .tracking-viewport {
        max-width: 520px;
        margin: 0 auto;
        min-height: 100vh;
        background-color: var(--color-bg);
        display: flex;
        flex-direction: column;
        padding-bottom: 96px;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.05);
      }

      .tracking-topbar {
        position: sticky;
        top: 0;
        z-index: 100;
        height: 60px;
        background: #ffffff;
        border-bottom: 1px solid var(--color-surface-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
      }

      .back-circle-btn {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-primary);
        background: var(--color-surface-subtle);
      }

      .topbar-center {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .screen-title {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--color-text-primary);
        line-height: 1.2;
      }

      .table-sub {
        font-size: 0.75rem;
        color: var(--color-primary);
        font-weight: 700;
      }

      .waiter-bell-btn {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-primary-light);
        cursor: pointer;
        transition: transform var(--transition-fast);
      }
      .waiter-bell-btn:hover {
        transform: scale(1.08);
      }

      .tracking-main {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* Hero Stage Card */
      .status-hero-card {
        padding: 24px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 12px;
        background: linear-gradient(180deg, #ffffff 0%, var(--color-surface-subtle) 100%);
      }

      .hero-icon-pulsar {
        width: 68px;
        height: 68px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-primary), #f26c41);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px var(--color-primary-glow);
        animation: pulseGlow 1.8s infinite;
      }

      .hero-text-block {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .stage-active-title {
        font-size: 1.4rem;
        font-weight: 900;
        color: var(--color-text-primary);
      }

      .stage-marathi-tag {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-primary);
      }

      .stage-active-desc {
        font-size: 0.825rem;
        color: var(--color-text-secondary);
        max-width: 380px;
        margin: 4px auto 0;
      }

      /* Demo Stage Simulation Bar */
      .demo-advance-bar {
        margin-top: 10px;
        padding-top: 14px;
        border-top: 1px dashed var(--color-surface-border);
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .advance-label {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--color-text-muted);
      }

      .advance-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .step-pill {
        padding: 4px 10px;
        font-size: 0.725rem;
        font-weight: 700;
        border-radius: var(--radius-full);
        background: #ffffff;
        border: 1px solid var(--color-surface-border);
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .step-pill.current {
        background: var(--color-primary);
        color: #ffffff;
        border-color: var(--color-primary);
      }

      /* Timeline Card */
      .timeline-card {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .timeline-title {
        font-size: 1rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .timeline-stream {
        display: flex;
        flex-direction: column;
      }

      .timeline-node {
        display: flex;
        gap: 16px;
      }

      .node-left {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 28px;
      }

      .node-icon-circle {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #e5e0d8;
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 800;
        transition: all var(--transition-fast);
        z-index: 2;
      }

      .connector-line {
        width: 2px;
        min-height: 48px;
        background: #e5e0d8;
        margin: 2px 0;
        transition: background var(--transition-fast);
      }

      .timeline-node.is-active .node-icon-circle {
        background: var(--color-primary);
        color: #ffffff;
        box-shadow: 0 0 0 4px var(--color-primary-light);
      }

      .timeline-node.is-done .node-icon-circle {
        background: #16a34a;
        color: #ffffff;
      }

      .connector-line.line-done {
        background: #16a34a;
      }

      .node-body {
        padding-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .node-header {
        display: flex;
        align-items: baseline;
        gap: 8px;
      }

      .node-title {
        font-size: 0.925rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .node-local {
        font-size: 0.775rem;
        color: var(--color-text-muted);
      }

      .node-desc {
        font-size: 0.775rem;
        color: var(--color-text-secondary);
        line-height: 1.4;
      }

      /* Recap Box */
      .order-items-recap {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .recap-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--color-surface-border);
      }

      .recap-num {
        font-weight: 800;
        font-size: 0.95rem;
        color: var(--color-text-primary);
      }

      .items-total-pill {
        font-size: 0.725rem;
        font-weight: 700;
        padding: 2px 8px;
        background: var(--color-surface-subtle);
        border-radius: var(--radius-full);
      }

      .dish-item-rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .dish-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8125rem;
      }

      .dish-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dish-qty {
        font-weight: 700;
        color: var(--color-primary);
      }

      .dish-name {
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .dish-price {
        font-weight: 700;
        color: var(--color-text-secondary);
      }

      .bill-total-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 10px;
        border-top: 1px dashed var(--color-surface-border);
      }

      .tot-label {
        font-size: 0.875rem;
        font-weight: 700;
      }

      .tot-val {
        font-size: 1.2rem;
        font-weight: 900;
        color: var(--color-primary);
      }

      /* Footer */
      .tracking-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-width: 520px;
        margin: 0 auto;
        background: #ffffff;
        border-top: 1px solid var(--color-surface-border);
        padding: 14px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
        z-index: 200;
      }

      .footer-bill-info {
        display: flex;
        flex-direction: column;
      }

      .status-indicator-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.725rem;
        font-weight: 700;
        color: #b45309;
      }
      .status-indicator-tag.is-paid {
        color: #15803d;
      }

      .footer-amount {
        font-size: 1.35rem;
        font-weight: 900;
        color: var(--color-text-primary);
        line-height: 1.1;
      }

      .btn-pay-now {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 22px;
        background: var(--color-primary);
        color: #ffffff;
        font-size: 0.9375rem;
        font-weight: 800;
        border-radius: var(--radius-full);
        box-shadow: 0 4px 14px rgba(224, 83, 38, 0.35);
        transition: background-color var(--transition-fast);
      }
      .btn-pay-now:hover {
        background: var(--color-primary-hover);
      }

      .paid-badge-box {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: var(--radius-full);
        color: #047857;
        font-weight: 700;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class OrderTrackingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly toastService = inject(ToastService);

  public readonly order = signal<Order | null>(null);
  public readonly restaurantSlug = signal<string>('hotel-jagdamba');
  public readonly tableToken = signal<string>('abc123');

  public readonly stages: TrackingStage[] = [
    {
      status: 'placed',
      title: 'Order Placed',
      localTitle: 'ऑर्डर प्राप्त झाली',
      description: 'Your table order ticket has been received by our staff.',
      icon: 'clipboard-list',
    },
    {
      status: 'accepted',
      title: 'Accepted & Queued',
      localTitle: 'स्वीकारली व रांगेत',
      description: 'Kitchen head chef accepted your culinary order.',
      icon: 'check',
    },
    {
      status: 'preparing',
      title: 'Preparing Your Food',
      localTitle: 'अन्न तयार होत आहे',
      description: 'Our kitchen has started cooking your order over fresh chulha & tandoor.',
      icon: 'flame',
    },
    {
      status: 'ready',
      title: 'Food Ready for Table',
      localTitle: 'वाढण्यासाठी तयार',
      description: 'Plated hot and waiting for table runner expeditor.',
      icon: 'check-circle',
    },
    {
      status: 'served',
      title: 'Served to Table',
      localTitle: 'टेबलावर वाढले',
      description: 'Dishes served at your table. Enjoy your authentic royal feast!',
      icon: 'utensils',
    },
  ];

  public readonly currentStageInfo = computed<TrackingStage>(() => {
    const current = this.order()?.status || 'preparing';
    return (
      this.stages.find((s) => s.status === current) || {
        status: 'preparing',
        title: 'Preparing Your Food',
        localTitle: 'अन्न तयार होत आहे',
        description: 'Our kitchen has started cooking your order.',
        icon: 'flame',
      }
    );
  });

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.restaurantSlug.set(params['restaurantSlug'] || 'hotel-jagdamba');
      this.tableToken.set(params['tableToken'] || 'abc123');
      const orderId = params['orderId'] || 'ord-1042';

      this.orderService.getOrderById(orderId).subscribe((ord) => {
        this.order.set(ord);
      });
    });
  }

  isStagePassed(stageStatus: OrderStatus): boolean {
    const sequence: OrderStatus[] = ['placed', 'accepted', 'preparing', 'ready', 'served', 'completed'];
    const current = this.order()?.status || 'placed';
    return sequence.indexOf(current) >= sequence.indexOf(stageStatus);
  }

  simulateStatus(newStatus: OrderStatus) {
    const ord = this.order();
    if (!ord) return;
    this.orderService.updateOrderStatus(ord.id, newStatus).subscribe((updated) => {
      this.order.set(updated);
    });
  }

  callWaiter() {
    this.toastService.info(
      `Table service alerted! A server will attend Table ${this.order()?.tableNumber || '08'} in a moment.`,
      '🔔 Waiter Called'
    );
  }
}
