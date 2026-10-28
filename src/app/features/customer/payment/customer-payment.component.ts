import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService, PaymentResult } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, PaymentMethod } from '../../../core/models/order.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';

type PaymentScreenState = 'select' | 'processing' | 'success' | 'failed';

@Component({
  selector: 'app-customer-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, ButtonComponent, CurrencyInrPipe],
  template: `
    <div class="pay-viewport animate-fade-in">
      <!-- Top Navigation -->
      <header class="pay-topbar">
        <a [routerLink]="['/r', restaurantSlug(), 't', tableToken(), 'track', orderId()]" class="back-circle-btn">
          <app-icon name="arrow-left" [size]="18"></app-icon>
        </a>

        <div class="topbar-center">
          <h1 class="screen-title">Dining Bill Checkout</h1>
          <span class="table-sub">Table {{ order()?.tableNumber || '08' }}</span>
        </div>

        <div class="space-placeholder"></div>
      </header>

      <main class="pay-main">
        <!-- 1. State: Payment Method Selection -->
        @if (screenState() === 'select') {
          <!-- Amount Payable Banner -->
          <div class="bill-amount-banner df-card">
            <span class="payable-label">TOTAL AMOUNT PAYABLE</span>
            <div class="payable-amount">{{ (order()?.grandTotal || 1240) | currencyInr }}</div>
            <span class="order-ref">Order #{{ order()?.orderNumber || 'ORD-1042' }} • Table {{ order()?.tableNumber || '08' }}</span>
          </div>

          <!-- Payment Options -->
          <div class="payment-methods-card df-card">
            <h3 class="section-title">Select Payment Mode</h3>

            <div class="methods-list">
              <!-- UPI Option -->
              <label class="method-option" [class.selected]="selectedMethod() === 'upi'">
                <div class="method-radio">
                  <input type="radio" value="upi" [(ngModel)]="selectedMethod" />
                  <span class="radio-dot"></span>
                </div>
                <div class="method-icon-box upi-bg">
                  <app-icon name="smartphone" [size]="20" color="#2563eb"></app-icon>
                </div>
                <div class="method-info">
                  <span class="method-name">UPI Instant Payment</span>
                  <span class="method-sub">Google Pay, PhonePe, Paytm, Any UPI</span>
                </div>
              </label>

              <!-- Credit / Debit Card -->
              <label class="method-option" [class.selected]="selectedMethod() === 'card'">
                <div class="method-radio">
                  <input type="radio" value="card" [(ngModel)]="selectedMethod" />
                  <span class="radio-dot"></span>
                </div>
                <div class="method-icon-box card-bg">
                  <app-icon name="credit-card" [size]="20" color="#e05326"></app-icon>
                </div>
                <div class="method-info">
                  <span class="method-name">Credit / Debit Card</span>
                  <span class="method-sub">Visa, Mastercard, RuPay</span>
                </div>
              </label>

              <!-- Digital Wallet -->
              <label class="method-option" [class.selected]="selectedMethod() === 'wallet'">
                <div class="method-radio">
                  <input type="radio" value="wallet" [(ngModel)]="selectedMethod" />
                  <span class="radio-dot"></span>
                </div>
                <div class="method-icon-box wallet-bg">
                  <app-icon name="wallet" [size]="20" color="#16a34a"></app-icon>
                </div>
                <div class="method-info">
                  <span class="method-name">Digital Wallets</span>
                  <span class="method-sub">Paytm Wallet, Amazon Pay, Mobikwik</span>
                </div>
              </label>

              <!-- Pay at Cashier Counter -->
              <label class="method-option" [class.selected]="selectedMethod() === 'counter'">
                <div class="method-radio">
                  <input type="radio" value="counter" [(ngModel)]="selectedMethod" />
                  <span class="radio-dot"></span>
                </div>
                <div class="method-icon-box counter-bg">
                  <app-icon name="store" [size]="20" color="#d97706"></app-icon>
                </div>
                <div class="method-info">
                  <span class="method-name">Pay at Counter (Cash/Card)</span>
                  <span class="method-sub">Settle physically with cashier</span>
                </div>
              </label>
            </div>
          </div>

          <!-- UPI Dynamic QR Code Box when UPI is active -->
          @if (selectedMethod() === 'upi') {
            <div class="upi-qr-card df-card animate-fade-in">
              <span class="qr-heading">Scan to Pay with Any UPI App</span>
              <div class="qr-box">
                @if (upiQrUrl()) {
                  <img [src]="upiQrUrl()" alt="UPI QR Code" />
                }
              </div>
              <span class="upi-id-tag">UPI ID: hoteljagdamba&#64;okhdfcbank</span>

              <!-- Quick App Deep-link Pill Buttons -->
              <div class="upi-apps-row">
                <span class="app-chip">GPay</span>
                <span class="app-chip">PhonePe</span>
                <span class="app-chip">Paytm</span>
                <span class="app-chip">BHIM</span>
              </div>
            </div>
          }

          <!-- Card Details Input when Card is active -->
          @if (selectedMethod() === 'card') {
            <div class="card-details-form df-card animate-fade-in">
              <div class="form-group">
                <label class="form-label">Card Number</label>
                <input type="text" placeholder="4532 •••• •••• 8892" class="df-input" />
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Expires</label>
                  <input type="text" placeholder="MM/YY" class="df-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">CVV</label>
                  <input type="password" placeholder="•••" maxlength="3" class="df-input" />
                </div>
              </div>
            </div>
          }

          <!-- Simulation Toggle for testing both success & failure states -->
          <div class="simulation-toggle-row">
            <label class="sim-check">
              <input type="checkbox" [(ngModel)]="simulateFailure" />
              <span>Simulate Bank Failure (Test Error Screen)</span>
            </label>
          </div>
        }

        <!-- 2. State: Processing Simulation -->
        @if (screenState() === 'processing') {
          <div class="processing-screen df-card animate-fade-in">
            <div class="processing-spinner"></div>
            <h2 class="proc-title">Contacting Bank Gateway...</h2>
            <p class="proc-sub">Please do not refresh or press back while we verify your transaction.</p>
            <span class="proc-amount">{{ (order()?.grandTotal || 1240) | currencyInr }}</span>
          </div>
        }

        <!-- 3. State: Payment Successful -->
        @if (screenState() === 'success') {
          <div class="result-card success-card df-card animate-slide-up">
            <div class="result-icon-circle success">
              <app-icon name="check" [size]="48" color="#ffffff" [strokeWidth]="3"></app-icon>
            </div>

            <h2 class="result-title">Payment Successful!</h2>
            <p class="result-sub">Your payment of {{ paymentResult()?.amount | currencyInr }} has been confirmed.</p>

            <div class="txn-meta-box">
              <div class="meta-line">
                <span class="meta-label">Transaction ID:</span>
                <span class="meta-value">{{ paymentResult()?.transactionId }}</span>
              </div>
              <div class="meta-line">
                <span class="meta-label">Order Reference:</span>
                <span class="meta-value">#{{ order()?.orderNumber || 'ORD-1042' }}</span>
              </div>
              <div class="meta-line">
                <span class="meta-label">Payment Mode:</span>
                <span class="meta-value">{{ paymentResult()?.method | uppercase }}</span>
              </div>
              <div class="meta-line">
                <span class="meta-label">Dining Table:</span>
                <span class="meta-value">Table {{ order()?.tableNumber || '08' }}</span>
              </div>
            </div>

            <div class="result-actions">
              <app-button
                variant="primary"
                size="lg"
                [fullWidth]="true"
                (btnClick)="goToTracking()"
              >
                View Kitchen Status
              </app-button>
              <button class="receipt-link" (click)="printReceipt()">
                <app-icon name="printer" [size]="15"></app-icon>
                <span>Download / Print Receipt</span>
              </button>
            </div>
          </div>
        }

        <!-- 4. State: Payment Failed -->
        @if (screenState() === 'failed') {
          <div class="result-card failed-card df-card animate-slide-up">
            <div class="result-icon-circle failed">
              <app-icon name="x" [size]="48" color="#ffffff" [strokeWidth]="3"></app-icon>
            </div>

            <h2 class="result-title failed-title">Payment Declined</h2>
            <p class="result-sub">{{ paymentResult()?.errorMessage || 'Transaction could not be completed by your banking institution.' }}</p>

            <div class="failed-info-box">
              <app-icon name="alert-circle" [size]="18" color="#dc2626"></app-icon>
              <span>No money was debited from your account. You can retry with another method or choose Pay at Counter.</span>
            </div>

            <div class="result-actions">
              <app-button
                variant="danger"
                size="lg"
                [fullWidth]="true"
                iconLeft="refresh-cw"
                (btnClick)="retryPayment()"
              >
                Retry Payment
              </app-button>

              <app-button
                variant="outline"
                size="md"
                [fullWidth]="true"
                (btnClick)="payAtCounterFallback()"
              >
                Switch to Pay at Counter
              </app-button>
            </div>
          </div>
        }
      </main>

      <!-- Bottom Sticky Payment CTA Button -->
      @if (screenState() === 'select') {
        <footer class="pay-sticky-footer">
          <div class="footer-summary">
            <span class="sum-tag">Total Payable</span>
            <span class="sum-amt">{{ (order()?.grandTotal || 1240) | currencyInr }}</span>
          </div>

          <div class="footer-cta-col">
            <app-button
              variant="primary"
              size="lg"
              [fullWidth]="true"
              (btnClick)="initiatePayment()"
            >
              <span>{{ selectedMethod() === 'counter' ? 'Confirm Pay at Counter' : 'Pay ' + ((order()?.grandTotal || 1240) | currencyInr) }}</span>
            </app-button>
          </div>
        </footer>
      }
    </div>
  `,
  styles: [
    `
      .pay-viewport {
        max-width: 520px;
        margin: 0 auto;
        min-height: 100vh;
        background-color: var(--color-bg);
        display: flex;
        flex-direction: column;
        padding-bottom: 96px;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.05);
      }

      .pay-topbar {
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

      .space-placeholder {
        width: 36px;
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

      .pay-main {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* Amount Banner */
      .bill-amount-banner {
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 4px;
        background: linear-gradient(180deg, #ffffff 0%, var(--color-surface-subtle) 100%);
      }

      .payable-label {
        font-size: 0.725rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--color-text-muted);
      }

      .payable-amount {
        font-size: 2.3rem;
        font-weight: 900;
        color: var(--color-primary);
        line-height: 1.1;
      }

      .order-ref {
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
        font-weight: 600;
      }

      /* Methods Card */
      .payment-methods-card {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .section-title {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .methods-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .method-option {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 14px;
        border: 1.5px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .method-option:hover {
        border-color: rgba(224, 83, 38, 0.4);
      }
      .method-option.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-light);
      }

      .method-radio input {
        display: none;
      }

      .radio-dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid var(--color-surface-border);
        display: block;
        position: relative;
        transition: all var(--transition-fast);
      }
      .method-option.selected .radio-dot {
        border-color: var(--color-primary);
      }
      .method-option.selected .radio-dot:after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--color-primary);
      }

      .method-icon-box {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .upi-bg { background: #eff6ff; }
      .card-bg { background: #fff2eb; }
      .wallet-bg { background: #ecfdf5; }
      .counter-bg { background: #fffbeb; }

      .method-info {
        display: flex;
        flex-direction: column;
      }

      .method-name {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .method-sub {
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }

      /* UPI QR Card */
      .upi-qr-card {
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        text-align: center;
      }

      .qr-heading {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .qr-box {
        width: 170px;
        height: 170px;
        padding: 6px;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
      }
      .qr-box img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .upi-id-tag {
        font-size: 0.775rem;
        font-family: monospace;
        font-weight: 700;
        padding: 4px 10px;
        background: var(--color-surface-subtle);
        border-radius: var(--radius-full);
      }

      .upi-apps-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .app-chip {
        font-size: 0.725rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: var(--radius-full);
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
      }

      /* Card Form */
      .card-details-form {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .form-label {
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .form-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .df-input {
        padding: 10px 12px;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        outline: none;
      }

      .simulation-toggle-row {
        padding: 10px 14px;
        background: #fff8f5;
        border: 1px dashed #fed7aa;
        border-radius: var(--radius-md);
      }

      .sim-check {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #9a3412;
        cursor: pointer;
      }

      /* Processing View */
      .processing-screen {
        padding: 60px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 16px;
      }

      .processing-spinner {
        width: 56px;
        height: 56px;
        border: 4px solid var(--color-primary-light);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .proc-title {
        font-size: 1.25rem;
        font-weight: 800;
      }

      .proc-sub {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        max-width: 300px;
      }

      .proc-amount {
        font-size: 1.6rem;
        font-weight: 900;
        color: var(--color-primary);
      }

      /* Result Screens */
      .result-card {
        padding: 36px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 14px;
      }

      .result-icon-circle {
        width: 76px;
        height: 76px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
      .result-icon-circle.success {
        background: linear-gradient(135deg, #16a34a, #15803d);
      }
      .result-icon-circle.failed {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
      }

      .result-title {
        font-size: 1.45rem;
        font-weight: 800;
        color: #1a1817;
      }
      .failed-title {
        color: #dc2626;
      }

      .result-sub {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        max-width: 320px;
      }

      .txn-meta-box {
        width: 100%;
        background: var(--color-surface-subtle);
        border-radius: var(--radius-md);
        padding: 14px 18px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 6px 0 12px;
        text-align: left;
      }

      .meta-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8125rem;
      }

      .meta-label {
        color: var(--color-text-muted);
      }

      .meta-value {
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .failed-info-box {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 12px 14px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: var(--radius-md);
        font-size: 0.8125rem;
        color: #991b1b;
        text-align: left;
        margin-bottom: 8px;
      }

      .result-actions {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .receipt-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--color-primary);
        cursor: pointer;
        padding: 6px;
      }

      /* Sticky Payment Footer */
      .pay-sticky-footer {
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
        gap: 16px;
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
        z-index: 200;
      }

      .footer-summary {
        display: flex;
        flex-direction: column;
      }

      .sum-tag {
        font-size: 0.725rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        font-weight: 600;
      }

      .sum-amt {
        font-size: 1.35rem;
        font-weight: 900;
        color: var(--color-text-primary);
        line-height: 1.1;
      }

      .footer-cta-col {
        flex: 1;
      }
    `,
  ],
})
export class CustomerPaymentComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly toastService = inject(ToastService);

  public readonly order = signal<Order | null>(null);
  public readonly restaurantSlug = signal<string>('hotel-jagdamba');
  public readonly tableToken = signal<string>('abc123');
  public readonly orderId = signal<string>('ord-1042');

  public readonly screenState = signal<PaymentScreenState>('select');
  public selectedMethod = signal<PaymentMethod>('upi');
  public simulateFailure: boolean = false;
  public readonly paymentResult = signal<PaymentResult | null>(null);
  public readonly upiQrUrl = signal<string>('');

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async (params) => {
      this.restaurantSlug.set(params['restaurantSlug'] || 'hotel-jagdamba');
      this.tableToken.set(params['tableToken'] || 'abc123');
      const oId = params['orderId'] || 'ord-1042';
      this.orderId.set(oId);

      this.orderService.getOrderById(oId).subscribe((ord) => {
        this.order.set(ord);
      });

      // Generate dummy UPI QR
      const upiPayload = `upi://pay?pa=hoteljagdamba@okhdfcbank&pn=HotelJagdamba&am=${this.order()?.grandTotal || 1240}&cu=INR`;
      const qr = await QRCode.toDataURL(upiPayload, { width: 300, margin: 1 });
      this.upiQrUrl.set(qr);
    });
  }

  initiatePayment() {
    this.screenState.set('processing');

    const amount = this.order()?.grandTotal || 1240;

    this.paymentService
      .processPayment({
        orderId: this.orderId(),
        orderNumber: this.order()?.orderNumber || 'ORD-1042',
        amount,
        method: this.selectedMethod(),
        forceFailure: this.simulateFailure,
      })
      .subscribe((result) => {
        this.paymentResult.set(result);

        if (result.success) {
          this.screenState.set('success');
          // Update order status in OrderService
          const ord = this.order();
          if (ord) {
            ord.paymentStatus = 'paid';
            ord.paymentMethod = this.selectedMethod();
          }

          try {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {}
        } else {
          this.screenState.set('failed');
        }
      });
  }

  retryPayment() {
    this.screenState.set('select');
    this.simulateFailure = false;
  }

  payAtCounterFallback() {
    this.selectedMethod.set('counter');
    this.simulateFailure = false;
    this.screenState.set('select');
    this.initiatePayment();
  }

  goToTracking() {
    this.router.navigate([
      '/r',
      this.restaurantSlug(),
      't',
      this.tableToken(),
      'track',
      this.orderId(),
    ]);
  }

  printReceipt() {
    window.print();
  }
}

