import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: () => number | string | undefined;
  badgeVariant?: 'primary' | 'warning' | 'danger';
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="admin-shell" [class.sidebar-collapsed]="isSidebarCollapsed()" [class.mobile-open]="isMobileNavOpen()">
      <!-- Mobile Overlay -->
      @if (isMobileNavOpen()) {
        <div class="mobile-backdrop" (click)="closeMobileNav()"></div>
      }

      <!-- Admin Sidebar -->
      <aside class="admin-sidebar">
        <!-- Brand Header -->
        <div class="sidebar-header">
          <div class="brand-logo-area">
            <div class="brand-symbol">
              <app-icon name="utensils" [size]="20" color="#ffffff"></app-icon>
            </div>
            @if (!isSidebarCollapsed()) {
              <div class="brand-text">
                <span class="brand-name">DineFlow</span>
                <span class="brand-tag">PORTAL</span>
              </div>
            }
          </div>

          <button
            type="button"
            class="sidebar-toggle-btn desktop-only"
            (click)="toggleSidebarCollapse()"
            [attr.title]="isSidebarCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
          >
            <app-icon [name]="isSidebarCollapsed() ? 'chevron-right' : 'chevron-left'" [size]="16"></app-icon>
          </button>
        </div>

        <!-- Current Restaurant Badge -->
        <div class="restaurant-pill">
          <div class="res-avatar">
            <img [src]="restaurantService.restaurant().logoUrl" alt="Restaurant logo" />
          </div>
          @if (!isSidebarCollapsed()) {
            <div class="res-meta">
              <span class="res-name">{{ restaurantService.restaurant().name }}</span>
              <span class="res-branch">{{ restaurantService.selectedBranch().name }}</span>
            </div>
          }
        </div>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/admin' || item.route === '/admin/dashboard' }"
              class="nav-item"
              (click)="closeMobileNav()"
              [attr.title]="item.label"
            >
              <div class="nav-icon-box">
                <app-icon [name]="item.icon" [size]="19"></app-icon>
              </div>

              @if (!isSidebarCollapsed()) {
                <span class="nav-label">{{ item.label }}</span>
                @if (item.badge && item.badge()) {
                  <span class="nav-badge" [class]="'badge-' + (item.badgeVariant || 'primary')">
                    {{ item.badge() }}
                  </span>
                }
              }
            </a>
          }
        </nav>

        <!-- Sidebar Footer Quick Actions -->
        <div class="sidebar-footer">
          @if (!isSidebarCollapsed()) {
            <a
              [routerLink]="['/r', restaurantService.restaurant().slug, 't', 'abc123']"
              target="_blank"
              class="customer-preview-btn"
            >
              <app-icon name="external-link" [size]="16"></app-icon>
              <span>Customer QR View</span>
            </a>
          } @else {
            <a
              [routerLink]="['/r', restaurantService.restaurant().slug, 't', 'abc123']"
              target="_blank"
              class="customer-preview-btn icon-only"
              title="Customer QR View"
            >
              <app-icon name="external-link" [size]="18"></app-icon>
            </a>
          }
        </div>
      </aside>

      <!-- Main Content Stage -->
      <div class="admin-main">
        <!-- Top Navbar -->
        <header class="admin-topbar">
          <div class="topbar-left">
            <button type="button" class="mobile-menu-btn" (click)="toggleMobileNav()" aria-label="Toggle navigation">
              <app-icon name="menu" [size]="22"></app-icon>
            </button>

            <!-- Branch Switcher -->
            <div class="branch-selector">
              <app-icon name="store" [size]="17" color="var(--color-primary)"></app-icon>
              <select
                [value]="restaurantService.selectedBranchId()"
                (change)="onBranchChange($event)"
                class="branch-dropdown"
              >
                @for (b of restaurantService.branches(); track b.id) {
                  <option [value]="b.id">{{ b.name }} ({{ b.code }})</option>
                }
              </select>
            </div>
          </div>

          <!-- Topbar Actions -->
          <div class="topbar-right">
            <!-- Table Scan Quick Demo Link -->
            <a
              [routerLink]="['/r', restaurantService.restaurant().slug, 't', 'abc123']"
              target="_blank"
              class="quick-qr-pill"
            >
              <span class="qr-dot"></span>
              <app-icon name="qr-code" [size]="15"></app-icon>
              <span class="qr-text">Live Table T08 View</span>
            </a>

            <!-- Live Order Notification Alert -->
            <div class="notification-wrapper">
              <button
                type="button"
                class="icon-action-btn"
                [class.has-alert]="orderService.hasNewOrderAlert()"
                (click)="toggleOrderAlertModal()"
                aria-label="Order notifications"
              >
                <app-icon name="bell" [size]="20"></app-icon>
                @if (orderService.hasNewOrderAlert()) {
                  <span class="pulse-indicator"></span>
                }
              </button>
            </div>

            <!-- Profile Menu -->
            <div class="user-profile-menu">
              <div class="avatar-box">
                <img [src]="authService.currentUser()?.avatarUrl" alt="User avatar" />
              </div>
              <div class="user-info desktop-only">
                <span class="user-name">{{ authService.currentUser()?.name }}</span>
                <span class="user-role">{{ authService.currentUser()?.role | uppercase }}</span>
              </div>
              <button
                type="button"
                class="logout-btn"
                (click)="logout()"
                title="Log Out"
                aria-label="Log Out"
              >
                <app-icon name="log-out" [size]="17"></app-icon>
              </button>
            </div>
          </div>
        </header>

        <!-- Dynamic Admin Router View -->
        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-shell {
        display: flex;
        min-height: 100vh;
        background-color: var(--color-bg);
      }

      /* Sidebar */
      .admin-sidebar {
        width: var(--sidebar-width);
        background-color: var(--color-dark-surface);
        border-right: 1px solid var(--color-dark-border);
        color: var(--color-dark-text);
        display: flex;
        flex-direction: column;
        transition: width var(--transition-normal);
        z-index: 100;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
      }

      .sidebar-collapsed .admin-sidebar {
        width: var(--sidebar-width-collapsed);
      }

      .sidebar-header {
        height: var(--header-height-admin);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        border-bottom: 1px solid var(--color-dark-border);
      }

      .brand-logo-area {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .brand-symbol {
        width: 38px;
        height: 38px;
        background: linear-gradient(135deg, var(--color-primary), #f26c41);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px var(--color-primary-glow);
        flex-shrink: 0;
      }

      .brand-name {
        font-size: 1.25rem;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.02em;
      }

      .brand-tag {
        font-size: 0.625rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        padding: 2px 5px;
        border-radius: var(--radius-xs);
        background: rgba(224, 83, 38, 0.25);
        color: var(--color-primary);
        margin-left: 6px;
      }

      .sidebar-toggle-btn {
        width: 30px;
        height: 30px;
        border-radius: var(--radius-sm);
        background: var(--color-dark-border);
        color: var(--color-dark-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
      }
      .sidebar-toggle-btn:hover {
        background: var(--color-primary);
        color: #ffffff;
      }

      /* Restaurant Pill */
      .restaurant-pill {
        margin: 16px 14px;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--color-dark-border);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .res-avatar {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-sm);
        overflow: hidden;
        flex-shrink: 0;
      }
      .res-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .res-meta {
        overflow: hidden;
      }
      .res-name {
        display: block;
        font-weight: 700;
        font-size: 0.875rem;
        color: #ffffff;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .res-branch {
        display: block;
        font-size: 0.725rem;
        color: var(--color-dark-muted);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      /* Sidebar Nav */
      .sidebar-nav {
        flex: 1;
        padding: 8px 12px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 10px 14px;
        border-radius: var(--radius-md);
        color: var(--color-dark-muted);
        font-size: 0.9rem;
        font-weight: 500;
        transition: all var(--transition-fast);
      }

      .nav-item:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #ffffff;
      }

      .nav-item.active {
        background: var(--color-primary);
        color: #ffffff;
        font-weight: 600;
        box-shadow: 0 4px 14px rgba(224, 83, 38, 0.35);
      }

      .nav-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .nav-label {
        flex: 1;
        white-space: nowrap;
      }

      .nav-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: var(--radius-full);
      }
      .nav-badge.badge-warning {
        background: #f59e0b;
        color: #1a1817;
      }
      .nav-badge.badge-primary {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
      }

      /* Sidebar Footer */
      .sidebar-footer {
        padding: 16px;
        border-top: 1px solid var(--color-dark-border);
      }

      .customer-preview-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px 14px;
        border-radius: var(--radius-md);
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        font-size: 0.8125rem;
        font-weight: 600;
        transition: all var(--transition-fast);
      }
      .customer-preview-btn:hover {
        background: rgba(255, 255, 255, 0.16);
      }
      .customer-preview-btn.icon-only {
        padding: 10px 0;
      }

      /* Admin Main Area */
      .admin-main {
        flex: 1;
        margin-left: var(--sidebar-width);
        display: flex;
        flex-direction: column;
        min-width: 0;
        transition: margin-left var(--transition-normal);
      }

      .sidebar-collapsed .admin-main {
        margin-left: var(--sidebar-width-collapsed);
      }

      /* Topbar */
      .admin-topbar {
        height: var(--header-height-admin);
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-surface-border);
        padding: 0 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 90;
      }

      .topbar-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .mobile-menu-btn {
        display: none;
        color: var(--color-text-primary);
        padding: 6px;
      }

      .branch-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--radius-full);
      }

      .branch-dropdown {
        border: none;
        background: transparent;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text-primary);
        outline: none;
        cursor: pointer;
      }

      .topbar-right {
        display: flex;
        align-items: center;
        gap: 18px;
      }

      .quick-qr-pill {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 6px 12px;
        background: var(--color-primary-light);
        border: 1px solid rgba(224, 83, 38, 0.2);
        border-radius: var(--radius-full);
        color: var(--color-primary);
        font-size: 0.8125rem;
        font-weight: 600;
        transition: all var(--transition-fast);
      }
      .quick-qr-pill:hover {
        background: var(--color-primary);
        color: #ffffff;
      }

      .qr-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: #16a34a;
        animation: pulseDot 1.5s infinite;
      }

      .notification-wrapper {
        position: relative;
      }

      .icon-action-btn {
        width: 38px;
        height: 38px;
        border-radius: var(--radius-full);
        background: var(--color-surface-subtle);
        border: 1px solid var(--color-surface-border);
        color: var(--color-text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        transition: all var(--transition-fast);
      }
      .icon-action-btn:hover {
        background: #ffffff;
        color: var(--color-primary);
        border-color: rgba(224, 83, 38, 0.3);
      }

      .pulse-indicator {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--color-primary);
        box-shadow: 0 0 0 4px rgba(224, 83, 38, 0.35);
        animation: pulseGlow 1.2s infinite;
      }

      .user-profile-menu {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-left: 12px;
        border-left: 1px solid var(--color-surface-border);
      }

      .avatar-box {
        width: 38px;
        height: 38px;
        border-radius: var(--radius-full);
        overflow: hidden;
        border: 2px solid var(--color-primary-light);
      }
      .avatar-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .user-info {
        display: flex;
        flex-direction: column;
      }
      .user-name {
        font-weight: 700;
        font-size: 0.875rem;
        color: var(--color-text-primary);
        line-height: 1.2;
      }
      .user-role {
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--color-primary);
        letter-spacing: 0.05em;
      }

      .logout-btn {
        color: var(--color-text-muted);
        padding: 6px;
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast);
      }
      .logout-btn:hover {
        color: var(--color-danger);
      }

      /* Admin Content Outlet */
      .admin-content {
        padding: 30px;
        flex: 1;
        max-width: 1600px;
        width: 100%;
        margin: 0 auto;
      }

      @media (max-width: 1024px) {
        .admin-sidebar {
          transform: translateX(-100%);
          transition: transform var(--transition-normal);
        }
        .mobile-open .admin-sidebar {
          transform: translateX(0);
          width: var(--sidebar-width);
        }
        .admin-main {
          margin-left: 0 !important;
        }
        .mobile-menu-btn {
          display: flex;
        }
        .desktop-only {
          display: none !important;
        }
        .mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
          z-index: 99;
        }
      }

      @media (max-width: 640px) {
        .admin-topbar {
          padding: 0 16px;
        }
        .admin-content {
          padding: 18px 14px;
        }
        .quick-qr-pill .qr-text {
          display: none;
        }
      }
    `,
  ],
})
export class AdminLayoutComponent {
  protected readonly restaurantService = inject(RestaurantService);
  protected readonly orderService = inject(OrderService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly isSidebarCollapsed = signal<boolean>(false);
  public readonly isMobileNavOpen = signal<boolean>(false);

  public readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'layout-dashboard' },
    {
      label: 'Orders',
      route: '/admin/orders',
      icon: 'clipboard-list',
      badge: () => this.orderService.countsByStatus().placed || undefined,
      badgeVariant: 'warning',
    },
    { label: 'Menu', route: '/admin/menu', icon: 'utensils' },
    { label: 'Categories', route: '/admin/menu/categories', icon: 'layers' },
    { label: 'Tables & QR Codes', route: '/admin/tables', icon: 'qr-code' },
    {
      label: 'Kitchen KDS',
      route: '/admin/kitchen',
      icon: 'chef-hat',
      badge: () => this.orderService.countsByStatus().preparing || undefined,
      badgeVariant: 'primary',
    },
    { label: 'Settings', route: '/admin/settings', icon: 'settings' },
  ];

  toggleSidebarCollapse() {
    this.isSidebarCollapsed.update((val) => !val);
  }

  toggleMobileNav() {
    this.isMobileNavOpen.update((val) => !val);
  }

  closeMobileNav() {
    this.isMobileNavOpen.set(false);
  }

  onBranchChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.restaurantService.selectBranch(target.value);
  }

  toggleOrderAlertModal() {
    this.orderService.clearNewOrderAlert();
    this.router.navigate(['/admin/orders']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
