import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import confetti from 'canvas-confetti';
import { OrderService } from '../../../core/services/order.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { Order } from '../../../core/models/order.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, ButtonComponent, CurrencyInrPipe],
  template: `
    <div class="success-viewport animate-fade-in">
      <div class="success-card df-card">
        <!-- Animated Success Checkmark Ring -->
        <div class="celebration-ring">
          <div class="ring-pulse"></div>
          <div class="check-circle-icon">
            <app-icon name="check" [size]="44" color="#ffffff" [strokeWidth]="3"></app-icon>
          </div>
        </div>

        <div class="confirmation-headers">
          <h1 class="success-title">Order Placed Successfully!</h1>
          <p class="success-marathi">आपली ऑर्डर स्वयंपाकघरात पाठवली आहे</p>
          <p class="success-sub">Our chef at Hotel Jagdamba has received your dining ticket.</p>
        </div>

        <!-- Ticket Card Recap -->
        <div class="ticket-recap-box">
          <div class="recap-header">
            <div>
              <span class="recap-tag">ORDER TICKET</span>
              <h3 class="order-number-val">{{ order()?.orderNumber || 'ORD-1042' }}</h3>
            </div>

            <div class="table-callout">
              <span class="tbl-callout-tag">TABLE</span>
              <span class="tbl-callout-num">{{ order()?.tableNumber || '08' }}</span>
            </div>
          </div>

          <div class="recap-divider"></div>

          <!-- Estimated Prep Time Countdown Box -->
          <div class="prep-estimate-banner">
            <app-icon name="clock" [size]="22" color="var(--color-primary)"></app-icon>
            <div>
              <span class="est-label">Estimated Preparation Time</span>
              <strong class="est-minutes">{{ order()?.prepTimeMinutes || 20 }}–25 minutes</strong>
            </div>
          </div>

          <!-- Ordered Items Summary -->
          @if (order(); as ord) {
            <div class="items-mini-list">
              @for (item of ord.items; track item.id) {
                <div class="mini-item-row">
                  <span class="mini-item-name">{{ item.quantity }} × {{ item.localName || item.name }}</span>
                  <span class="mini-item-price">{{ (item.price * item.quantity) | currencyInr }}</span>
                </div>
              }

              <div class="mini-total-row">
                <span>Grand Total</span>
                <span class="total-bold">{{ ord.grandTotal | currencyInr }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Action CTAs -->
        <div class="action-buttons-group">
          <app-button
            variant="primary"
            size="lg"
            [fullWidth]="true"
            iconRight="arrow-right"
            (btnClick)="goToTracking()"
          >
            Track Live Kitchen Status
          </app-button>

          <a [routerLink]="['/r', restaurantSlug(), 't', tableToken()]" class="browse-more-link">
            <span>Add More Items to Table</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .success-viewport {
        max-width: 500px;
        margin: 0 auto;
        min-height: 100vh;
        background: var(--color-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
      }

      .success-card {
        width: 100%;
        background: #ffffff;
        border-radius: var(--radius-2xl);
        padding: 36px 24px 28px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: var(--shadow-xl);
      }

      .celebration-ring {
        position: relative;
        width: 90px;
        height: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
      }

      .ring-pulse {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: rgba(22, 163, 74, 0.2);
        animation: pulseGlow 1.8s infinite;
      }

      .check-circle-icon {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: linear-gradient(135deg, #16a34a, #15803d);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 20px rgba(22, 163, 74, 0.35);
        animation: scaleCheck 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .confirmation-headers {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 22px;
      }

      .success-title {
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--color-text-primary);
        letter-spacing: -0.02em;
      }

      .success-marathi {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--color-primary);
      }

      .success-sub {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-top: 4px;
      }

      .ticket-recap-box {
        width: 100%;
        background: var(--color-surface-subtle);
        border: 1px dashed var(--color-surface-border);
        border-radius: var(--radius-lg);
        padding: 18px;
        margin-bottom: 24px;
        text-align: left;
      }

      .recap-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .recap-tag {
        font-size: 0.675rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--color-text-muted);
      }

      .order-number-val {
        font-size: 1.35rem;
        font-weight: 900;
        color: var(--color-text-primary);
      }

      .table-callout {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px 14px;
        background: #ffffff;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
      }

      .tbl-callout-tag {
        font-size: 0.625rem;
        font-weight: 800;
        color: var(--color-text-muted);
      }

      .tbl-callout-num {
        font-size: 1.25rem;
        font-weight: 900;
        color: var(--color-primary);
        line-height: 1;
      }

      .recap-divider {
        height: 1px;
        background: var(--color-surface-border);
        margin: 14px 0;
      }

      .prep-estimate-banner {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        background: #ffffff;
        border-radius: var(--radius-md);
        border: 1px solid rgba(224, 83, 38, 0.2);
        margin-bottom: 14px;
      }

      .est-label {
        display: block;
        font-size: 0.725rem;
        color: var(--color-text-muted);
      }

      .est-minutes {
        display: block;
        font-size: 1rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .items-mini-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .mini-item-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
      }

      .mini-total-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.9375rem;
        font-weight: 800;
        color: var(--color-text-primary);
        padding-top: 8px;
        margin-top: 4px;
        border-top: 1px dashed var(--color-surface-border);
      }

      .action-buttons-group {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .browse-more-link {
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--color-text-secondary);
        transition: color var(--transition-fast);
      }
      .browse-more-link:hover {
        color: var(--color-primary);
      }
    `,
  ],
})
export class OrderSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);

  public readonly order = signal<Order | null>(null);
  public readonly restaurantSlug = signal<string>('hotel-jagdamba');
  public readonly tableToken = signal<string>('abc123');

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.restaurantSlug.set(params['restaurantSlug'] || 'hotel-jagdamba');
      this.tableToken.set(params['tableToken'] || 'abc123');
      const orderId = params['orderId'];

      if (orderId) {
        this.orderService.getOrderById(orderId).subscribe((ord) => {
          this.order.set(ord);
        });
      }

      this.triggerConfetti();
    });
  }

  triggerConfetti() {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e05326', '#d97706', '#16a34a', '#1a1817'],
      });
    } catch {
      // Confetti fallback
    }
  }

  goToTracking() {
    const ord = this.order();
    const orderId = ord ? ord.id : 'ord-1042';
    this.router.navigate([
      '/r',
      this.restaurantSlug(),
      't',
      this.tableToken(),
      'track',
      orderId,
    ]);
  }
}

