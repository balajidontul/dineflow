import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, IconComponent, ButtonComponent],
  template: `
    <div class="auth-split-layout animate-fade-in">
      <!-- Left Visual Hero Pane (Desktop) -->
      <div class="auth-hero-pane">
        <div class="hero-image-overlay"></div>
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80"
          alt="Fine Dining Ambiance"
          class="hero-bg-img"
        />

        <div class="hero-text-content">
          <div class="brand-badge">
            <app-icon name="utensils" [size]="20" color="#ffffff"></app-icon>
            <span>DineFlow Platform</span>
          </div>

          <h2 class="hero-headline">
            Empower your restaurant with lightning-fast QR ordering & instant table billing.
          </h2>

          <div class="hero-quote-box">
            <p class="quote-text">
              "DineFlow increased our table turnover by 34% on peak weekends while delighting our guests with regional Marathi menus."
            </p>
            <div class="quote-author">
              <strong>Vikram Shinde</strong>
              <span>Founder, Hotel Jagdamba Pune</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Form Pane -->
      <div class="auth-form-pane">
        <div class="form-wrapper">
          <!-- Header -->
          <div class="form-header">
            <div class="mobile-brand-logo">
              <div class="brand-icon-box">
                <app-icon name="utensils" [size]="22" color="#ffffff"></app-icon>
              </div>
              <span class="brand-title">DineFlow</span>
            </div>

            <h1 class="welcome-heading">Welcome Back</h1>
            <p class="welcome-sub">Sign in to your restaurant management console</p>
          </div>

          <!-- Quick Demo Credentials Pill -->
          <div class="demo-cred-card">
            <div class="demo-info-left">
              <span class="demo-tag">DEMO RESTAURANT OWNER</span>
              <span class="demo-email">vikram&#64;hoteljagdamba.com</span>
            </div>
            <button type="button" class="autofill-btn" (click)="fillDemoCredentials()">
              Auto Fill
            </button>
          </div>

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <!-- Email -->
            <div class="form-group">
              <label class="form-label" for="loginEmail">Email Address</label>
              <div class="input-with-icon">
                <app-icon name="user" [size]="18" class="field-icon"></app-icon>
                <input
                  id="loginEmail"
                  type="email"
                  formControlName="email"
                  placeholder="name@restaurant.com"
                  class="field-input"
                  [class.is-invalid]="f['email'].touched && f['email'].invalid"
                />
              </div>
              @if (f['email'].touched && f['email'].hasError('required')) {
                <span class="field-error">Email is required.</span>
              }
              @if (f['email'].touched && f['email'].hasError('email')) {
                <span class="field-error">Please enter a valid email address.</span>
              }
            </div>

            <!-- Password -->
            <div class="form-group">
              <div class="label-row">
                <label class="form-label" for="loginPass">Password</label>
                <a [routerLink]="['/forgot-password']" class="forgot-link">Forgot password?</a>
              </div>
              <div class="input-with-icon">
                <app-icon name="shield-check" [size]="18" class="field-icon"></app-icon>
                <input
                  id="loginPass"
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  class="field-input"
                  [class.is-invalid]="f['password'].touched && f['password'].invalid"
                />
              </div>
              @if (f['password'].touched && f['password'].hasError('required')) {
                <span class="field-error">Password is required.</span>
              }
            </div>

            <!-- Remember Me -->
            <label class="remember-row">
              <input type="checkbox" formControlName="rememberMe" />
              <span>Keep me signed in for 30 days</span>
            </label>

            <!-- Submit Button -->
            <app-button
              variant="primary"
              size="lg"
              type="submit"
              [fullWidth]="true"
              [loading]="isLoading"
            >
              Sign In to Portal
            </app-button>
          </form>

          <!-- Register Link -->
          <div class="form-footer">
            <span class="footer-text">New to DineFlow?</span>
            <a [routerLink]="['/register']" class="register-link">Register your restaurant</a>
          </div>

          <!-- Quick Guest Table Experience Jump Link -->
          <div class="guest-qr-shortcut">
            <span class="shortcut-desc">Want to test the customer dining view?</span>
            <a [routerLink]="['/r', 'hotel-jagdamba', 't', 'abc123']" target="_blank" class="guest-link">
              <span>Open Customer Table 08 Menu</span>
              <app-icon name="arrow-up-right" [size]="14"></app-icon>
            </a>
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

      /* Left Hero Pane */
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
        opacity: 0.55;
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
        gap: 24px;
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

      .hero-quote-box {
        padding: 20px;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .quote-text {
        font-size: 0.9375rem;
        line-height: 1.5;
        color: #e5e0d8;
        font-style: italic;
      }

      .quote-author {
        display: flex;
        flex-direction: column;
        font-size: 0.8125rem;
      }
      .quote-author strong {
        color: #ffffff;
      }
      .quote-author span {
        color: #aaa;
      }

      /* Right Form Pane */
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
        max-width: 440px;
        display: flex;
        flex-direction: column;
        gap: 24px;
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
        color: var(--color-text-primary);
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

      .demo-cred-card {
        padding: 12px 16px;
        background: #ffffff;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: var(--shadow-xs);
      }

      .demo-info-left {
        display: flex;
        flex-direction: column;
      }

      .demo-tag {
        font-size: 0.65rem;
        font-weight: 800;
        color: var(--color-primary);
        letter-spacing: 0.05em;
      }

      .demo-email {
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .autofill-btn {
        padding: 5px 12px;
        background: var(--color-primary-light);
        color: var(--color-primary);
        font-size: 0.775rem;
        font-weight: 700;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background-color var(--transition-fast);
      }
      .autofill-btn:hover {
        background: var(--color-primary);
        color: #ffffff;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .label-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .form-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .forgot-link {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-primary);
      }

      .input-with-icon {
        position: relative;
        display: flex;
        align-items: center;
      }

      .field-icon {
        position: absolute;
        left: 14px;
        color: var(--color-text-muted);
        pointer-events: none;
      }

      .field-input {
        width: 100%;
        padding: 12px 14px 12px 42px;
        background: #ffffff;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        font-size: 0.9375rem;
        color: var(--color-text-primary);
        outline: none;
        transition: all var(--transition-fast);
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
        font-weight: 600;
        color: var(--color-danger);
      }

      .remember-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
        cursor: pointer;
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

      .guest-qr-shortcut {
        padding: 14px;
        background: #ffffff;
        border: 1px dashed var(--color-surface-border);
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 6px;
      }

      .shortcut-desc {
        font-size: 0.775rem;
        color: var(--color-text-muted);
      }

      .guest-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8125rem;
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  public isLoading = false;

  public loginForm: FormGroup = this.fb.group({
    email: ['vikram@hoteljagdamba.com', [Validators.required, Validators.email]],
    password: ['Jagdamba@2026', [Validators.required]],
    rememberMe: [true],
  });

  get f() {
    return this.loginForm.controls;
  }

  fillDemoCredentials() {
    this.loginForm.patchValue({
      email: 'vikram@hoteljagdamba.com',
      password: 'Password@123',
    });
    this.toastService.info('Demo credentials auto-filled', 'Demo Ready');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.success('Welcome back, Vikram!', 'Signed In');
          this.router.navigate(['/admin/dashboard']);
        },
        error: () => {
          this.isLoading = false;
          this.toastService.error('Invalid credentials', 'Login Failed');
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}

