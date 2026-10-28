import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, IconComponent, ButtonComponent],
  template: `
    <div class="auth-split-layout animate-fade-in">
      <!-- Left Visual Hero Pane -->
      <div class="auth-hero-pane">
        <div class="hero-image-overlay"></div>
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80"
          alt="Restaurant Kitchen"
          class="hero-bg-img"
        />

        <div class="hero-text-content">
          <div class="brand-badge">
            <app-icon name="store" [size]="20" color="#ffffff"></app-icon>
            <span>DineFlow Onboarding</span>
          </div>

          <h2 class="hero-headline">
            Launch your smart QR restaurant in less than 5 minutes.
          </h2>

          <div class="features-checklist">
            <div class="feat-item">
              <app-icon name="check-circle" [size]="18" color="#16a34a"></app-icon>
              <span>Instant Table QR code generation</span>
            </div>
            <div class="feat-item">
              <app-icon name="check-circle" [size]="18" color="#16a34a"></app-icon>
              <span>Zero-commission direct customer UPI payments</span>
            </div>
            <div class="feat-item">
              <app-icon name="check-circle" [size]="18" color="#16a34a"></app-icon>
              <span>Bilingual menus with authentic regional Marathi support</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Form Pane -->
      <div class="auth-form-pane">
        <div class="form-wrapper">
          <div class="form-header">
            <div class="mobile-brand-logo">
              <div class="brand-icon-box">
                <app-icon name="utensils" [size]="22" color="#ffffff"></app-icon>
              </div>
              <span class="brand-title">DineFlow</span>
            </div>

            <h1 class="welcome-heading">Create Restaurant Account</h1>
            <p class="welcome-sub">Join hundreds of premier dining establishments</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            <div class="form-group">
              <label class="form-label" for="resName">Restaurant Name</label>
              <input
                id="resName"
                type="text"
                formControlName="restaurantName"
                placeholder="e.g. Hotel Jagdamba, Malvan Tadka..."
                class="field-input"
                [class.is-invalid]="f['restaurantName'].touched && f['restaurantName'].invalid"
              />
              @if (f['restaurantName'].touched && f['restaurantName'].hasError('required')) {
                <span class="field-error">Restaurant name is required.</span>
              }
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="ownerName">Owner / Manager Name</label>
                <input
                  id="ownerName"
                  type="text"
                  formControlName="ownerName"
                  placeholder="Vikram Shinde"
                  class="field-input"
                  [class.is-invalid]="f['ownerName'].touched && f['ownerName'].invalid"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="city">City</label>
                <input
                  id="city"
                  type="text"
                  formControlName="city"
                  placeholder="Pune"
                  class="field-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="regEmail">Email Address</label>
              <input
                id="regEmail"
                type="email"
                formControlName="email"
                placeholder="owner@restaurant.com"
                class="field-input"
                [class.is-invalid]="f['email'].touched && f['email'].invalid"
              />
              @if (f['email'].touched && f['email'].hasError('required')) {
                <span class="field-error">Email is required.</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="regPhone">Phone Number</label>
              <input
                id="regPhone"
                type="tel"
                formControlName="phone"
                placeholder="+91 98220 54321"
                class="field-input"
                [class.is-invalid]="f['phone'].touched && f['phone'].invalid"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="regPass">Password</label>
              <input
                id="regPass"
                type="password"
                formControlName="password"
                placeholder="Create secure password"
                class="field-input"
                [class.is-invalid]="f['password'].touched && f['password'].invalid"
              />
            </div>

            <app-button
              variant="primary"
              size="lg"
              type="submit"
              [fullWidth]="true"
              [loading]="isLoading"
            >
              Get Started with DineFlow
            </app-button>
          </form>

          <div class="form-footer">
            <span class="footer-text">Already have an account?</span>
            <a [routerLink]="['/login']" class="register-link">Sign in here</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-split-layout {
        display: flex;
        min-height: 100vh;
        background: #ffffff;
      }

      .auth-hero-pane {
        flex: 1.1;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: flex-end;
        padding: 50px;
        background: #141211;
      }

      .hero-bg-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.5;
      }

      .hero-image-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(20, 18, 17, 0.4) 0%, rgba(20, 18, 17, 0.95) 100%);
        z-index: 1;
      }

      .hero-text-content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 560px;
        color: #ffffff;
      }

      .brand-badge {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        background: rgba(224, 83, 38, 0.35);
        border: 1px solid var(--color-primary);
        border-radius: var(--radius-full);
        font-weight: 700;
        font-size: 0.875rem;
        width: fit-content;
      }

      .hero-headline {
        font-size: 2.2rem;
        font-weight: 800;
        line-height: 1.25;
        letter-spacing: -0.02em;
        color: #ffffff;
      }

      .features-checklist {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .feat-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9375rem;
        color: #f5f2ed;
      }

      .auth-form-pane {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 24px;
        background: var(--color-bg);
      }

      .form-wrapper {
        width: 100%;
        max-width: 460px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .mobile-brand-logo {
        display: none;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .brand-icon-box {
        width: 38px;
        height: 38px;
        border-radius: var(--radius-md);
        background: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .brand-title {
        font-size: 1.35rem;
        font-weight: 800;
      }

      .welcome-heading {
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--color-text-primary);
        letter-spacing: -0.02em;
      }

      .welcome-sub {
        font-size: 0.9375rem;
        color: var(--color-text-secondary);
        margin-top: 4px;
      }

      .register-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
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

      .field-input {
        width: 100%;
        padding: 11px 14px;
        background: #ffffff;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        font-size: 0.9375rem;
        outline: none;
      }
      .field-input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }
      .field-input.is-invalid {
        border-color: var(--color-danger);
      }

      .field-error {
        font-size: 0.75rem;
        color: var(--color-danger);
        font-weight: 600;
      }

      .form-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 0.875rem;
      }

      .footer-text {
        color: var(--color-text-secondary);
      }

      .register-link {
        font-weight: 700;
        color: var(--color-primary);
      }

      @media (max-width: 900px) {
        .auth-hero-pane {
          display: none;
        }
        .mobile-brand-logo {
          display: flex;
        }
      }
    `,
  ],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  public isLoading = false;

  public registerForm: FormGroup = this.fb.group({
    restaurantName: ['', [Validators.required, Validators.minLength(2)]],
    ownerName: ['', [Validators.required]],
    city: ['Pune', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.success('Restaurant registered successfully!', 'Account Created');
          this.router.navigate(['/admin/dashboard']);
        },
        error: () => {
          this.isLoading = false;
          this.toastService.error('Registration failed', 'Error');
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}

