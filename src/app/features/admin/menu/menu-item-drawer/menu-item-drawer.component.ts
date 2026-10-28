import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MenuCategory, SpiceLevel } from '../../../../core/models/menu.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { VegBadgeComponent } from '../../../../shared/components/veg-badge/veg-badge.component';

@Component({
  selector: 'app-menu-item-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, ButtonComponent, VegBadgeComponent],
  template: `
    @if (isOpen) {
      <div class="drawer-overlay" (click)="close()">
        <div class="drawer-container" (click)="$event.stopPropagation()">
          <!-- Drawer Header -->
          <div class="drawer-header">
            <div>
              <h2 class="drawer-title">{{ isEdit ? 'Edit Menu Dish' : 'Add New Dish' }}</h2>
              <p class="drawer-sub">{{ isEdit ? 'Update details, pricing and availability' : 'Add authentic culinary creation to your digital menu' }}</p>
            </div>
            <button type="button" class="close-btn" (click)="close()" aria-label="Close form">
              <app-icon name="x" [size]="20"></app-icon>
            </button>
          </div>

          <!-- Drawer Form Body -->
          <form [formGroup]="itemForm" (ngSubmit)="onSubmit()" class="drawer-body">
            <!-- Basic Information -->
            <div class="form-section">
              <span class="section-label">General Information</span>

              <!-- Item Name (English) -->
              <div class="form-group">
                <label class="input-label" for="itemName">
                  Dish Name (English) <span class="req">*</span>
                </label>
                <input
                  id="itemName"
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Mutton Special Thali"
                  class="df-input"
                  [class.is-invalid]="f['name'].touched && f['name'].invalid"
                />
                @if (f['name'].touched && f['name'].hasError('required')) {
                  <span class="error-msg">Dish name is required.</span>
                }
              </div>

              <!-- Local Language Name (Marathi) -->
              <div class="form-group">
                <label class="input-label" for="localName">
                  Local / Marathi Name <span class="opt">(Bilingual display)</span>
                </label>
                <input
                  id="localName"
                  type="text"
                  formControlName="localName"
                  placeholder="उदा. मटण स्पेशल थाळी"
                  class="df-input marathi-input"
                />
                <span class="input-hint">Displayed prominently on QR mobile menu for regional diners.</span>
              </div>

              <!-- Category -->
              <div class="form-group">
                <label class="input-label" for="categoryId">
                  Category <span class="req">*</span>
                </label>
                <select
                  id="categoryId"
                  formControlName="categoryId"
                  class="df-select"
                  [class.is-invalid]="f['categoryId'].touched && f['categoryId'].invalid"
                >
                  <option value="" disabled>Select a menu category</option>
                  @for (cat of categories; track cat.id) {
                    <option [value]="cat.id">{{ cat.name }} ({{ cat.localName || '' }})</option>
                  }
                </select>
                @if (f['categoryId'].touched && f['categoryId'].hasError('required')) {
                  <span class="error-msg">Please assign a category.</span>
                }
              </div>

              <!-- Description -->
              <div class="form-group">
                <label class="input-label" for="itemDesc">
                  Description <span class="req">*</span>
                </label>
                <textarea
                  id="itemDesc"
                  rows="3"
                  formControlName="description"
                  placeholder="Rich, slow-cooked authentic recipe details and side accompaniments..."
                  class="df-textarea"
                  [class.is-invalid]="f['description'].touched && f['description'].invalid"
                ></textarea>
                @if (f['description'].touched && f['description'].hasError('required')) {
                  <span class="error-msg">Description is required.</span>
                }
              </div>
            </div>

            <!-- Pricing & Dietary Details -->
            <div class="form-section">
              <span class="section-label">Pricing & Kitchen Metrics</span>

              <div class="form-row-2">
                <!-- Price -->
                <div class="form-group">
                  <label class="input-label" for="itemPrice">
                    Base Price (₹) <span class="req">*</span>
                  </label>
                  <div class="input-prefix-box">
                    <span class="prefix-symbol">₹</span>
                    <input
                      id="itemPrice"
                      type="number"
                      formControlName="price"
                      placeholder="450"
                      class="df-input has-prefix"
                      [class.is-invalid]="f['price'].touched && f['price'].invalid"
                    />
                  </div>
                  @if (f['price'].touched && f['price'].hasError('required')) {
                    <span class="error-msg">Price is required.</span>
                  }
                </div>

                <!-- Discount Price -->
                <div class="form-group">
                  <label class="input-label" for="discountPrice">
                    Offer / Special Price (₹) <span class="opt">(Optional)</span>
                  </label>
                  <div class="input-prefix-box">
                    <span class="prefix-symbol">₹</span>
                    <input
                      id="discountPrice"
                      type="number"
                      formControlName="discountPrice"
                      placeholder="399"
                      class="df-input has-prefix"
                    />
                  </div>
                </div>
              </div>

              <div class="form-row-2">
                <!-- Preparation Time -->
                <div class="form-group">
                  <label class="input-label" for="prepTime">
                    Prep Time (Minutes) <span class="req">*</span>
                  </label>
                  <div class="input-prefix-box">
                    <app-icon name="clock" [size]="16" class="prefix-icon"></app-icon>
                    <input
                      id="prepTime"
                      type="number"
                      formControlName="preparationTime"
                      placeholder="15"
                      class="df-input has-prefix"
                      [class.is-invalid]="f['preparationTime'].touched && f['preparationTime'].invalid"
                    />
                  </div>
                  @if (f['preparationTime'].touched && f['preparationTime'].hasError('required')) {
                    <span class="error-msg">Preparation time is required.</span>
                  }
                </div>

                <!-- Spice Level -->
                <div class="form-group">
                  <label class="input-label" for="spiceLevel">Spice Level</label>
                  <select id="spiceLevel" formControlName="spiceLevel" class="df-select">
                    <option value="none">No Spice (Mild/Sweet)</option>
                    <option value="mild">Mild (मृदू)</option>
                    <option value="medium">Medium Spiced (मध्यम)</option>
                    <option value="spicy">Spicy (झणझणीत)</option>
                    <option value="extra_spicy">Extra Hot (कोल्हापुरी तिखट)</option>
                  </select>
                </div>
              </div>

              <!-- Veg or Non-Veg Radio Toggle -->
              <div class="form-group">
                <label class="input-label">Dietary Classification <span class="req">*</span></label>
                <div class="dietary-selector">
                  <label class="diet-option" [class.selected]="!itemForm.get('veg')?.value">
                    <input type="radio" [value]="false" formControlName="veg" />
                    <app-veg-badge [veg]="false"></app-veg-badge>
                    <span>Non-Vegetarian</span>
                  </label>

                  <label class="diet-option" [class.selected]="itemForm.get('veg')?.value">
                    <input type="radio" [value]="true" formControlName="veg" />
                    <app-veg-badge [veg]="true"></app-veg-badge>
                    <span>Vegetarian</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Media & Visibility -->
            <div class="form-section">
              <span class="section-label">Photography & Badges</span>

              <!-- Food Image URL -->
              <div class="form-group">
                <label class="input-label" for="imageUrl">
                  Food Image URL <span class="req">*</span>
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  formControlName="imageUrl"
                  placeholder="https://images.unsplash.com/..."
                  class="df-input"
                  [class.is-invalid]="f['imageUrl'].touched && f['imageUrl'].invalid"
                />
                @if (f['imageUrl'].touched && f['imageUrl'].hasError('required')) {
                  <span class="error-msg">Image URL is required for the digital menu.</span>
                }

                @if (itemForm.get('imageUrl')?.value) {
                  <div class="image-preview">
                    <img [src]="itemForm.get('imageUrl')?.value" alt="Preview dish" (error)="onImageError($event)" />
                  </div>
                }
              </div>

              <!-- Toggles: Available & Bestseller -->
              <div class="toggle-group-row">
                <label class="toggle-item">
                  <div class="toggle-switch">
                    <input type="checkbox" formControlName="available" />
                    <span class="slider"></span>
                  </div>
                  <div class="toggle-text">
                    <span class="toggle-name">Available to Order</span>
                    <span class="toggle-desc">Turn off if currently out of stock</span>
                  </div>
                </label>

                <label class="toggle-item">
                  <div class="toggle-switch">
                    <input type="checkbox" formControlName="bestseller" />
                    <span class="slider"></span>
                  </div>
                  <div class="toggle-text">
                    <span class="toggle-name">Chef's Bestseller</span>
                    <span class="toggle-desc">Highlights with special ribbon on customer menu</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Drawer Footer Buttons -->
            <div class="drawer-footer">
              <app-button variant="outline" type="button" (btnClick)="close()">
                Cancel
              </app-button>
              <app-button variant="primary" type="submit" [disabled]="itemForm.invalid">
                {{ isEdit ? 'Save Changes' : 'Add Item to Menu' }}
              </app-button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .drawer-overlay {
        position: fixed;
        inset: 0;
        background: rgba(20, 18, 17, 0.6);
        backdrop-filter: blur(4px);
        z-index: 1100;
        display: flex;
        justify-content: flex-end;
        animation: fadeIn 200ms ease;
      }

      .drawer-container {
        width: 100%;
        max-width: 580px;
        height: 100%;
        background: var(--color-surface);
        box-shadow: var(--shadow-xl);
        display: flex;
        flex-direction: column;
        animation: slideLeft 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes slideLeft {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }

      .drawer-header {
        padding: 24px;
        border-bottom: 1px solid var(--color-surface-border);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }

      .drawer-title {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--color-text-primary);
        letter-spacing: -0.02em;
      }

      .drawer-sub {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-top: 2px;
      }

      .close-btn {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        background: var(--color-surface-subtle);
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
      }
      .close-btn:hover {
        background: var(--color-danger-bg);
        color: var(--color-danger);
      }

      .drawer-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .form-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .section-label {
        font-size: 0.775rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-primary);
        padding-bottom: 6px;
        border-bottom: 1px dashed var(--color-surface-border);
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .input-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .req {
        color: var(--color-danger);
      }

      .opt {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--color-text-muted);
      }

      .df-input,
      .df-select,
      .df-textarea {
        width: 100%;
        padding: 10px 14px;
        background: var(--color-surface);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        font-size: 0.9375rem;
        color: var(--color-text-primary);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        outline: none;
      }

      .df-input:focus,
      .df-select:focus,
      .df-textarea:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }

      .df-input.is-invalid,
      .df-select.is-invalid,
      .df-textarea.is-invalid {
        border-color: var(--color-danger);
      }

      .input-prefix-box {
        position: relative;
        display: flex;
        align-items: center;
      }

      .prefix-symbol {
        position: absolute;
        left: 14px;
        font-weight: 700;
        color: var(--color-text-muted);
        pointer-events: none;
      }

      .prefix-icon {
        position: absolute;
        left: 14px;
        color: var(--color-text-muted);
        pointer-events: none;
      }

      .df-input.has-prefix {
        padding-left: 36px;
      }

      .input-hint {
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }

      .error-msg {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-danger);
      }

      .dietary-selector {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .diet-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        border: 1.5px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-weight: 600;
        font-size: 0.875rem;
      }
      .diet-option input {
        display: none;
      }
      .diet-option.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-light);
        color: var(--color-primary);
      }

      .image-preview {
        width: 100%;
        height: 140px;
        border-radius: var(--radius-md);
        overflow: hidden;
        margin-top: 8px;
        border: 1px solid var(--color-surface-border);
      }
      .image-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .toggle-group-row {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        background: var(--color-surface-subtle);
        border-radius: var(--radius-md);
      }

      .toggle-item {
        display: flex;
        align-items: center;
        gap: 14px;
        cursor: pointer;
      }

      .toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        flex-shrink: 0;
      }
      .toggle-switch input {
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
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        border-radius: 50%;
        transition: 0.3s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }
      input:checked + .slider {
        background-color: var(--color-primary);
      }
      input:checked + .slider:before {
        transform: translateX(20px);
      }

      .toggle-text {
        display: flex;
        flex-direction: column;
      }
      .toggle-name {
        font-weight: 700;
        font-size: 0.875rem;
        color: var(--color-text-primary);
      }
      .toggle-desc {
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }

      .drawer-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid var(--color-surface-border);
      }
    `,
  ],
})
export class MenuItemDrawerComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() itemToEdit: MenuItem | null = null;
  @Input() categories: MenuCategory[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Omit<MenuItem, 'id' | 'restaurantId'>>();

  itemForm!: FormGroup;

  constructor() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemToEdit'] || changes['isOpen']) {
      if (this.itemToEdit) {
        this.itemForm.patchValue({
          name: this.itemToEdit.name,
          localName: this.itemToEdit.localName || '',
          description: this.itemToEdit.description,
          categoryId: this.itemToEdit.categoryId,
          price: this.itemToEdit.price,
          discountPrice: this.itemToEdit.discountPrice || null,
          veg: this.itemToEdit.veg,
          spiceLevel: this.itemToEdit.spiceLevel || 'medium',
          preparationTime: this.itemToEdit.preparationTime,
          imageUrl: this.itemToEdit.imageUrl,
          available: this.itemToEdit.available,
          bestseller: this.itemToEdit.bestseller,
        });
      } else {
        this.itemForm.reset({
          name: '',
          localName: '',
          description: '',
          categoryId: this.categories[0]?.id || '',
          price: null,
          discountPrice: null,
          veg: false,
          spiceLevel: 'medium',
          preparationTime: 15,
          imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
          available: true,
          bestseller: false,
        });
      }
    }
  }

  get isEdit(): boolean {
    return !!this.itemToEdit;
  }

  get f() {
    return this.itemForm.controls;
  }

  private initForm() {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      localName: [''],
      description: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(1)]],
      discountPrice: [null],
      veg: [false, [Validators.required]],
      spiceLevel: ['medium'],
      preparationTime: [15, [Validators.required, Validators.min(1)]],
      imageUrl: ['', [Validators.required]],
      available: [true],
      bestseller: [false],
    });
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
  }

  onSubmit() {
    if (this.itemForm.valid) {
      this.saved.emit(this.itemForm.value);
      this.close();
    } else {
      this.itemForm.markAllAsTouched();
    }
  }

  close() {
    this.closed.emit();
  }
}
