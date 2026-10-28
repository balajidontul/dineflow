import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../../core/services/menu.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MenuItem, MenuCategory } from '../../../../core/models/menu.model';
import { MenuItemDrawerComponent } from '../menu-item-drawer/menu-item-drawer.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { VegBadgeComponent } from '../../../../shared/components/veg-badge/veg-badge.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { CurrencyInrPipe } from '../../../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MenuItemDrawerComponent,
    IconComponent,
    ButtonComponent,
    VegBadgeComponent,
    EmptyStateComponent,
    CurrencyInrPipe,
  ],
  template: `
    <div class="menu-page animate-fade-in">
      <!-- Page Header -->
      <div class="menu-header">
        <div>
          <h1 class="page-title">Menu Management</h1>
          <p class="page-subtitle">Configure dishes, real-time pricing, stock availability, and regional names</p>
        </div>

        <div class="header-action-group">
          <a [routerLink]="['/admin/menu/categories']">
            <app-button variant="outline" iconLeft="layers">
              Manage Categories
            </app-button>
          </a>

          <app-button variant="primary" iconLeft="plus" (btnClick)="openAddDrawer()">
            Add Dish
          </app-button>
        </div>
      </div>

      <!-- Controls Bar: Search & Filters -->
      <div class="filter-bar df-card">
        <!-- Search Input -->
        <div class="search-field">
          <app-icon name="search" [size]="18" class="search-icon"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search dish name, Marathi title, ingredients..."
            class="search-input"
          />
          @if (searchQuery()) {
            <button class="clear-search-btn" (click)="searchQuery.set('')" aria-label="Clear search">
              <app-icon name="x" [size]="15"></app-icon>
            </button>
          }
        </div>

        <!-- Filter Dropdowns & Diet Filters -->
        <div class="filter-controls">
          <!-- Dietary Filter -->
          <div class="pill-group">
            <button
              class="filter-pill"
              [class.active]="dietFilter() === 'all'"
              (click)="dietFilter.set('all')"
            >
              All Diets
            </button>
            <button
              class="filter-pill veg-pill"
              [class.active]="dietFilter() === 'veg'"
              (click)="dietFilter.set('veg')"
            >
              <app-veg-badge [veg]="true"></app-veg-badge>
              <span>Veg Only</span>
            </button>
            <button
              class="filter-pill nonveg-pill"
              [class.active]="dietFilter() === 'nonveg'"
              (click)="dietFilter.set('nonveg')"
            >
              <app-veg-badge [veg]="false"></app-veg-badge>
              <span>Non-Veg</span>
            </button>
          </div>

          <!-- Availability Filter -->
          <select
            [value]="availabilityFilter()"
            (change)="onAvailabilityFilterChange($event)"
            class="df-select-compact"
          >
            <option value="all">All Availability</option>
            <option value="available">In Stock Only</option>
            <option value="unavailable">Out of Stock</option>
          </select>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="category-tabs-scroll">
        <button
          class="cat-tab"
          [class.active]="selectedCategoryId() === 'all'"
          (click)="selectedCategoryId.set('all')"
        >
          <span class="cat-tab-name">All Items</span>
          <span class="cat-tab-badge">{{ menuService.menuItems().length }}</span>
        </button>

        @for (category of menuService.categories(); track category.id) {
          <button
            class="cat-tab"
            [class.active]="selectedCategoryId() === category.id"
            (click)="selectedCategoryId.set(category.id)"
          >
            <span class="cat-tab-name">{{ category.name }}</span>
            @if (category.localName) {
              <span class="cat-tab-local">({{ category.localName }})</span>
            }
            <span class="cat-tab-badge">{{ getCategoryCount(category.id) }}</span>
          </button>
        }
      </div>

      <!-- Menu Items Card Grid -->
      @if (filteredItems().length > 0) {
        <div class="menu-grid">
          @for (item of filteredItems(); track item.id) {
            <div class="menu-item-card df-card" [class.is-out-of-stock]="!item.available">
              <!-- Dish Image with Overlay Badges -->
              <div class="card-image-box">
                <img [src]="item.imageUrl" [alt]="item.name" loading="lazy" />
                <div class="image-gradient-overlay"></div>

                <!-- Category Pill -->
                <span class="category-chip">{{ getCategoryName(item.categoryId) }}</span>

                <!-- Bestseller / Spice Badges -->
                <div class="floating-tags">
                  @if (item.bestseller) {
                    <span class="tag-bestseller">
                      <app-icon name="star" [size]="12"></app-icon> Bestseller
                    </span>
                  }
                  @if (item.spiceLevel === 'spicy' || item.spiceLevel === 'extra_spicy') {
                    <span class="tag-spicy">
                      <app-icon name="flame" [size]="12"></app-icon> Spicy
                    </span>
                  }
                </div>
              </div>

              <!-- Content Body -->
              <div class="card-content">
                <div class="card-title-row">
                  <div class="title-with-badge">
                    <app-veg-badge [veg]="item.veg"></app-veg-badge>
                    <div class="names-wrapper">
                      <h3 class="dish-name">{{ item.name }}</h3>
                      @if (item.localName) {
                        <span class="dish-local-name">{{ item.localName }}</span>
                      }
                    </div>
                  </div>
                </div>

                <p class="dish-desc">{{ item.description }}</p>

                <div class="dish-meta-row">
                  <div class="prep-pill">
                    <app-icon name="clock" [size]="13"></app-icon>
                    <span>{{ item.preparationTime }} min prep</span>
                  </div>

                  @if (item.portionSize) {
                    <span class="portion-text">{{ item.portionSize }}</span>
                  }
                </div>

                <!-- Price & Stock Row -->
                <div class="card-price-action-row">
                  <div class="price-container">
                    @if (item.discountPrice) {
                      <span class="current-price">{{ item.discountPrice | currencyInr }}</span>
                      <span class="original-price">{{ item.price | currencyInr }}</span>
                    } @else {
                      <span class="current-price">{{ item.price | currencyInr }}</span>
                    }
                  </div>

                  <!-- Availability Toggle -->
                  <label
                    class="stock-toggle"
                    [attr.title]="item.available ? 'Click to mark Out of Stock' : 'Click to mark In Stock'"
                  >
                    <input
                      type="checkbox"
                      [checked]="item.available"
                      (change)="toggleAvailability(item)"
                    />
                    <span class="stock-slider"></span>
                    <span class="stock-status-label">{{ item.available ? 'In Stock' : 'Out of Stock' }}</span>
                  </label>
                </div>
              </div>

              <!-- Card Footer Action Buttons -->
              <div class="card-footer">
                <button
                  type="button"
                  class="card-btn edit-btn"
                  (click)="openEditDrawer(item)"
                  aria-label="Edit dish"
                >
                  <app-icon name="edit" [size]="15"></app-icon>
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  class="card-btn delete-btn"
                  (click)="deleteItem(item)"
                  aria-label="Delete dish"
                >
                  <app-icon name="trash" [size]="15"></app-icon>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <app-empty-state
          icon="utensils"
          title="No Dishes Found"
          description="We couldn't find any menu items matching your search or filter criteria. Try adjusting your filters or add a new recipe."
          actionLabel="Add New Dish"
          actionIcon="plus"
          (action)="openAddDrawer()"
        ></app-empty-state>
      }

      <!-- Add/Edit Drawer Component -->
      <app-menu-item-drawer
        [isOpen]="isDrawerOpen()"
        [itemToEdit]="selectedItemToEdit()"
        [categories]="menuService.categories()"
        (closed)="closeDrawer()"
        (saved)="handleSaveItem($event)"
      ></app-menu-item-drawer>
    </div>
  `,
  styles: [
    `
      .menu-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .menu-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
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

      .header-action-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* Filter Bar */
      .filter-bar {
        padding: 14px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .search-field {
        flex: 1;
        min-width: 260px;
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

      .search-input {
        width: 100%;
        padding: 10px 38px 10px 40px;
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        font-size: 0.875rem;
        color: var(--color-text-primary);
        outline: none;
        transition: all var(--transition-fast);
      }
      .search-input:focus {
        background: #ffffff;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }

      .clear-search-btn {
        position: absolute;
        right: 12px;
        color: var(--color-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .filter-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .pill-group {
        display: flex;
        align-items: center;
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        padding: 3px;
        gap: 2px;
      }

      .filter-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        font-size: 0.8125rem;
        font-weight: 600;
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .filter-pill:hover {
        color: var(--color-text-primary);
      }
      .filter-pill.active {
        background: #ffffff;
        color: var(--color-text-primary);
        box-shadow: var(--shadow-xs);
      }

      .df-select-compact {
        padding: 8px 14px;
        font-size: 0.8125rem;
        font-weight: 600;
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        color: var(--color-text-primary);
        outline: none;
        cursor: pointer;
      }

      /* Category Horizontal Tabs */
      .category-tabs-scroll {
        display: flex;
        align-items: center;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .category-tabs-scroll::-webkit-scrollbar {
        height: 3px;
      }

      .cat-tab {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        background: var(--color-surface);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        white-space: nowrap;
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .cat-tab:hover {
        border-color: rgba(224, 83, 38, 0.4);
        color: var(--color-text-primary);
      }
      .cat-tab.active {
        background: var(--color-primary);
        color: #ffffff;
        border-color: var(--color-primary);
        box-shadow: 0 4px 12px var(--color-primary-glow);
      }

      .cat-tab-local {
        font-size: 0.775rem;
        opacity: 0.85;
      }

      .cat-tab-badge {
        font-size: 0.725rem;
        padding: 2px 7px;
        border-radius: var(--radius-full);
        background: rgba(0, 0, 0, 0.08);
      }
      .cat-tab.active .cat-tab-badge {
        background: rgba(255, 255, 255, 0.25);
        color: #ffffff;
      }

      /* Menu Card Grid */
      .menu-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;
      }

      .menu-item-card {
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-xl);
        overflow: hidden;
        transition: all var(--transition-fast);
      }
      .menu-item-card:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-lg);
      }
      .menu-item-card.is-out-of-stock {
        opacity: 0.65;
        filter: grayscale(0.35);
      }

      .card-image-box {
        position: relative;
        height: 200px;
        width: 100%;
        overflow: hidden;
        background: #eeeae4;
      }
      .card-image-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 400ms ease;
      }
      .menu-item-card:hover .card-image-box img {
        transform: scale(1.04);
      }

      .image-gradient-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 40%, rgba(0, 0, 0, 0.5) 100%);
      }

      .category-chip {
        position: absolute;
        top: 14px;
        left: 14px;
        padding: 4px 10px;
        background: rgba(20, 18, 17, 0.7);
        backdrop-filter: blur(4px);
        border-radius: var(--radius-full);
        font-size: 0.725rem;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.02em;
      }

      .floating-tags {
        position: absolute;
        top: 14px;
        right: 14px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
      }

      .tag-bestseller {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 9px;
        background: #f59e0b;
        color: #1a1817;
        font-size: 0.7rem;
        font-weight: 800;
        border-radius: var(--radius-full);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .tag-spicy {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 9px;
        background: #dc2626;
        color: #ffffff;
        font-size: 0.7rem;
        font-weight: 800;
        border-radius: var(--radius-full);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .card-content {
        padding: 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .card-title-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }

      .title-with-badge {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .names-wrapper {
        display: flex;
        flex-direction: column;
      }

      .dish-name {
        font-size: 1.125rem;
        font-weight: 800;
        color: var(--color-text-primary);
        line-height: 1.25;
      }

      .dish-local-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-primary);
      }

      .dish-desc {
        font-size: 0.825rem;
        color: var(--color-text-secondary);
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .dish-meta-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }

      .prep-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-weight: 600;
      }

      .portion-text {
        font-weight: 500;
      }

      .card-price-action-row {
        margin-top: auto;
        padding-top: 14px;
        border-top: 1px dashed var(--color-surface-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .price-container {
        display: flex;
        align-items: baseline;
        gap: 8px;
      }

      .current-price {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .original-price {
        font-size: 0.875rem;
        color: var(--color-text-muted);
        text-decoration: line-through;
      }

      /* Stock Toggle */
      .stock-toggle {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }

      .stock-toggle input {
        display: none;
      }

      .stock-slider {
        position: relative;
        width: 38px;
        height: 20px;
        background-color: #d1d5db;
        border-radius: var(--radius-full);
        transition: 0.3s;
      }
      .stock-slider:before {
        position: absolute;
        content: '';
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        border-radius: 50%;
        transition: 0.3s;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
      input:checked + .stock-slider {
        background-color: var(--color-success);
      }
      input:checked + .stock-slider:before {
        transform: translateX(18px);
      }

      .stock-status-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--color-text-secondary);
      }

      /* Footer Buttons */
      .card-footer {
        display: grid;
        grid-template-columns: 1fr 1fr;
        border-top: 1px solid var(--color-surface-border);
        background: var(--color-surface-subtle);
      }

      .card-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .card-btn:first-child {
        border-right: 1px solid var(--color-surface-border);
      }
      .card-btn.edit-btn:hover {
        background: #ffffff;
        color: var(--color-primary);
      }
      .card-btn.delete-btn:hover {
        background: #fef2f2;
        color: var(--color-danger);
      }

      @media (max-width: 768px) {
        .filter-bar {
          flex-direction: column;
          align-items: stretch;
        }
        .filter-controls {
          justify-content: space-between;
        }
      }
    `,
  ],
})
export class MenuListComponent implements OnInit {
  protected readonly menuService = inject(MenuService);
  private readonly toastService = inject(ToastService);

  public readonly searchQuery = signal<string>('');
  public readonly selectedCategoryId = signal<string>('all');
  public readonly dietFilter = signal<'all' | 'veg' | 'nonveg'>('all');
  public readonly availabilityFilter = signal<'all' | 'available' | 'unavailable'>('all');

  public readonly isDrawerOpen = signal<boolean>(false);
  public readonly selectedItemToEdit = signal<MenuItem | null>(null);

  public readonly filteredItems = computed(() => {
    let list = this.menuService.menuItems();

    // Category filter
    const cat = this.selectedCategoryId();
    if (cat !== 'all') {
      list = list.filter((i) => i.categoryId === cat);
    }

    // Diet filter
    const diet = this.dietFilter();
    if (diet === 'veg') {
      list = list.filter((i) => i.veg);
    } else if (diet === 'nonveg') {
      list = list.filter((i) => !i.veg);
    }

    // Availability filter
    const avail = this.availabilityFilter();
    if (avail === 'available') {
      list = list.filter((i) => i.available);
    } else if (avail === 'unavailable') {
      list = list.filter((i) => !i.available);
    }

    // Search query
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
    this.menuService.getMenuItems().subscribe();
    this.menuService.getCategories().subscribe();
  }

  getCategoryName(catId: string): string {
    const found = this.menuService.categories().find((c) => c.id === catId);
    return found ? found.name : 'Main Course';
  }

  getCategoryCount(catId: string): number {
    return this.menuService.menuItems().filter((i) => i.categoryId === catId).length;
  }

  onAvailabilityFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.availabilityFilter.set(target.value as 'all' | 'available' | 'unavailable');
  }

  openAddDrawer() {
    this.selectedItemToEdit.set(null);
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(item: MenuItem) {
    this.selectedItemToEdit.set(item);
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
    this.selectedItemToEdit.set(null);
  }

  handleSaveItem(data: Omit<MenuItem, 'id' | 'restaurantId'>) {
    const editItem = this.selectedItemToEdit();
    if (editItem) {
      this.menuService.updateMenuItem(editItem.id, data).subscribe(() => {
        this.toastService.success(`"${data.name}" has been updated.`, 'Dish Updated');
      });
    } else {
      this.menuService.addMenuItem(data).subscribe(() => {
        this.toastService.success(`"${data.name}" added to menu!`, 'New Dish Added');
      });
    }
  }

  toggleAvailability(item: MenuItem) {
    this.menuService.toggleItemAvailability(item.id).subscribe((newState) => {
      this.toastService.info(
        `"${item.name}" marked as ${newState ? 'Available' : 'Out of Stock'}`,
        'Stock Updated'
      );
    });
  }

  deleteItem(item: MenuItem) {
    if (confirm(`Are you sure you want to delete "${item.name}" from your menu?`)) {
      this.menuService.deleteMenuItem(item.id).subscribe(() => {
        this.toastService.warning(`"${item.name}" was removed.`, 'Item Deleted');
      });
    }
  }
}
