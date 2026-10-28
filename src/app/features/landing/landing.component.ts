import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, ButtonComponent],
  template: `
    <div class="landing-page animate-fade-in">
      <!-- Navbar -->
      <header class="landing-header">
        <div class="header-inner">
          <div class="brand-group">
            <div class="brand-symbol">
              <app-icon name="utensils" [size]="22" color="#ffffff"></app-icon>
            </div>
            <div class="brand-text">
              <span class="brand-title">DineFlow</span>
              <span class="brand-pill">SaaS Platform</span>
            </div>
          </div>

          <nav class="nav-links">
            <a href="#features" class="nav-anchor">Features</a>
            <a href="#demo" class="nav-anchor">Live Demos</a>
            <a href="#architecture" class="nav-anchor">Tech Architecture</a>
          </nav>

          <div class="header-cta-group">
            <a [routerLink]="['/login']">
              <app-button variant="outline" size="sm">Sign In</app-button>
            </a>
            <a [routerLink]="['/admin/dashboard']">
              <app-button variant="primary" size="sm" iconRight="arrow-right">Open Admin Portal</app-button>
            </a>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="announcement-pill">
            <span class="sparkle-dot"></span>
            <span>Next-Gen Hospitality OS • Multi-Restaurant QR Platform</span>
          </div>

          <h1 class="hero-title">
            Transform Physical Dining with
            <span class="gradient-text">Frictionless QR Menus</span>,
            Live KDS & Instant Payments.
          </h1>

          <p class="hero-description">
            DineFlow empowers restaurants to increase table turnover, automate order dispatch directly to the kitchen line, and deliver a luxurious mobile dining experience supporting authentic bilingual regional menus.
          </p>

          <!-- 2 Main Interactive Portal Launchers -->
          <div class="dual-launchers-container" id="demo">
            <!-- Launcher 1: Customer QR Ordering Experience -->
            <div class="launcher-card customer-launcher df-card">
              <div class="launcher-badge mobile-badge">
                <app-icon name="smartphone" [size]="15"></app-icon>
                <span>Mobile Experience</span>
              </div>
              <h3 class="launcher-title">Customer Table Experience</h3>
              <p class="launcher-desc">
                Simulate a customer scanning <strong>Table 08</strong> QR code at <strong>Hotel Jagdamba Pune</strong>. Browse bilingual Marathi dishes, customize recipes, and pay via UPI.
              </p>

              <div class="launcher-highlights">
                <span class="hl-tag">Bilingual Marathi/English</span>
                <span class="hl-tag">Interactive Bottom Sheet</span>
                <span class="hl-tag">Live Stage Tracker</span>
              </div>

              <a
                [routerLink]="['/r', 'hotel-jagdamba', 't', 'abc123']"
                target="_blank"
                class="launcher-btn customer-btn"
              >
                <span>Launch Table 08 Customer Menu</span>
                <app-icon name="arrow-up-right" [size]="18"></app-icon>
              </a>
            </div>

            <!-- Launcher 2: Restaurant Management Console -->
            <div class="launcher-card admin-launcher df-card">
              <div class="launcher-badge admin-badge">
                <app-icon name="layout-dashboard" [size]="15"></app-icon>
                <span>Admin Console</span>
              </div>
              <h3 class="launcher-title">Restaurant Management Portal</h3>
              <p class="launcher-desc">
                Full-featured dashboard with 7-day revenue analytics, live orders stream, high-contrast Kitchen Display System (KDS), and table QR stand printing.
              </p>

              <div class="launcher-highlights">
                <span class="hl-tag">Real-Time Kitchen KDS</span>
                <span class="hl-tag">Printable QR Tent Cards</span>
                <span class="hl-tag">Live Order Audio Chimes</span>
              </div>

              <a
                [routerLink]="['/admin/dashboard']"
                class="launcher-btn admin-btn"
              >
                <span>Launch Restaurant Admin Portal</span>
                <app-icon name="arrow-right" [size]="18"></app-icon>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Product Capabilities Grid -->
      <section class="features-section" id="features">
        <div class="section-head">
          <span class="section-tag">CAPABILITIES</span>
          <h2 class="section-title">Engineered for High-Volume Dining</h2>
          <p class="section-sub">From highway thali landmarks to upscale multi-outlet dining chains.</p>
        </div>

        <div class="features-grid">
          <div class="feat-card df-card">
            <div class="feat-icon bg-primary-soft">
              <app-icon name="qr-code" [size]="24" color="var(--color-primary)"></app-icon>
            </div>
            <h3 class="feat-title">Smart Table QR Generation</h3>
            <p class="feat-desc">
              Generate unique cryptographic table tokens. Print ready-to-display acrylic table tent cards with restaurant branding.
            </p>
          </div>

          <div class="feat-card df-card">
            <div class="feat-icon bg-amber-soft">
              <app-icon name="chef-hat" [size]="24" color="#d97706"></app-icon>
            </div>
            <h3 class="feat-title">High-Contrast Kitchen KDS</h3>
            <p class="feat-desc">
              Readable from 15 feet away across stove lines. Color-coded ticket stages for NEW, PREPARING, and READY with elapsed cooking timers.
            </p>
          </div>

          <div class="feat-card df-card">
            <div class="feat-icon bg-emerald-soft">
              <app-icon name="smartphone" [size]="24" color="#16a34a"></app-icon>
            </div>
            <h3 class="feat-title">Zero-Friction Mobile Ordering</h3>
            <p class="feat-desc">
              No customer app downloads or account logins required. Instant category navigation, smooth morphing quantity controls, and cooking notes.
            </p>
          </div>

          <div class="feat-card df-card">
            <div class="feat-icon bg-blue-soft">
              <app-icon name="credit-card" [size]="24" color="#2563eb"></app-icon>
            </div>
            <h3 class="feat-title">UPI & Card Table Checkout</h3>
            <p class="feat-desc">
              Instant UPI QR generation, card processing simulator, and pay-at-counter fallback with automated 5% GST and service charge breakdown.
            </p>
          </div>

          <div class="feat-card df-card">
            <div class="feat-icon bg-purple-soft">
              <app-icon name="layers" [size]="24" color="#7c3aed"></app-icon>
            </div>
            <h3 class="feat-title">Bilingual Regional Menus</h3>
            <p class="feat-desc">
              Full Marathi & local language support. Authentic dishes like मटण स्पेशल थाळी and सोलकढी render with cultural elegance.
            </p>
          </div>

          <div class="feat-card df-card">
            <div class="feat-icon bg-rose-soft">
              <app-icon name="bar-chart" [size]="24" color="#e11d48"></app-icon>
            </div>
            <h3 class="feat-title">Real-Time Executive Analytics</h3>
            <p class="feat-desc">
              7-day revenue trend graphs, peak dining hour distribution (lunch/dinner rush), and bestseller velocity metrics.
            </p>
          </div>
        </div>
      </section>

      <!-- Architecture Note -->
      <section class="arch-section" id="architecture">
        <div class="arch-box df-card">
          <div class="arch-info">
            <span class="arch-tag">FRONTEND ARCHITECTURE</span>
            <h3 class="arch-title">Ready for Spring Boot REST API Integration</h3>
            <p class="arch-desc">
              Built with Angular 22 standalone components, reactive forms, signals, and modular service interfaces (RestaurantService, MenuService, OrderService, TableService, PaymentService). Can connect to Spring Boot backend endpoints with zero UI refactoring.
            </p>
          </div>

          <div class="arch-badges">
            <span class="tech-badge">Angular 22</span>
            <span class="tech-badge">TypeScript</span>
            <span class="tech-badge">Angular Signals</span>
            <span class="tech-badge">Reactive Forms</span>
            <span class="tech-badge">SCSS Design Tokens</span>
            <span class="tech-badge">Standalone Components</span>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-inner">
          <div class="brand-group">
            <div class="brand-symbol small">
              <app-icon name="utensils" [size]="16" color="#ffffff"></app-icon>
            </div>
            <span class="brand-title">DineFlow</span>
          </div>

          <p class="copyright">
            © 2026 DineFlow Hospitality Technologies. Multi-Restaurant Digital Dining Platform.
          </p>

          <div class="footer-links">
            <a [routerLink]="['/admin/dashboard']">Admin Dashboard</a>
            <a [routerLink]="['/r', 'hotel-jagdamba', 't', 'abc123']">Table 08 Menu</a>
            <a [routerLink]="['/login']">Sign In</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      .landing-page {
        background-color: #fbf9f6;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      /* Header */
      .landing-header {
        position: sticky;
        top: 0;
        z-index: 100;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        border-bottom: 1px solid var(--color-surface-border);
        padding: 0 24px;
      }

      .header-inner {
        max-width: 1280px;
        margin: 0 auto;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .brand-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .brand-symbol {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        background: linear-gradient(135deg, var(--color-primary), #f26c41);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px var(--color-primary-glow);
      }
      .brand-symbol.small {
        width: 30px;
        height: 30px;
        border-radius: var(--radius-sm);
      }

      .brand-title {
        font-size: 1.35rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        color: var(--color-text-primary);
      }

      .brand-pill {
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        padding: 2px 6px;
        background: var(--color-primary-light);
        color: var(--color-primary);
        border-radius: var(--radius-xs);
        margin-left: 6px;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 28px;
      }

      .nav-anchor {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        transition: color var(--transition-fast);
      }
      .nav-anchor:hover {
        color: var(--color-primary);
      }

      .header-cta-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* Hero Section */
      .hero-section {
        padding: 60px 24px 40px;
        background: radial-gradient(circle at 50% 0%, #fff2eb 0%, #fbf9f6 60%);
      }

      .hero-content {
        max-width: 1140px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .announcement-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px;
        background: #ffffff;
        border: 1px solid rgba(224, 83, 38, 0.3);
        border-radius: var(--radius-full);
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--color-primary);
        box-shadow: var(--shadow-sm);
        margin-bottom: 24px;
      }

      .sparkle-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--color-primary);
        animation: pulseGlow 1.4s infinite;
      }

      .hero-title {
        font-size: 3.2rem;
        font-weight: 900;
        letter-spacing: -0.03em;
        line-height: 1.15;
        max-width: 900px;
        color: var(--color-text-primary);
        margin-bottom: 20px;
      }

      .gradient-text {
        background: linear-gradient(135deg, var(--color-primary), #d97706);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .hero-description {
        font-size: 1.125rem;
        line-height: 1.6;
        color: var(--color-text-secondary);
        max-width: 760px;
        margin-bottom: 48px;
      }

      /* Dual Demo Launchers */
      .dual-launchers-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px;
        width: 100%;
        text-align: left;
      }

      .launcher-card {
        padding: 32px 28px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        border-radius: var(--radius-2xl);
        background: #ffffff;
        box-shadow: var(--shadow-md);
        transition: transform var(--transition-fast), box-shadow var(--transition-normal);
        position: relative;
        overflow: hidden;
      }
      .launcher-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }

      .customer-launcher {
        border-top: 5px solid var(--color-primary);
      }
      .admin-launcher {
        border-top: 5px solid var(--color-secondary);
      }

      .launcher-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        width: fit-content;
      }
      .mobile-badge {
        background: var(--color-primary-light);
        color: var(--color-primary);
      }
      .admin-badge {
        background: #f1f5f9;
        color: #334155;
      }

      .launcher-title {
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .launcher-desc {
        font-size: 0.9375rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
      }

      .launcher-highlights {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 6px;
      }

      .hl-tag {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 4px 10px;
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
      }

      .launcher-btn {
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 22px;
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        font-weight: 800;
        transition: all var(--transition-fast);
      }

      .customer-btn {
        background: var(--color-primary);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(224, 83, 38, 0.3);
      }
      .customer-btn:hover {
        background: var(--color-primary-hover);
        transform: translateY(-1px);
      }

      .admin-btn {
        background: var(--color-secondary);
        color: #ffffff;
      }
      .admin-btn:hover {
        background: #000000;
        transform: translateY(-1px);
      }

      /* Features Section */
      .features-section {
        padding: 70px 24px;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
      }

      .section-head {
        text-align: center;
        margin-bottom: 48px;
      }

      .section-tag {
        font-size: 0.775rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--color-primary);
        display: block;
        margin-bottom: 8px;
      }

      .section-title {
        font-size: 2.2rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--color-text-primary);
      }

      .section-sub {
        font-size: 1rem;
        color: var(--color-text-secondary);
        margin-top: 6px;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 24px;
      }

      .feat-card {
        padding: 28px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .feat-icon {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .bg-primary-soft { background: var(--color-primary-light); }
      .bg-amber-soft { background: #fef3c7; }
      .bg-emerald-soft { background: #ecfdf5; }
      .bg-blue-soft { background: #eff6ff; }
      .bg-purple-soft { background: #f5f3ff; }
      .bg-rose-soft { background: #fff1f2; }

      .feat-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      .feat-desc {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
      }

      /* Architecture Box */
      .arch-section {
        padding: 0 24px 60px;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
      }

      .arch-box {
        padding: 36px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 30px;
        background: linear-gradient(135deg, #ffffff 0%, #fdf8f4 100%);
        border: 1.5px solid rgba(224, 83, 38, 0.25);
      }

      .arch-tag {
        font-size: 0.725rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--color-primary);
      }

      .arch-title {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--color-text-primary);
        margin: 4px 0 8px;
      }

      .arch-desc {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
        max-width: 600px;
      }

      .arch-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        max-width: 380px;
        justify-content: flex-end;
      }

      .tech-badge {
        font-size: 0.8125rem;
        font-weight: 700;
        padding: 6px 12px;
        background: #ffffff;
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-md);
        color: var(--color-text-primary);
        box-shadow: var(--shadow-xs);
      }

      /* Footer */
      .landing-footer {
        background: #141211;
        color: #ffffff;
        padding: 30px 24px;
        margin-top: auto;
      }

      .footer-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }

      .landing-footer .brand-title {
        color: #ffffff;
      }

      .copyright {
        font-size: 0.8125rem;
        color: #8c857e;
      }

      .footer-links {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      .footer-links a {
        font-size: 0.8125rem;
        color: #c4bfba;
      }
      .footer-links a:hover {
        color: var(--color-primary);
      }

      @media (max-width: 860px) {
        .hero-title {
          font-size: 2.3rem;
        }
        .dual-launchers-container {
          grid-template-columns: 1fr;
        }
        .arch-box {
          flex-direction: column;
          align-items: flex-start;
        }
        .arch-badges {
          justify-content: flex-start;
        }
        .nav-links {
          display: none;
        }
      }
    `,
  ],
})
export class LandingComponent {
  protected readonly restaurantService = inject(RestaurantService);
}
