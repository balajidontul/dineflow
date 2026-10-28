import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { TableService } from '../../../core/services/table.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { RestaurantTable } from '../../../core/models/table.model';
import { Restaurant } from '../../../core/models/restaurant.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { VegBadgeComponent } from '../../../shared/components/veg-badge/veg-badge.component';
import { QuantitySelectorComponent } from '../../../shared/components/quantity-selector/quantity-selector.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-customer-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IconComponent,
    ButtonComponent,
    VegBadgeComponent,
    QuantitySelectorComponent,
    EmptyStateComponent,
    CurrencyInrPipe,
  ],
  template: `
    <div class="cart-viewport animate-fade-in">
      <!-- Cart Header Bar -->
      <header class="cart-topbar">
        <a [routerLink]="['/r', restaurantSlug(), 't', tableToken()]" class="back-btn" aria-label="Back to menu">
          <app-icon name="arrow-left" [size]="20"></app-icon>
        </a>

        <div class="cart-title-block">
          <h1 class="cart-title">Your Order</h1>
          <span class="cart-table-pill">Table {{ currentTable()?.tableNumber || '08' }}</span>
        </div>

        <button
          type="button"
          class="clear-all-btn"
          *ngIf="cartService.cartItems().length > 0"
          (click)="clearCart()"
        >
          Clear
        </button>
      </header>

      <!-- Cart Main Content -->
      <main class="cart-content">
        @if (cartService.cartItems().length > 0) {
          <!-- Order Items Card List -->
          <div class="items-card df-card">
            <div class="items-list-header">
              <span class="sub-heading">Selected Dishes ({{ cartService.totalItemCount() }})</span>
              <a [routerLink]="['/r', restaurantSlug(), 't', tableToken()]" class="add-more-link">
                <app-icon name="plus" [size]="14"></app-icon> Add More Items
              </a>
            </div>

            <div class="cart-items-stream">
              @for (ci of cartService.cartItems(); track ci.menuItem.id) {
                <div class="cart-item-row">
                  <div class="item-thumb">
                    <img [src]="ci.menuItem.imageUrl" [alt]="ci.menuItem.name" />
                  </div>

                  <div class="item-details">
                    <div class="name-badge-row">
                      <app-veg-badge [veg]="ci.menuItem.veg"></app-veg-badge>
                      <div class="name-stack">
                        @if (ci.menuItem.localName) {
                          <span class="local-name">{{ ci.menuItem.localName }}</span>
                        }
                        <h3 class="eng-name">{{ ci.menuItem.name }}</h3>
                      </div>
                    </div>

                    <div class="price-stepper-row">
                      <span class="unit-price">
                        {{ ((ci.menuItem.discountPrice || ci.menuItem.price) * ci.quantity) | currencyInr }}
                      </span>

                      <app-quantity-selector
                        [value]="ci.quantity"
                        [min]="0"
                        [max]="20"
                        size="sm"
                        [allowDeleteIcon]="true"
                        (valueChange)="updateQuantity(ci.menuItem.id, $event)"
                      ></app-quantity-selector>
                    </div>

                    @if (ci.specialInstructions) {
                      <div class="item-note">
                        <app-icon name="info" [size]="13"></app-icon>
                        <span>"{{ ci.specialInstructions }}"</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Kitchen Cooking Notes Box -->
          <div class="instructions-card df-card">
            <div class="notes-header">
              <app-icon name="chef-hat" [size]="18" color="var(--color-primary)"></app-icon>
              <h3 class="notes-title">Special Cooking Instructions</h3>
            </div>
            <textarea
              rows="2"
              [(ngModel)]="orderNotes"
              placeholder="e.g. Less spicy, keep gravies on the side, prompt water service..."
              class="notes-textarea"
            ></textarea>
          </div>

          <!-- Bill Summary Card -->
          <div class="bill-details-card df-card">
            <h3 class="bill-title">Bill Details</h3>

            <div class="bill-line">
              <span class="bill-label">Item Total</span>
              <span class="bill-value">{{ cartService.itemTotal() | currencyInr }}</span>
            </div>

            <div class="bill-line">
              <span class="bill-label">
                GST ({{ restaurant()?.taxPercentage || 5 }}%)
                <span class="gov-tag">Govt Tax</span>
              </span>
              <span class="bill-value">{{ cartService.taxAmount() | currencyInr }}</span>
            </div>

            <div class="bill-line">
              <span class="bill-label">
                Restaurant Service Charge ({{ restaurant()?.serviceChargePercentage || 2.5 }}%)
              </span>
              <span class="bill-value">{{ cartService.serviceCharge() | currencyInr }}</span>
            </div>

            <div class="bill-divider"></div>

            <div class="bill-grand-total-row">
              <div>
                <span class="grand-label">Grand Total</span>
                <span class="grand-sub">Inclusive of all taxes</span>
              </div>
              <span class="grand-price">{{ cartService.grandTotal() | currencyInr }}</span>
            </div>
          </div>

          <!-- Dining Guarantee Note -->
          <div class="order-reassurance-box">
            <app-icon name="shield-check" [size]="18" color="#16a34a"></app-icon>
            <span>Freshly prepared and dispatched hot to Table {{ currentTable()?.tableNumber || '08' }}</span>
          </div>
        } @else {
          <!-- Empty Cart State -->
          <div class="empty-cart-view">
            <app-empty-state
              icon="shopping-bag"
              title="Your Order is Empty"
              description="You have not added any dishes to your table order yet. Explore our authentic Maharashtrian menu and pick your favorites."
              actionLabel="Browse Menu"
              actionIcon="utensils"
              (action)="returnToMenu()"
            ></app-empty-state>
          </div>
        }
      </main>

      <!-- Sticky Place Order CTA Footer -->
      @if (cartService.cartItems().length > 0) {
        <footer class="cart-sticky-footer">
          <div class="footer-total-col">
            <span class="footer-total-label">Total to Pay</span>
            <span class="footer-total-value">{{ cartService.grandTotal() | currencyInr }}</span>
          </div>

          <div class="footer-btn-col">
            <app-button
              variant="primary"
              size="lg"
              [fullWidth]="true"
              [loading]="isPlacingOrder()"
              (btnClick)="placeOrder()"
            >
              <span>Place Order • {{ cartService.grandTotal() | currencyInr }}</span>
            </app-button>
          </div>
        </footer>
      }
    </div>
  `,
  styles: [
    `
      .cart-viewport {
        max-width: 520px;
        margin: 0 auto;
        min-height: 100vh;
        background-color: var(--color-bg);
        display: flex;
        flex-direction: column;
        padding-bottom: 100px;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.05);
      }

      .cart-topbar {
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

      .back-btn {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-primary);
        background: var(--color-surface-subtle);
      }

      .cart-title-block {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .cart-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .cart-table-pill {
        font-size: 0.775rem;
        font-weight: 800;
        padding: 3px 10px;
        background: var(--color-primary-light);
        color: var(--color-primary);
        border-radius: var(--radius-full);
      }

      .clear-all-btn {
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--color-danger);
        cursor: pointer;
        padding: 4px 8px;
      }

      .cart-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex: 1;
      }

      /* Items Card */
      .items-card {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .items-list-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--color-surface-border);
      }

      .sub-heading {
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .add-more-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--color-primary);
      }

      .cart-items-stream {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .cart-item-row {
        display: flex;
        gap: 14px;
        align-items: flex-start;
      }

      .item-thumb {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-md);
        overflow: hidden;
        flex-shrink: 0;
        background: #eeeae4;
      }
      .item-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .item-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .name-badge-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }

      .name-stack {
        display: flex;
        flex-direction: column;
      }

      .local-name {
        font-size: 0.875rem;
        font-weight: 800;
        color: var(--color-text-primary);
        line-height: 1.2;
      }

      .eng-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      .price-stepper-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
      }

      .unit-price {
        font-size: 1rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .item-note {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.725rem;
        color: var(--color-primary);
        font-style: italic;
        margin-top: 2px;
      }

      /* Cooking Notes */
      .instructions-card {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .notes-header {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .notes-title {
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .notes-textarea {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        font-size: 0.8125rem;
        font-family: inherit;
        outline: none;
        resize: none;
      }
      .notes-textarea:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }

      /* Bill Breakdown Card */
      .bill-details-card {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .bill-title {
        font-size: 0.9375rem;
        font-weight: 800;
        color: var(--color-text-primary);
        margin-bottom: 4px;
      }

      .bill-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.85rem;
      }

      .bill-label {
        color: var(--color-text-secondary);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .gov-tag {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: var(--radius-full);
        background: #ecfdf5;
        color: #047857;
      }

      .bill-value {
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .bill-divider {
        height: 1px;
        background: var(--color-surface-border);
        margin: 6px 0;
      }

      .bill-grand-total-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .grand-label {
        display: block;
        font-size: 1rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .grand-sub {
        display: block;
        font-size: 0.7rem;
        color: var(--color-text-muted);
      }

      .grand-price {
        font-size: 1.45rem;
        font-weight: 900;
        color: var(--color-primary);
      }

      .order-reassurance-box {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: var(--radius-md);
        font-size: 0.775rem;
        font-weight: 600;
        color: #166534;
      }

      /* Sticky Place Order Footer */
      .cart-sticky-footer {
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

      .footer-total-col {
        display: flex;
        flex-direction: column;
      }

      .footer-total-label {
        font-size: 0.725rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        font-weight: 600;
      }

      .footer-total-value {
        font-size: 1.35rem;
        font-weight: 900;
        color: var(--color-text-primary);
        line-height: 1.1;
      }

      .footer-btn-col {
        flex: 1;
      }
    `,
  ],
})
export class CustomerCartComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  protected readonly restaurantService = inject(RestaurantService);
  protected readonly tableService = inject(TableService);
  private readonly orderService = inject(OrderService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public readonly restaurantSlug = signal<string>('hotel-jagdamba');
  public readonly tableToken = signal<string>('abc123');
  public readonly currentTable = signal<RestaurantTable | null>(null);
  public readonly restaurant = signal<Restaurant | null>(null);

  public orderNotes: string = '';
  public readonly isPlacingOrder = signal<boolean>(false);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const slug = params['restaurantSlug'] || 'hotel-jagdamba';
      const token = params['tableToken'] || 'abc123';
      this.restaurantSlug.set(slug);
      this.tableToken.set(token);

      this.restaurantService.getRestaurantBySlug(slug).subscribe((res) => {
        if (res) this.restaurant.set(res);
      });

      this.tableService.getTableByToken(token).subscribe((t) => {
        if (t) this.currentTable.set(t);
      });
    });
  }

  updateQuantity(itemId: string, qty: number) {
    this.cartService.updateQuantity(itemId, qty);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear all dishes from your order?')) {
      this.cartService.clearCart();
    }
  }

  returnToMenu() {
    this.router.navigate(['/r', this.restaurantSlug(), 't', this.tableToken()]);
  }

  placeOrder() {
    if (this.cartService.cartItems().length === 0) return;

    this.isPlacingOrder.set(true);

    const table = this.currentTable();
    const tableNum = table ? table.tableNumber : 'T08';
    const tableId = table ? table.id : 'tbl-08';

    const orderItems = this.cartService.cartItems().map((ci, index) => ({
      id: `oi-${Date.now()}-${index}`,
      menuItemId: ci.menuItem.id,
      name: ci.menuItem.name,
      localName: ci.menuItem.localName,
      price: ci.menuItem.discountPrice || ci.menuItem.price,
      quantity: ci.quantity,
      veg: ci.menuItem.veg,
      imageUrl: ci.menuItem.imageUrl,
      specialInstructions: ci.specialInstructions,
    }));

    this.orderService
      .createOrder({
        restaurantId: 'rest-jagdamba-01',
        branchId: 'branch-shivapur',
        tableId,
        tableNumber: tableNum,
        items: orderItems,
        itemTotal: this.cartService.itemTotal(),
        taxAmount: this.cartService.taxAmount(),
        serviceCharge: this.cartService.serviceCharge(),
        grandTotal: this.cartService.grandTotal(),
        status: 'placed',
        paymentStatus: 'pending',
        specialInstructions: this.orderNotes.trim() || undefined,
        prepTimeMinutes: 20,
      })
      .subscribe((createdOrder) => {
        this.cartService.clearCart();
        this.isPlacingOrder.set(false);

        // Navigate to confirmation screen
        this.router.navigate([
          '/r',
          this.restaurantSlug(),
          't',
          this.tableToken(),
          'confirm',
          createdOrder.id,
        ]);
      });
  }
}

