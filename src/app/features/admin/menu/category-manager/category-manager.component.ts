import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../../core/services/menu.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MenuCategory } from '../../../../core/models/menu.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, ButtonComponent, ModalComponent],
  template: `
    <div class="category-page animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <div class="title-combo">
          <a [routerLink]="['/admin/menu']" class="back-link">
            <app-icon name="arrow-left" [size]="18"></app-icon>
            <span>Back to Menu</span>
          </a>
          <h1 class="page-title">Category Management</h1>
          <p class="page-subtitle">Organize menu flow, display sequence on mobile QR menu, and bilingual names</p>
        </div>

        <app-button variant="primary" iconLeft="plus" (btnClick)="openAddModal()">
          Add New Category
        </app-button>
      </div>

      <!-- Categories List Card -->
      <div class="categories-container df-card">
        <div class="categories-header-row">
          <span class="col-order">Order</span>
          <span class="col-name">Category & Regional Name</span>
          <span class="col-count">Items</span>
          <span class="col-status">Status</span>
          <span class="col-actions">Actions</span>
        </div>

        <div class="categories-list">
          @for (cat of menuService.categories(); track cat.id; let i = $index) {
            <div class="category-row" [class.is-inactive]="!cat.isActive">
              <!-- Reorder Controls -->
              <div class="col-order reorder-controls">
                <span class="order-number">{{ cat.displayOrder }}</span>
                <div class="order-arrows">
                  <button
                    type="button"
                    class="arrow-btn"
                    [disabled]="i === 0"
                    (click)="moveUp(i)"
                    title="Move up"
                  >
                    <app-icon name="chevron-up" [size]="14"></app-icon>
                  </button>
                  <button
                    type="button"
                    class="arrow-btn"
                    [disabled]="i === menuService.categories().length - 1"
                    (click)="moveDown(i)"
                    title="Move down"
                  >
                    <app-icon name="chevron-down" [size]="14"></app-icon>
                  </button>
                </div>
              </div>

              <!-- Name & Local Name -->
              <div class="col-name name-cell">
                <div class="cat-icon-avatar">
                  <app-icon [name]="cat.icon || 'utensils'" [size]="18"></app-icon>
                </div>
                <div>
                  <div class="cat-primary-name">{{ cat.name }}</div>
                  @if (cat.localName) {
                    <div class="cat-marathi-name">{{ cat.localName }}</div>
                  }
                  @if (cat.description) {
                    <div class="cat-desc-sub">{{ cat.description }}</div>
                  }
                </div>
              </div>

              <!-- Count of Items -->
              <div class="col-count count-cell">
                <span class="item-badge">{{ getItemCount(cat.id) }} dishes</span>
              </div>

              <!-- Active Toggle -->
              <div class="col-status status-cell">
                <label class="toggle-switch-sm">
                  <input
                    type="checkbox"
                    [checked]="cat.isActive"
                    (change)="toggleCategoryStatus(cat)"
                  />
                  <span class="slider"></span>
                </label>
                <span class="status-text">{{ cat.isActive ? 'Active' : 'Hidden' }}</span>
              </div>

              <!-- Action Buttons -->
              <div class="col-actions actions-cell">
                <button type="button" class="action-icon-btn edit" (click)="openEditModal(cat)" title="Edit">
                  <app-icon name="edit" [size]="16"></app-icon>
                </button>
                <button
                  type="button"
                  class="action-icon-btn delete"
                  (click)="deleteCategory(cat)"
                  title="Delete"
                >
                  <app-icon name="trash" [size]="16"></app-icon>
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Add/Edit Category Modal -->
      <app-modal
        [isOpen]="isModalOpen()"
        [title]="editingCat() ? 'Edit Category' : 'Create New Category'"
        [subtitle]="'Configure category name and regional Marathi title'"
        size="md"
        (closed)="closeModal()"
      >
        <div class="modal-form">
          <div class="form-group">
            <label class="modal-label" for="catName">Category Name (English) *</label>
            <input
              id="catName"
              type="text"
              [(ngModel)]="formData.name"
              placeholder="e.g. Starters, Thali Specials..."
              class="modal-input"
            />
          </div>

          <div class="form-group">
            <label class="modal-label" for="catLocalName">Regional / Marathi Name</label>
            <input
              id="catLocalName"
              type="text"
              [(ngModel)]="formData.localName"
              placeholder="उदा. स्टार्टर्स, थाळी..."
              class="modal-input marathi-input"
            />
          </div>

          <div class="form-group">
            <label class="modal-label" for="catDesc">Description</label>
            <textarea
              id="catDesc"
              rows="2"
              [(ngModel)]="formData.description"
              placeholder="Short explanation of dishes in this section..."
              class="modal-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="modal-label" for="catIcon">Icon Motif</label>
            <select id="catIcon" [(ngModel)]="formData.icon" class="modal-select">
              <option value="utensils">Utensils (Dining)</option>
              <option value="flame">Flame (Spicy / Sizzling)</option>
              <option value="sparkles">Sparkles (Specialties)</option>
              <option value="layers">Layers (Breads & Roti)</option>
              <option value="star">Star (Popular)</option>
            </select>
          </div>
        </div>

        <div modal-footer>
          <app-button variant="outline" (btnClick)="closeModal()">
            Cancel
          </app-button>
          <app-button variant="primary" (btnClick)="saveCategory()" [disabled]="!formData.name.trim()">
            {{ editingCat() ? 'Save Changes' : 'Create Category' }}
          </app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [
    `
      .category-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: 6px;
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

      .categories-container {
        overflow: hidden;
      }

      .categories-header-row {
        display: grid;
        grid-template-columns: 80px 1fr 140px 140px 100px;
        padding: 16px 24px;
        background: var(--color-surface-subtle);
        border-bottom: 1px solid var(--color-surface-border);
        font-size: 0.775rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--color-text-muted);
        letter-spacing: 0.04em;
      }

      .category-row {
        display: grid;
        grid-template-columns: 80px 1fr 140px 140px 100px;
        align-items: center;
        padding: 18px 24px;
        border-bottom: 1px solid var(--color-surface-border);
        transition: background-color var(--transition-fast);
      }
      .category-row:last-child {
        border-bottom: none;
      }
      .category-row:hover {
        background-color: var(--color-surface-hover);
      }
      .category-row.is-inactive {
        opacity: 0.55;
      }

      .reorder-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .order-number {
        font-weight: 800;
        font-size: 0.9375rem;
        color: var(--color-text-secondary);
        width: 18px;
      }

      .order-arrows {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }

      .arrow-btn {
        padding: 2px;
        color: var(--color-text-muted);
        cursor: pointer;
        border-radius: var(--radius-xs);
        transition: all var(--transition-fast);
      }
      .arrow-btn:hover:not(:disabled) {
        background: var(--color-primary-light);
        color: var(--color-primary);
      }
      .arrow-btn:disabled {
        opacity: 0.25;
        cursor: not-allowed;
      }

      .name-cell {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .cat-icon-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        background: var(--color-primary-light);
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .cat-primary-name {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--color-text-primary);
      }

      .cat-marathi-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-primary);
      }

      .cat-desc-sub {
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }

      .item-badge {
        font-size: 0.775rem;
        font-weight: 600;
        padding: 4px 10px;
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
      }

      .status-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .toggle-switch-sm {
        position: relative;
        width: 36px;
        height: 20px;
      }
      .toggle-switch-sm input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        inset: 0;
        background-color: #d1d5db;
        border-radius: var(--radius-full);
        transition: 0.3s;
      }
      .slider:before {
        position: absolute;
        content: '';
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        border-radius: 50%;
        transition: 0.3s;
      }
      input:checked + .slider {
        background-color: var(--color-success);
      }
      input:checked + .slider:before {
        transform: translateX(16px);
      }

      .status-text {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      .actions-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .action-icon-btn {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--transition-fast);
        color: var(--color-text-muted);
      }
      .action-icon-btn.edit:hover {
        background: var(--color-surface-subtle);
        color: var(--color-primary);
      }
      .action-icon-btn.delete:hover {
        background: #fef2f2;
        color: var(--color-danger);
      }

      /* Modal Form */
      .modal-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .modal-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .modal-input,
      .modal-textarea,
      .modal-select {
        width: 100%;
        padding: 10px 14px;
        background: var(--color-surface);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        font-size: 0.9375rem;
        color: var(--color-text-primary);
        outline: none;
      }
      .modal-input:focus,
      .modal-textarea:focus,
      .modal-select:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }

      @media (max-width: 768px) {
        .categories-header-row {
          display: none;
        }
        .category-row {
          grid-template-columns: 1fr;
          gap: 12px;
        }
      }
    `,
  ],
})
export class CategoryManagerComponent {
  protected readonly menuService = inject(MenuService);
  private readonly toastService = inject(ToastService);

  public readonly isModalOpen = signal<boolean>(false);
  public readonly editingCat = signal<MenuCategory | null>(null);

  public formData = {
    name: '',
    localName: '',
    description: '',
    icon: 'utensils',
  };

  getItemCount(categoryId: string): number {
    return this.menuService.menuItems().filter((it) => it.categoryId === categoryId).length;
  }

  moveUp(index: number) {
    if (index <= 0) return;
    const cats = [...this.menuService.categories()];
    const temp = cats[index];
    cats[index] = cats[index - 1];
    cats[index - 1] = temp;
    this.menuService.reorderCategories(cats).subscribe(() => {
      this.toastService.info('Categories reordered.', 'Order Updated');
    });
  }

  moveDown(index: number) {
    const cats = [...this.menuService.categories()];
    if (index >= cats.length - 1) return;
    const temp = cats[index];
    cats[index] = cats[index + 1];
    cats[index + 1] = temp;
    this.menuService.reorderCategories(cats).subscribe(() => {
      this.toastService.info('Categories reordered.', 'Order Updated');
    });
  }

  toggleCategoryStatus(cat: MenuCategory) {
    this.menuService.updateCategory(cat.id, { isActive: !cat.isActive }).subscribe(() => {
      this.toastService.info(
        `Category "${cat.name}" is now ${!cat.isActive ? 'Active' : 'Hidden'}`,
        'Category Updated'
      );
    });
  }

  openAddModal() {
    this.editingCat.set(null);
    this.formData = {
      name: '',
      localName: '',
      description: '',
      icon: 'utensils',
    };
    this.isModalOpen.set(true);
  }

  openEditModal(cat: MenuCategory) {
    this.editingCat.set(cat);
    this.formData = {
      name: cat.name,
      localName: cat.localName || '',
      description: cat.description || '',
      icon: cat.icon || 'utensils',
    };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingCat.set(null);
  }

  saveCategory() {
    if (!this.formData.name.trim()) return;

    const current = this.editingCat();
    if (current) {
      this.menuService
        .updateCategory(current.id, {
          name: this.formData.name,
          localName: this.formData.localName,
          description: this.formData.description,
          icon: this.formData.icon,
        })
        .subscribe(() => {
          this.toastService.success(`"${this.formData.name}" updated!`, 'Category Saved');
          this.closeModal();
        });
    } else {
      this.menuService
        .addCategory({
          name: this.formData.name,
          localName: this.formData.localName,
          description: this.formData.description,
          icon: this.formData.icon,
          isActive: true,
          displayOrder: this.menuService.categories().length + 1,
        })
        .subscribe(() => {
          this.toastService.success(`"${this.formData.name}" added to menu!`, 'New Category');
          this.closeModal();
        });
    }
  }

  deleteCategory(cat: MenuCategory) {
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      this.menuService.deleteCategory(cat.id).subscribe(() => {
        this.toastService.warning(`"${cat.name}" was removed.`, 'Category Deleted');
      });
    }
  }
}

