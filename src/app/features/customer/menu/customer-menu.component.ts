import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { MenuService } from '../../../core/services/menu.service';
import { TableService } from '../../../core/services/table.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Restaurant } from '../../../core/models/restaurant.model';
import { RestaurantTable } from '../../../core/models/table.model';
import { MenuItem, MenuCategory } from '../../../core/models/menu.model';
import { DishDetailSheetComponent } from '../dish-detail/dish-detail-sheet.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { VegBadgeComponent } from '../../../shared/components/veg-badge/veg-badge.component';
import { QuantitySelectorComponent } from '../../../shared/components/quantity-selector/quantity-selector.component';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-customer-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DishDetailSheetComponent,
    IconComponent,
    VegBadgeComponent,
    QuantitySelectorComponent,
    CurrencyInrPipe,
  ],
  template: `
    <div class="customer-viewport">
      <!-- Top Dining Context Bar (Fixed) -->
      <header class="dining-context-bar">
        <div class="res-mini-info">
          <div class="logo-circle">
            <img [src]="restaurant().logoUrl" alt="Restaurant logo" />
          </div>
          <div>
            <span class="res-mini-name">{{ restaurant().name }}</span>
            <span class="res-mini-locality">{{ restaurant().city }}</span>
          </div>
        </div>

        <div class="table-token-badge">
          <span class="tbl-dot"></span>
          <span class="tbl-label">Table {{ currentTable()?.tableNumber || '08' }}</span>
        </div>
      </header>

      <!-- Restaurant Hero Cover Card -->
      <section class="restaurant-hero-card">
        <div class="hero-image-backdrop">
          <img [src]="restaurant().coverImageUrl" alt="Restaurant atmosphere" />
          <div class="hero-backdrop-gradient"></div>
        </div>

        <div class="hero-card-content">
          <div class="hero-badge-row">
            <span class="status-open-pill">
              <span class="green-dot"></span> Open Now
            </span>
            <span class="prep-pill">
              <app-icon name="clock" [size]="13"></app-icon>
              {{ restaurant().prepTimeEstimate }}
            </span>
          </div>

          <div class="hero-names">
            @if (restaurant().localName) {
              <h1 class="hero-marathi-name">{{ restaurant().localName }}</h1>
            }
            <h2 class="hero-english-name">{{ restaurant().name }}</h2>
          </div>

          <div class="hero-ratings-row">
            <div class="rating-box">
              <app-icon name="star" [size]="14" color="#f59e0b"></app-icon>
              <span class="rating-num">{{ restaurant().rating }}</span>
              <span class="rating-count">({{ restaurant().reviewCount }}+ ratings)</span>
            </div>
            <span class="location-text">
              <app-icon name="map-pin" [size]="13"></app-icon>
              {{ restaurant().address }}
            </span>
          </div>
        </div>
      </section>

      <!-- Sticky Search & Category Navigation Bar -->
      <section class="sticky-nav-container">
        <!-- Sticky Search Input -->
        <div class="search-container">
          <div class="search-input-box">
            <app-icon name="search" [size]="18" class="search-icon"></app-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search Mutton, Biryani, Bhakri..."
              class="sticky-search-input"
            />
            @if (searchQuery()) {
              <button class="clear-search-btn" (click)="searchQuery.set('')" aria-label="Clear search">
                <app-icon name="x" [size]="15"></app-icon>
              </button>
            }
          </div>
        </div>

        <!-- Sticky Horizontally Scrollable Categories -->
        <div class="categories-scroll-track">
          <button
            class="customer-cat-tab"
            [class.active]="selectedCategory() === 'all'"
            (click)="selectCategory('all')"
          >
            <span>All Dishes</span>
          </button>

          @for (cat of menuService.activeCategories(); track cat.id) {
            <button
              class="customer-cat-tab"
              [class.active]="selectedCategory() === cat.id"
              (click)="selectCategory(cat.id)"
            >
              @if (cat.localName) {
                <span class="cat-tab-marathi">{{ cat.localName }}</span>
              }
              <span class="cat-tab-eng">{{ cat.name }}</span>
            </button>
          }
        </div>
      </section>

      <!-- Food Menu Sections / Cards Stream -->
      <main class="menu-items-stream">
        @if (filteredItems().length > 0) {
          @for (item of filteredItems(); track item.id) {
            <article class="food-card" (click)="openDishDetail(item)">
              <!-- Food Image Left / Right -->
              <div class="food-card-left">
                <!-- Dietary & Bilingual Header -->
                <div class="food-header-line">
                  <app-veg-badge [veg]="item.veg"></app-veg-badge>
                  <div class="badge-cluster">
                    @if (item.bestseller) {
                      <span class="card-tag bestseller">
                        <app-icon name="star" [size]="11"></app-icon> Bestseller
                      </span>
                    }
                    @if (item.spiceLevel === 'spicy' || item.spiceLevel === 'extra_spicy') {
                      <span class="card-tag spicy">
                        <app-icon name="flame" [size]="11"></app-icon> Spicy
                      </span>
                    }
                  </div>
                </div>

                <!-- Names: Marathi first when available! -->
                <div class="food-titles">
                  @if (item.localName) {
                    <h3 class="marathi-title">{{ item.localName }}</h3>
                  }
                  <h4 class="english-title">{{ item.name }}</h4>
                </div>

                <!-- Price Row -->
                <div class="food-price-row">
                  <span class="food-price">{{ (item.discountPrice || item.price) | currencyInr }}</span>
                  @if (item.discountPrice) {
                    <span class="food-discount-old">{{ item.price | currencyInr }}</span>
                  }
                  @if (item.portionSize) {
                    <span class="portion-label">{{ item.portionSize }}</span>
                  }
                </div>

                <!-- Description Snippet -->
                <p class="food-desc-snippet">{{ item.description }}</p>
              </div>

              <!-- Food Thumbnail & Add Button -->
              <div class="food-card-right" (click)="$event.stopPropagation()">
                <div class="food-thumb-box" (click)="openDishDetail(item)">
                  <img [src]="item.imageUrl" [alt]="item.name" loading="lazy" />
                </div>

                <!-- Morphing ADD Button / [- 1 +] Selector -->
                <div class="add-button-anchor">
                  @if (getCartQty(item.id) === 0) {
                    <button
                      type="button"
                      class="btn-add-morphed"
                      (click)="quickAdd(item, $event)"
                      aria-label="Add item to cart"
                    >
                      <span>ADD</span>
                      <app-icon name="plus" [size]="14"></app-icon>
                    </button>
                  } @else {
                    <div class="active-qty-wrapper">
                      <app-quantity-selector
                        [value]="getCartQty(item.id)"
                        [min]="0"
                        [max]="20"
                        size="sm"
                        [allowDeleteIcon]="true"
                        (valueChange)="updateCartQty(item, $event)"
                      ></app-quantity-selector>
                    </div>
                  }
                </div>
              </div>
            </article>
          }
        } @else {
          <div class="no-results-box">
            <app-icon name="search" [size]="36" color="var(--color-primary)"></app-icon>
            <h3>No culinary matches found</h3>
            <p>Try searching for other popular specialties like "Mutton", "Biryani", "Bhakri", or "Solkadhi".</p>
          </div>
        }
      </main>

      <!-- Floating Bottom Sticky Cart Bar -->
      @if (cartService.totalItemCount() > 0) {
        <div class="floating-cart-bar animate-slide-up">
          <div class="cart-bar-left">
            <div class="cart-icon-bubble">
              <app-icon name="shopping-bag" [size]="20" color="#ffffff"></app-icon>
              <span class="cart-bubble-count">{{ cartService.totalItemCount() }}</span>
            </div>
            <div class="cart-bar-meta">
              <span class="cart-items-count">{{ cartService.totalItemCount() }} {{ cartService.totalItemCount() === 1 ? 'item' : 'items' }}</span>
              <span class="cart-grand-total">{{ cartService.grandTotal() | currencyInr }}</span>
            </div>
          </div>

          <a
            [routerLink]="['/r', restaurant().slug, 't', currentTableToken(), 'cart']"
            class="view-order-cta"
          >
            <span>View Order</span>
            <app-icon name="arrow-right" [size]="17"></app-icon>
          </a>
        </div>
      }

      <!-- Dish Detail Bottom Sheet Modal -->
      <app-dish-detail-sheet
        [isOpen]="isDetailOpen()"
        [item]="selectedDish()"
        (closed)="closeDishDetail()"
        (addToCart)="handleAddToCart($event)"
      ></app-dish-detail-sheet>
    </div>
  `,
  styles: [
    `
      .customer-viewport {
        max-width: 520px;
        margin: 0 auto;
        min-height: 100vh;
        background-color: var(--color-bg);
        position: relative;
        padding-bottom: 90px;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.05);
      }

      /* Fixed Top Bar */
      .dining-context-bar {
        position: sticky;
        top: 0;
        z-index: 100;
        height: 56px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border-bottom: 1px solid var(--color-surface-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
      }

      .res-mini-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .logo-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        border: 1.5px solid var(--color-primary);
        flex-shrink: 0;
      }
      .logo-circle img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .res-mini-name {
        display: block;
        font-weight: 700;
        font-size: 0.875rem;
        color: var(--color-text-primary);
        line-height: 1.2;
      }

      .res-mini-locality {
        display: block;
        font-size: 0.7rem;
        color: var(--color-text-muted);
      }

      .table-token-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        background: var(--color-primary-light);
        border: 1px solid rgba(224, 83, 38, 0.25);
        border-radius: var(--radius-full);
      }

      .tbl-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: #16a34a;
        animation: pulseGlow 1.5s infinite;
      }

      .tbl-label {
        font-size: 0.8125rem;
        font-weight: 800;
        color: var(--color-primary);
      }

      /* Hero Restaurant Card */
      .restaurant-hero-card {
        position: relative;
        overflow: hidden;
        margin: 12px 16px;
        border-radius: var(--radius-xl);
        background: #1a1817;
        box-shadow: var(--shadow-md);
      }

      .hero-image-backdrop {
        height: 170px;
        position: relative;
        overflow: hidden;
      }
      .hero-image-backdrop img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.85;
      }

      .hero-backdrop-gradient {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(20, 18, 17, 0.2) 0%, rgba(20, 18, 17, 0.85) 100%);
      }

      .hero-card-content {
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;
        z-index: 2;
        margin-top: -60px;
      }

      .hero-badge-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .status-open-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 9px;
        background: rgba(22, 163, 74, 0.9);
        color: #ffffff;
        font-size: 0.725rem;
        font-weight: 700;
        border-radius: var(--radius-full);
      }

      .green-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ffffff;
      }

      .prep-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 9px;
        background: rgba(20, 18, 17, 0.75);
        color: #f5f2ed;
        font-size: 0.725rem;
        font-weight: 600;
        border-radius: var(--radius-full);
        backdrop-filter: blur(4px);
      }

      .hero-names {
        display: flex;
        flex-direction: column;
      }

      .hero-marathi-name {
        font-size: 1.45rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.2;
      }

      .hero-english-name {
        font-size: 1.05rem;
        font-weight: 600;
        color: #e5e0d8;
        line-height: 1.2;
      }

      .hero-ratings-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.775rem;
        color: #ccc;
        margin-top: 4px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
      }

      .rating-box {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .rating-num {
        font-weight: 800;
        color: #ffffff;
      }

      .rating-count {
        color: #aaa;
      }

      .location-text {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #bbb;
        max-width: 170px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Sticky Nav & Categories */
      .sticky-nav-container {
        position: sticky;
        top: 56px;
        z-index: 95;
        background: var(--color-bg);
        padding-top: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      }

      .search-container {
        padding: 0 16px 8px;
      }

      .search-input-box {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 14px;
        color: var(--color-text-muted);
        pointer-events: none;
      }

      .sticky-search-input {
        width: 100%;
        padding: 11px 36px 11px 42px;
        background: #ffffff;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        font-size: 0.875rem;
        color: var(--color-text-primary);
        box-shadow: var(--shadow-sm);
        outline: none;
        transition: all var(--transition-fast);
      }
      .sticky-search-input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }

      .clear-search-btn {
        position: absolute;
        right: 12px;
        color: var(--color-text-muted);
        cursor: pointer;
      }

      /* Horizontal Categories */
      .categories-scroll-track {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 16px 12px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .categories-scroll-track::-webkit-scrollbar {
        display: none;
      }

      .customer-cat-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px 16px;
        background: #ffffff;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        white-space: nowrap;
        cursor: pointer;
        transition: all var(--transition-fast);
        box-shadow: var(--shadow-xs);
        flex-shrink: 0;
      }
      .customer-cat-tab.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        box-shadow: 0 4px 12px var(--color-primary-glow);
      }

      .cat-tab-marathi {
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--color-primary);
        line-height: 1.1;
      }
      .customer-cat-tab.active .cat-tab-marathi {
        color: #ffffff;
      }

      .cat-tab-eng {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-secondary);
      }
      .customer-cat-tab.active .cat-tab-eng {
        color: #ffffff;
      }

      /* Menu Items Stream */
      .menu-items-stream {
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .food-card {
        background: #ffffff;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-lg);
        padding: 16px;
        display: flex;
        gap: 14px;
        box-shadow: var(--shadow-xs);
        cursor: pointer;
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      }
      .food-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .food-card-left {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        overflow: hidden;
      }

      .food-header-line {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .badge-cluster {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .card-tag {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 0.675rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: var(--radius-full);
      }
      .card-tag.bestseller {
        background: #fef3c7;
        color: #b45309;
      }
      .card-tag.spicy {
        background: #fef2f2;
        color: #dc2626;
      }

      .food-titles {
        display: flex;
        flex-direction: column;
      }

      .marathi-title {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--color-text-primary);
        line-height: 1.25;
      }

      .english-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      .food-price-row {
        display: flex;
        align-items: baseline;
        gap: 6px;
        margin-top: 2px;
      }

      .food-price {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .food-discount-old {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        text-decoration: line-through;
      }

      .portion-label {
        font-size: 0.7rem;
        color: var(--color-text-muted);
      }

      .food-desc-snippet {
        font-size: 0.775rem;
        color: var(--color-text-muted);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Food Card Right (Thumb & Morphing Add Button) */
      .food-card-right {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 110px;
        flex-shrink: 0;
        position: relative;
      }

      .food-thumb-box {
        width: 110px;
        height: 100px;
        border-radius: var(--radius-md);
        overflow: hidden;
        background: #eeeae4;
      }
      .food-thumb-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .add-button-anchor {
        margin-top: -16px;
        z-index: 5;
      }

      /* Morphing ADD button */
      .btn-add-morphed {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 6px 18px;
        background: #ffffff;
        border: 1.5px solid var(--color-primary);
        color: var(--color-primary);
        font-weight: 800;
        font-size: 0.8125rem;
        border-radius: var(--radius-full);
        box-shadow: 0 2px 8px rgba(224, 83, 38, 0.2);
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .btn-add-morphed:hover {
        background: var(--color-primary);
        color: #ffffff;
      }

      .active-qty-wrapper {
        animation: scaleCheck 200ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .no-results-box {
        padding: 48px 20px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        color: var(--color-text-secondary);
      }

      /* Floating Bottom Cart Bar */
      .floating-cart-bar {
        position: fixed;
        bottom: 16px;
        left: 16px;
        right: 16px;
        max-width: 488px;
        margin: 0 auto;
        background: var(--color-secondary);
        color: #ffffff;
        padding: 12px 18px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: var(--shadow-floating);
        z-index: 500;
      }

      .cart-bar-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .cart-icon-bubble {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .cart-bubble-count {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #ffffff;
        color: var(--color-primary);
        font-size: 0.7rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cart-bar-meta {
        display: flex;
        flex-direction: column;
      }

      .cart-items-count {
        font-size: 0.75rem;
        color: #a8a29e;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .cart-grand-total {
        font-size: 1.15rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.1;
      }

      .view-order-cta {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        background: var(--color-primary);
        color: #ffffff;
        font-size: 0.875rem;
        font-weight: 700;
        border-radius: var(--radius-full);
        transition: background-color var(--transition-fast);
      }
      .view-order-cta:hover {
        background: var(--color-primary-hover);
      }
    `,
  ],
})
export class CustomerMenuComponent implements OnInit {
  protected readonly restaurantService = inject(RestaurantService);
  protected readonly menuService = inject(MenuService);
  protected readonly tableService = inject(TableService);
  protected readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  public readonly restaurant = signal<Restaurant>(this.restaurantService.restaurant());
  public readonly currentTable = signal<RestaurantTable | null>(null);
  public readonly currentTableToken = signal<string>('abc123');

  public readonly searchQuery = signal<string>('');
  public readonly selectedCategory = signal<string>('all');

  public readonly isDetailOpen = signal<boolean>(false);
  public readonly selectedDish = signal<MenuItem | null>(null);

  public readonly filteredItems = computed(() => {
    let list = this.menuService.customerItems();

    const cat = this.selectedCategory();
    if (cat !== 'all') {
      list = list.filter((i) => i.categoryId === cat);
    }

    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.localName && i.localName.toLowerCase().includes(q)) ||
          i.description.toLowerCase().includes(q) ||
          (i.ingredients && i.ingredients.some((ing) => ing.toLowerCase().includes(q)))
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const slug = params['restaurantSlug'] || 'hotel-jagdamba';
      const token = params['tableToken'] || 'abc123';
      this.currentTableToken.set(token);

      this.restaurantService.getRestaurantBySlug(slug).subscribe((res) => {
        if (res) this.restaurant.set(res);
      });

      this.tableService.getTableByToken(token).subscribe((table) => {
        if (table) this.currentTable.set(table);
      });
    });
  }

  selectCategory(catId: string) {
    this.selectedCategory.set(catId);
  }

  getCartQty(itemId: string): number {
    return this.cartService.getItemQuantity(itemId);
  }

  quickAdd(item: MenuItem, event: MouseEvent) {
    event.stopPropagation();
    this.cartService.addItem(item, 1);
    this.toastService.success(`Added "${item.localName || item.name}" to order`, 'Added to Order');
  }

  updateCartQty(item: MenuItem, qty: number) {
    this.cartService.updateQuantity(item.id, qty);
  }

  openDishDetail(item: MenuItem) {
    this.selectedDish.set(item);
    this.isDetailOpen.set(true);
  }

  closeDishDetail() {
    this.isDetailOpen.set(false);
    this.selectedDish.set(null);
  }

  handleAddToCart(payload: { item: MenuItem; quantity: number; instructions: string }) {
    this.cartService.addItem(payload.item, payload.quantity, payload.instructions);
    this.toastService.success(
      `Added ${payload.quantity} × "${payload.item.localName || payload.item.name}" to your order`,
      'Cart Updated'
    );
  }
}

