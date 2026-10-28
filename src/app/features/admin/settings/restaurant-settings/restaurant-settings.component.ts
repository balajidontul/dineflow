import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../../core/services/restaurant.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Restaurant } from '../../../../core/models/restaurant.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface PresetTheme {
  name: string;
  primary: string;
  accent: string;
  previewBg: string;
}

@Component({
  selector: 'app-restaurant-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ButtonComponent],
  template: `
    <div class="settings-page animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Restaurant Profile & Brand Settings</h1>
          <p class="page-subtitle">Configure hospitality branding, tax percentage, billing options, and customer theme</p>
        </div>

        <app-button variant="primary" iconLeft="check" (btnClick)="saveAllSettings()">
          Save All Changes
        </app-button>
      </div>

      <!-- Settings Tabs/Pills -->
      <div class="settings-nav-tabs">
        <button
          class="settings-tab"
          [class.active]="activeTab() === 'profile'"
          (click)="activeTab.set('profile')"
        >
          <app-icon name="store" [size]="16"></app-icon>
          <span>General Profile</span>
        </button>

        <button
          class="settings-tab"
          [class.active]="activeTab() === 'theme'"
          (click)="activeTab.set('theme')"
        >
          <app-icon name="sliders" [size]="16"></app-icon>
          <span>Theme & Branding</span>
        </button>

        <button
          class="settings-tab"
          [class.active]="activeTab() === 'billing'"
          (click)="activeTab.set('billing')"
        >
          <app-icon name="dollar-sign" [size]="16"></app-icon>
          <span>Taxes & Service Charge</span>
        </button>
      </div>

      <!-- Tab Content 1: General Profile -->
      @if (activeTab() === 'profile') {
        <div class="settings-grid">
          <div class="df-card settings-card">
            <h3 class="card-section-title">Establishment Identity</h3>
            <p class="card-section-desc">Appears on customer digital menu header, bill receipts, and QR stands</p>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="resName">Restaurant Name (English)</label>
                <input id="resName" type="text" [(ngModel)]="restaurantData.name" class="df-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="resLocal">Local / Marathi Name</label>
                <input id="resLocal" type="text" [(ngModel)]="restaurantData.localName" class="df-input marathi-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="resTagline">Tagline / Specialties</label>
              <input id="resTagline" type="text" [(ngModel)]="restaurantData.tagline" class="df-input" />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="resPhone">Contact Phone</label>
                <input id="resPhone" type="text" [(ngModel)]="restaurantData.phone" class="df-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="resEmail">Official Email</label>
                <input id="resEmail" type="email" [(ngModel)]="restaurantData.email" class="df-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="resHours">Dining Hours</label>
              <input id="resHours" type="text" [(ngModel)]="restaurantData.openingHours" class="df-input" />
            </div>
          </div>

          <div class="df-card settings-card">
            <h3 class="card-section-title">Physical Location & GST Compliance</h3>

            <div class="form-group">
              <label class="form-label" for="resAddress">Street Address</label>
              <textarea id="resAddress" rows="2" [(ngModel)]="restaurantData.address" class="df-textarea"></textarea>
            </div>

            <div class="form-grid-3">
              <div class="form-group">
                <label class="form-label" for="resCity">City</label>
                <input id="resCity" type="text" [(ngModel)]="restaurantData.city" class="df-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="resState">State</label>
                <input id="resState" type="text" [(ngModel)]="restaurantData.state" class="df-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="resPin">PIN Code</label>
                <input id="resPin" type="text" [(ngModel)]="restaurantData.pincode" class="df-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="resGst">GST Number (Printed on bill invoices)</label>
              <input id="resGst" type="text" [(ngModel)]="restaurantData.gstNumber" class="df-input" />
            </div>
          </div>
        </div>
      }

      <!-- Tab Content 2: Theme Customization -->
      @if (activeTab() === 'theme') {
        <div class="theme-settings-wrapper">
          <div class="df-card settings-card">
            <h3 class="card-section-title">Hospitality Color Palette</h3>
            <p class="card-section-desc">Changes are applied immediately across the customer QR menu experience and admin interface.</p>

            <!-- Presets -->
            <div class="presets-row">
              <span class="presets-label">Curated Hospitality Themes:</span>
              <div class="presets-list">
                @for (preset of presetThemes; track preset.name) {
                  <button
                    type="button"
                    class="preset-card"
                    [class.is-selected]="themeData.primaryColor === preset.primary"
                    (click)="applyPresetTheme(preset)"
                  >
                    <div class="preset-swatches">
                      <span class="swatch" [style.background]="preset.primary"></span>
                      <span class="swatch" [style.background]="preset.accent"></span>
                    </div>
                    <span class="preset-name">{{ preset.name }}</span>
                  </button>
                }
              </div>
            </div>

            <div class="color-picker-grid">
              <div class="form-group">
                <label class="form-label" for="primaryColor">Brand Primary Color</label>
                <div class="color-picker-input-group">
                  <input
                    id="primaryColor"
                    type="color"
                    [(ngModel)]="themeData.primaryColor"
                    (ngModelChange)="onColorChanged()"
                    class="color-picker"
                  />
                  <input
                    type="text"
                    [(ngModel)]="themeData.primaryColor"
                    (ngModelChange)="onColorChanged()"
                    class="df-input color-text"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="accentColor">Accent / Highlights Color</label>
                <div class="color-picker-input-group">
                  <input
                    id="accentColor"
                    type="color"
                    [(ngModel)]="themeData.accentColor"
                    (ngModelChange)="onColorChanged()"
                    class="color-picker"
                  />
                  <input
                    type="text"
                    [(ngModel)]="themeData.accentColor"
                    (ngModelChange)="onColorChanged()"
                    class="df-input color-text"
                  />
                </div>
              </div>
            </div>

            <!-- Photography URLs -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="logoUrl">Restaurant Logo URL</label>
                <input id="logoUrl" type="url" [(ngModel)]="restaurantData.logoUrl" class="df-input" />
                <div class="logo-preview-box">
                  <img [src]="restaurantData.logoUrl" alt="Logo preview" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="coverUrl">Restaurant Hero Cover URL</label>
                <input id="coverUrl" type="url" [(ngModel)]="restaurantData.coverImageUrl" class="df-input" />
                <div class="cover-preview-box">
                  <img [src]="restaurantData.coverImageUrl" alt="Cover preview" />
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Tab Content 3: Billing & Taxes -->
      @if (activeTab() === 'billing') {
        <div class="settings-grid">
          <div class="df-card settings-card">
            <h3 class="card-section-title">Automated Bill Taxes</h3>
            <p class="card-section-desc">Auto-calculated and itemized in customer cart and order checkout</p>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="taxPct">GST Tax Percentage (%)</label>
                <input
                  id="taxPct"
                  type="number"
                  step="0.5"
                  [(ngModel)]="restaurantData.taxPercentage"
                  class="df-input"
                />
                <span class="input-hint">Standard restaurant dining GST in India is 5.0%</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="scPct">Service Charge (%)</label>
                <input
                  id="scPct"
                  type="number"
                  step="0.5"
                  [(ngModel)]="restaurantData.serviceChargePercentage"
                  class="df-input"
                />
                <span class="input-hint">Discretionary service fee (e.g. 2.5%)</span>
              </div>
            </div>
          </div>

          <div class="df-card settings-card">
            <h3 class="card-section-title">Customer Payment Methods</h3>
            <p class="card-section-desc">Enable or restrict checkout gateways for table QR orders</p>

            <div class="payment-switches-list">
              <label class="pay-toggle-row">
                <div>
                  <strong class="pay-title">UPI Instant QR & Apps</strong>
                  <p class="pay-desc">GPay, PhonePe, Paytm, BHIM</p>
                </div>
                <input type="checkbox" checked />
              </label>

              <label class="pay-toggle-row">
                <div>
                  <strong class="pay-title">Credit / Debit Cards & Net Banking</strong>
                  <p class="pay-desc">Visa, MasterCard, RuPay</p>
                </div>
                <input type="checkbox" checked />
              </label>

              <label class="pay-toggle-row">
                <div>
                  <strong class="pay-title">Pay at Cashier Counter</strong>
                  <p class="pay-desc">Customer completes payment physically after eating</p>
                </div>
                <input type="checkbox" checked />
              </label>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .settings-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
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

      .settings-nav-tabs {
        display: flex;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid var(--color-surface-border);
        padding-bottom: 12px;
      }

      .settings-tab {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: var(--radius-full);
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
        background: transparent;
      }
      .settings-tab:hover {
        background: var(--color-surface);
        color: var(--color-text-primary);
      }
      .settings-tab.active {
        background: var(--color-secondary);
        color: #ffffff;
      }

      .settings-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .settings-card {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .card-section-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .card-section-desc {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-top: -12px;
      }

      .form-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .form-grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .df-input,
      .df-textarea {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        font-size: 0.9375rem;
        outline: none;
      }
      .df-input:focus,
      .df-textarea:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }

      .input-hint {
        font-size: 0.725rem;
        color: var(--color-text-muted);
      }

      /* Presets */
      .presets-row {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        background: var(--color-surface-subtle);
        border-radius: var(--radius-md);
      }

      .presets-label {
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--color-text-secondary);
      }

      .presets-list {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .preset-card {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: #ffffff;
        border: 1.5px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .preset-card.is-selected {
        border-color: var(--color-primary);
        background: var(--color-primary-light);
      }

      .preset-swatches {
        display: flex;
        gap: 3px;
      }

      .swatch {
        width: 14px;
        height: 14px;
        border-radius: 50%;
      }

      .preset-name {
        font-size: 0.8125rem;
        font-weight: 600;
      }

      /* Color Pickers */
      .color-picker-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .color-picker-input-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .color-picker {
        width: 44px;
        height: 44px;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        background: transparent;
      }

      .color-text {
        font-family: monospace;
        font-weight: 700;
      }

      .logo-preview-box {
        width: 60px;
        height: 60px;
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid var(--color-surface-border);
        margin-top: 6px;
      }
      .logo-preview-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-preview-box {
        width: 100%;
        height: 100px;
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid var(--color-surface-border);
        margin-top: 6px;
      }
      .cover-preview-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .payment-switches-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .pay-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--color-surface-subtle);
        border-radius: var(--radius-md);
        cursor: pointer;
      }

      .pay-title {
        font-size: 0.875rem;
        color: var(--color-text-primary);
      }

      .pay-desc {
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }

      @media (max-width: 900px) {
        .settings-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class RestaurantSettingsComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly themeService = inject(ThemeService);
  private readonly toastService = inject(ToastService);

  public readonly activeTab = signal<'profile' | 'theme' | 'billing'>('profile');

  public restaurantData!: Restaurant;
  public themeData = {
    primaryColor: '#e05326',
    accentColor: '#d97706',
  };

  public presetThemes: PresetTheme[] = [
    { name: 'Warm Terracotta (Default)', primary: '#e05326', accent: '#d97706', previewBg: '#fff2eb' },
    { name: 'Royal Saffron Gold', primary: '#d97706', accent: '#b45309', previewBg: '#fef3c7' },
    { name: 'Heritage Malvani Crimson', primary: '#b91c1c', accent: '#e11d48', previewBg: '#fef2f2' },
    { name: 'Emerald Spice Garden', primary: '#15803d', accent: '#047857', previewBg: '#ecfdf5' },
    { name: 'Luxury Midnight Amber', primary: '#1e1b19', accent: '#f59e0b', previewBg: '#fdfbf7' },
  ];

  ngOnInit(): void {
    this.restaurantData = { ...this.restaurantService.restaurant() };
    this.themeData = {
      primaryColor: this.restaurantData.theme.primaryColor || '#e05326',
      accentColor: this.restaurantData.theme.accentColor || '#d97706',
    };
  }

  applyPresetTheme(preset: PresetTheme) {
    this.themeData.primaryColor = preset.primary;
    this.themeData.accentColor = preset.accent;
    this.onColorChanged();
  }

  onColorChanged() {
    this.themeService.applyTheme({
      primaryColor: this.themeData.primaryColor,
      accentColor: this.themeData.accentColor,
    });
  }

  saveAllSettings() {
    this.restaurantData.theme = {
      ...this.restaurantData.theme,
      primaryColor: this.themeData.primaryColor,
      accentColor: this.themeData.accentColor,
    };

    this.restaurantService.updateRestaurant(this.restaurantData).subscribe(() => {
      this.toastService.success('Restaurant profile & theme configuration updated!', 'Settings Saved');
    });
  }
}

