import { Routes } from '@angular/router';

export const routes: Routes = [
  // 1. Landing & Interactive Showcase
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
    title: 'DineFlow — Next-Gen Multi-Restaurant Digital Dining Platform',
  },

  // 2. Authentication
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Sign In — DineFlow Restaurant Portal',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Register Restaurant — DineFlow',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
    title: 'Reset Password — DineFlow',
  },

  // 3. Restaurant Management Console (/admin)
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        title: 'Executive Dashboard — DineFlow',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/orders/orders-board/orders-board.component').then(
            (m) => m.OrdersBoardComponent
          ),
        title: 'Live Orders Management — DineFlow',
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./features/admin/menu/menu-list/menu-list.component').then(
            (m) => m.MenuListComponent
          ),
        title: 'Menu Management — DineFlow',
      },
      {
        path: 'menu/categories',
        loadComponent: () =>
          import('./features/admin/menu/category-manager/category-manager.component').then(
            (m) => m.CategoryManagerComponent
          ),
        title: 'Category Hierarchy — DineFlow',
      },
      {
        path: 'kitchen',
        loadComponent: () =>
          import('./features/admin/kitchen/kitchen-display/kitchen-display.component').then(
            (m) => m.KitchenDisplayComponent
          ),
        title: 'Kitchen Display System (KDS) — DineFlow',
      },
      {
        path: 'tables',
        loadComponent: () =>
          import('./features/admin/tables/tables-list/tables-list.component').then(
            (m) => m.TablesListComponent
          ),
        title: 'Dining Tables & QR Codes — DineFlow',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/settings/restaurant-settings/restaurant-settings.component').then(
            (m) => m.RestaurantSettingsComponent
          ),
        title: 'Restaurant Profile & Branding — DineFlow',
      },
    ],
  },

  // 4. Customer Dining & QR Ordering Experience (/r/:restaurantSlug/t/:tableToken)
  {
    path: 'r/:restaurantSlug/t/:tableToken',
    loadComponent: () =>
      import('./features/customer/menu/customer-menu.component').then(
        (m) => m.CustomerMenuComponent
      ),
    title: 'Hotel Jagdamba — Table Dining Menu',
  },
  {
    path: 'r/:restaurantSlug/t/:tableToken/cart',
    loadComponent: () =>
      import('./features/customer/cart/customer-cart.component').then(
        (m) => m.CustomerCartComponent
      ),
    title: 'Your Dining Order — Hotel Jagdamba',
  },
  {
    path: 'r/:restaurantSlug/t/:tableToken/confirm/:orderId',
    loadComponent: () =>
      import('./features/customer/confirmation/order-success.component').then(
        (m) => m.OrderSuccessComponent
      ),
    title: 'Order Confirmed — Hotel Jagdamba',
  },
  {
    path: 'r/:restaurantSlug/t/:tableToken/track/:orderId',
    loadComponent: () =>
      import('./features/customer/tracking/order-tracking.component').then(
        (m) => m.OrderTrackingComponent
      ),
    title: 'Live Kitchen Tracking — Hotel Jagdamba',
  },
  {
    path: 'r/:restaurantSlug/t/:tableToken/pay/:orderId',
    loadComponent: () =>
      import('./features/customer/payment/customer-payment.component').then(
        (m) => m.CustomerPaymentComponent
      ),
    title: 'Table Payment — Hotel Jagdamba',
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: '',
  },
];
