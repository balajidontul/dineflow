import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, ButtonComponent],
  template: `
    <div class="auth-single-viewport animate-fade-in">
      <div class="auth-card df-card">
        <a [routerLink]="['/login']" class="back-link">
          <app-icon name="arrow-left" [size]="16"></app-icon>
          <span>Back to Sign In</span>
        </a>

        <div class="auth-icon-circle">
          <app-icon name="shield-check" [size]="32" color="var(--color-primary)"></app-icon>
        </div>

        <h1 class="auth-heading">Forgot Password?</h1>
        <p class="auth-sub">Enter the email address registered with your DineFlow restaurant account.</p>

        @if (!isSubmitted) {
          <form (ngSubmit)="onSubmit()" class="forgot-form">
            <div class="form-group">
              <label class="form-label" for="resetEmail">Email Address</label>
              <input
                id="resetEmail"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="name@restaurant.com"
                class="field-input"
              />
            </div>

            <app-button
              variant="primary"
              size="lg"
              type="submit"
              [fullWidth]="true"
              [loading]="isLoading"
              [disabled]="!email.trim()"
            >
              Send Reset Instructions
            </app-button>
          </form>
        } @else {
          <div class="success-banner">
            <app-icon name="check-circle" [size]="20" color="#16a34a"></app-icon>
            <div>
              <strong>Email Dispatched</strong>
              <p>We've sent password reset instructions to <strong>{{ email }}</strong>.</p>
            </div>
          </div>

          <a [routerLink]="['/login']" class="return-btn">
            Return to Login
          </a>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .auth-single-viewport {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: var(--color-bg);
      }

      .auth-card {
        width: 100%;
        max-width: 440px;
        background: #ffffff;
        border-radius: var(--radius-xl);
        padding: 36px 28px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: var(--shadow-lg);
      }

      .back-link {
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        margin-bottom: 12px;
      }
      .back-link:hover {
        color: var(--color-primary);
      }

      .auth-icon-circle {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--color-primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }

      .auth-heading {
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .auth-sub {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin-top: 4px;
        margin-bottom: 24px;
      }

      .forgot-form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        width: 100%;
      }

      .form-label {
        font-size: 0.8125rem;
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

      .success-banner {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: var(--radius-md);
        text-align: left;
        font-size: 0.8125rem;
        color: #047857;
        margin-bottom: 20px;
        width: 100%;
      }

      .return-btn {
        font-weight: 700;
        font-size: 0.875rem;
        color: var(--color-primary);
      }
    `,
  ],
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  public email = 'vikram@hoteljagdamba.com';
  public isLoading = false;
  public isSubmitted = false;

  onSubmit() {
    if (this.email.trim()) {
      this.isLoading = true;
      this.authService.forgotPassword(this.email).subscribe((res) => {
        this.isLoading = false;
        this.isSubmitted = true;
        this.toastService.info(res.message, 'Instructions Sent');
      });
    }
  }
}

