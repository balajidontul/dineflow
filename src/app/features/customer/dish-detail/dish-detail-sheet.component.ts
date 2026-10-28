import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem } from '../../../core/models/menu.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { VegBadgeComponent } from '../../../shared/components/veg-badge/veg-badge.component';
import { QuantitySelectorComponent } from '../../../shared/components/quantity-selector/quantity-selector.component';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-dish-detail-sheet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    ButtonComponent,
    VegBadgeComponent,
    QuantitySelectorComponent,
    CurrencyInrPipe,
  ],
  template: `
    @if (isOpen && item) {
      <div class="sheet-backdrop" (click)="close()">
        <div class="sheet-modal" (click)="$event.stopPropagation()">
          <!-- Close Drag / Button -->
          <div class="sheet-handle-bar">
            <div class="drag-pill"></div>
          </div>

          <button type="button" class="floating-close-btn" (click)="close()" aria-label="Close dish details">
            <app-icon name="x" [size]="18"></app-icon>
          </button>

          <!-- Large Dish Photography Hero -->
          <div class="hero-image-box">
            <img [src]="item.imageUrl" [alt]="item.name" />
            <div class="hero-scrim"></div>

            <div class="hero-floating-badges">
              @if (item.bestseller) {
                <span class="badge-ribbon bestseller">
                  <app-icon name="star" [size]="12"></app-icon> Chef's Bestseller
                </span>
              }
              @if (item.spiceLevel === 'spicy' || item.spiceLevel === 'extra_spicy') {
                <span class="badge-ribbon spicy">
                  <app-icon name="flame" [size]="12"></app-icon> Hot & Spicy
                </span>
              }
            </div>
          </div>

          <!-- Content Body -->
          <div class="sheet-body">
            <!-- Title, Local Name & Dietary -->
            <div class="dish-identity">
              <div class="dietary-row">
                <app-veg-badge [veg]="item.veg"></app-veg-badge>
                <span class="diet-label">{{ item.veg ? 'Pure Vegetarian' : 'Non-Vegetarian' }}</span>
              </div>

              <!-- Marathi name first when available for authentic local dining -->
              @if (item.localName) {
                <h1 class="dish-marathi-title">{{ item.localName }}</h1>
              }
              <h2 class="dish-english-title">{{ item.name }}</h2>

              <div class="price-portion-row">
                <div class="price-combo">
                  <span class="item-current-price">{{ (item.discountPrice || item.price) | currencyInr }}</span>
                  @if (item.discountPrice) {
                    <span class="item-old-price">{{ item.price | currencyInr }}</span>
                  }
                </div>

                @if (item.portionSize) {
                  <span class="portion-badge">{{ item.portionSize }}</span>
                }
              </div>
            </div>

            <!-- Key Culinary Metrics -->
            <div class="culinary-pills-row">
              <div class="metric-pill">
                <app-icon name="clock" [size]="15" color="var(--color-primary)"></app-icon>
                <span>{{ item.preparationTime }} mins</span>
              </div>

              <div class="metric-pill">
                <app-icon name="flame" [size]="15" [color]="item.spiceLevel === 'spicy' ? '#dc2626' : '#d97706'"></app-icon>
                <span>{{ formatSpiceLevel(item.spiceLevel) }}</span>
              </div>

              <div class="metric-pill">
                <app-icon name="utensils" [size]="15" color="#16a34a"></app-icon>
                <span>Fresh Cooked</span>
              </div>
            </div>

            <!-- Description -->
            <div class="description-section">
              <h4 class="subhead">About this dish</h4>
              <p class="description-text">{{ item.description }}</p>
            </div>

            <!-- Authentic Ingredients -->
            @if (item.ingredients && item.ingredients.length > 0) {
              <div class="ingredients-section">
                <h4 class="subhead">Key Ingredients & Masalas</h4>
                <div class="ingredients-tags">
                  @for (ing of item.ingredients; track ing) {
                    <span class="ing-tag">{{ ing }}</span>
                  }
                </div>
              </div>
            }

            <!-- Special Instructions Input -->
            <div class="instructions-section">
              <label class="subhead" for="specialNotes">
                Special Cooking Instructions <span class="optional-hint">(Optional)</span>
              </label>
              <textarea
                id="specialNotes"
                rows="2"
                [(ngModel)]="specialInstructions"
                placeholder="e.g. Less spicy, extra tambda rassa on the side, no onions in salad..."
                class="instructions-input"
              ></textarea>
            </div>
          </div>

          <!-- Bottom Sticky Action Bar -->
          <div class="sheet-action-bar">
            <div class="quantity-col">
              <app-quantity-selector
                [value]="quantity()"
                [min]="1"
                [max]="20"
                size="lg"
                (valueChange)="quantity.set($event)"
              ></app-quantity-selector>
            </div>

            <div class="cta-col">
              <app-button
                variant="primary"
                size="lg"
                [fullWidth]="true"
                (btnClick)="confirmAddToCart()"
              >
                <span>Add to Order</span>
                <span class="dot-separator">•</span>
                <span>{{ ((item.discountPrice || item.price) * quantity()) | currencyInr }}</span>
              </app-button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .sheet-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(20, 18, 17, 0.65);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 1500;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        animation: fadeIn 200ms ease;
      }

      .sheet-modal {
        background: #ffffff;
        border-radius: 28px 28px 0 0;
        width: 100%;
        max-width: 540px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        animation: slideUp 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        position: relative;
        overflow: hidden;
      }

      .sheet-handle-bar {
        position: absolute;
        top: 10px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        z-index: 10;
      }

      .drag-pill {
        width: 44px;
        height: 5px;
        border-radius: var(--radius-full);
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }

      .floating-close-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 34px;
        height: 34px;
        border-radius: var(--radius-full);
        background: rgba(20, 18, 17, 0.6);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 15;
        backdrop-filter: blur(4px);
        cursor: pointer;
        transition: transform var(--transition-fast);
      }
      .floating-close-btn:hover {
        transform: scale(1.08);
      }

      /* Hero Photography */
      .hero-image-box {
        position: relative;
        height: 260px;
        width: 100%;
        background: #1a1817;
      }
      .hero-image-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .hero-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, transparent 40%, rgba(0, 0, 0, 0.4) 100%);
      }

      .hero-floating-badges {
        position: absolute;
        bottom: 14px;
        left: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .badge-ribbon {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px;
        border-radius: var(--radius-full);
        font-size: 0.725rem;
        font-weight: 800;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      }
      .badge-ribbon.bestseller {
        background: #f59e0b;
        color: #1a1817;
      }
      .badge-ribbon.spicy {
        background: #dc2626;
        color: #ffffff;
      }

      /* Sheet Body */
      .sheet-body {
        padding: 22px 22px 14px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .dietary-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .diet-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .dish-marathi-title {
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--color-text-primary);
        line-height: 1.2;
      }

      .dish-english-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--color-text-secondary);
        margin-top: 2px;
      }

      .price-portion-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-top: 10px;
      }

      .price-combo {
        display: flex;
        align-items: baseline;
        gap: 10px;
      }

      .item-current-price {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-primary);
      }

      .item-old-price {
        font-size: 1rem;
        color: var(--color-text-muted);
        text-decoration: line-through;
      }

      .portion-badge {
        font-size: 0.775rem;
        font-weight: 600;
        color: var(--color-text-muted);
        background: var(--color-surface-subtle);
        padding: 4px 10px;
        border-radius: var(--radius-full);
      }

      /* Culinary metrics pills */
      .culinary-pills-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .metric-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      .subhead {
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 6px;
        display: block;
      }

      .description-text {
        font-size: 0.9rem;
        line-height: 1.55;
        color: var(--color-text-secondary);
      }

      .ingredients-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .ing-tag {
        font-size: 0.775rem;
        font-weight: 600;
        padding: 4px 10px;
        background: var(--color-primary-light);
        color: var(--color-primary);
        border-radius: var(--radius-full);
      }

      .optional-hint {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--color-text-muted);
      }

      .instructions-input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        font-family: inherit;
        outline: none;
        resize: none;
      }
      .instructions-input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }

      /* Sticky Action Bar */
      .sheet-action-bar {
        padding: 16px 20px;
        border-top: 1px solid var(--color-surface-border);
        background: #ffffff;
        display: flex;
        align-items: center;
        gap: 14px;
        box-shadow: 0 -4px 14px rgba(0, 0, 0, 0.05);
      }

      .quantity-col {
        flex-shrink: 0;
      }

      .cta-col {
        flex: 1;
      }

      .dot-separator {
        opacity: 0.6;
        margin: 0 4px;
      }
    `,
  ],
})
export class DishDetailSheetComponent {
  @Input() isOpen = false;
  @Input() item: MenuItem | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<{ item: MenuItem; quantity: number; instructions: string }>();

  public quantity = signal<number>(1);
  public specialInstructions: string = '';

  formatSpiceLevel(spice: string): string {
    switch (spice) {
      case 'none': return 'Mild / No Spice';
      case 'mild': return 'Mild (मृदू)';
      case 'medium': return 'Medium Spiced';
      case 'spicy': return 'Spicy (झणझणीत)';
      case 'extra_spicy': return 'Extra Hot (कोल्हापुरी)';
      default: return 'Medium Spiced';
    }
  }

  confirmAddToCart() {
    if (this.item) {
      this.addToCart.emit({
        item: this.item,
        quantity: this.quantity(),
        instructions: this.specialInstructions.trim(),
      });
      this.close();
    }
  }

  close() {
    this.quantity.set(1);
    this.specialInstructions = '';
    this.closed.emit();
  }
}

