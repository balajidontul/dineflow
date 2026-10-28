# DineFlow — Multi-Restaurant Digital Menu, Table Ordering & Payment Platform

DineFlow is a production-quality SaaS frontend built with **Angular (v22)**, **TypeScript**, **Angular Signals**, **Standalone Components**, **Reactive Forms**, and **SCSS Design Tokens**.

It delivers two experiences:
1. **Restaurant Management Portal** (`/admin`) for restaurant owners, kitchen chefs, and dining room managers.
2. **Customer QR Dining Experience** (`/r/:restaurantSlug/t/:tableToken`) optimized mobile-first for customers seated at restaurant tables.

---

## 🍽️ Sample Restaurant Showcase
- **Restaurant:** Hotel Jagdamba (हॉटेल जगदंबा)
- **Location:** Shivapur, Pune, Maharashtra
- **Specialty:** Authentic Maharashtrian Mutton & Gavran Chicken
- **Bilingual Menu:** Full English & Marathi support (e.g. *मटण स्पेशल थाळी / Mutton Special Thali*, *गावरान चिकन हंडी*, *सोलकढी*, *बाजरीची भाकरी*)

---

## 🚀 Key Features

### 1. Restaurant Management Portal (`/admin`)
- **Executive Dashboard (`/admin/dashboard`):**
  - KPI metric cards: Today's Revenue (₹48,650), Orders Count (42), Active Tables (7/12), Average Order Value (₹1,158).
  - 7-Day interactive Revenue Trend chart.
  - Hourly dining rush chart (Lunch 1 PM & Dinner 9 PM peaks).
  - Top performing popular dishes table with sales volume and revenues.
  - Live orders stream with status update action buttons.
- **Live Orders Board (`/admin/orders`):**
  - Status tabs: All, New (Placed), Preparing, Ready, Served, Completed.
  - Flashing notification banner with simulated audio chime on incoming table orders.
  - Contextual action buttons: *Accept Order*, *Start Preparing*, *Mark Ready*, *Mark Served*, *Complete Order*, *Cancel*.
- **Menu Management (`/admin/menu`):**
  - Beautiful culinary dish cards with high-res photography, Marathi titles, dietary classification (Veg/Non-Veg), spice level meter, and prep time.
  - Filter by category, dietary preference, stock availability, or instant search.
  - Real-time stock toggle (`In Stock` / `Out of Stock`).
  - Slide-in **Add/Edit Dish Drawer** with Reactive Forms validation (item name, local name, price, discount, spice level, preparation time, image URL, toggles).
- **Category Hierarchy (`/admin/menu/categories`):**
  - Reorder categories up/down to configure mobile display sequence.
  - Add, edit, delete, and enable/disable categories.
- **Kitchen Display System — KDS (`/admin/kitchen`):**
  - 3-column high-contrast board (`NEW`, `PREPARING`, `READY`) engineered for 15-foot distance visibility across hot stove lines.
  - Elapsed live timers, strike-through checklist, and highlighted customer cooking instructions (*"Extra spicy kala rassa, no onion in salad"*).
- **Dining Tables & QR Codes (`/admin/tables`):**
  - Table cards (T01 through T12) showing capacity, occupancy status, and active guests.
  - Table status selector: *Available*, *Occupied*, *Ordering*, *Waiting for payment*.
  - **Printable QR Code Modal**: Generates high-resolution QR codes suitable for physical acrylic table stands with restaurant branding. One-click print and PNG download.
- **Settings & Theme Customization (`/admin/settings`):**
  - Restaurant profile, GST compliance, dining hours, and contact details.
  - Dynamic Theme Customizer: select presets (*Warm Terracotta*, *Royal Saffron Gold*, *Heritage Crimson*, *Emerald Spice*, *Midnight Amber*) or pick custom brand colors that update the entire UI in real time via CSS variables.
  - Billing taxes (5% GST, 2.5% service charge) and payment gateway switches.

### 2. Customer Mobile-First Dining Experience (`/r/:restaurantSlug/t/:tableToken`)
- **Mobile QR Menu:**
  - Designed for mobile viewports (360px, 390px, 430px) and tablet/desktop.
  - Header with restaurant branding, table number pill (e.g. *Table 08*), open status, rating, and prep estimate.
  - Sticky search bar and horizontally scrolling category chips.
  - Bilingual cards with Marathi listed first (*मटण स्पेशल थाळी* / *Mutton Special Thali*).
  - Smooth morphing `ADD` button that transitions into `[-] 1 [+]` quantity controls.
- **Dish Detail Bottom Sheet:**
  - High-res photography, ingredients list, spice meter, prep time, quantity selector, and cooking instructions textarea.
  - Prominent CTA: `Add to Order • ₹450`.
- **Floating Bottom Cart:**
  - Animated bar indicating item count and total (`3 items • ₹1,240 [View Order →]`).
- **Cart & Bill Summary (`/cart`):**
  - Itemized dish list with quantity adjustment and removal.
  - Special kitchen cooking notes.
  - Itemized bill breakdown (Item Total, 5% GST, 2.5% Service Charge, Grand Total).
  - CTA: `Place Order • ₹1,240`.
- **Celebratory Order Confirmation (`/confirm/:orderId`):**
  - Festive confetti burst animation with animated checkmark.
  - Order #ORD-1042 callout and preparation countdown (20–25 mins).
- **Live Order Tracking (`/track/:orderId`):**
  - Visual 5-stage vertical progress tracker (*Placed → Accepted → Preparing → Ready → Served*).
  - Active cooking stage explanation.
  - "Call Waiter" instant assistance button.
  - Stage simulator buttons to test live order transitions.
- **Online Payment Experience (`/pay/:orderId`):**
  - UPI Payment with dynamic QR code & GPay/PhonePe/Paytm quick chips.
  - Credit/Debit Card payment with secure card form.
  - Pay at Counter fallback.
  - Interactive payment failure simulation toggle with retry flow.

### 3. Authentication & Demo Showcase
- **Split-Screen Sign In (`/login`):** Hospitality-themed visual split layout with 1-click demo credential autofill.
- **Restaurant Registration (`/register`):** Multi-step onboarding form.
- **Password Reset (`/forgot-password`).**
- **SaaS Showcase Landing Page (`/`):** 1-click launch into either the Admin Console or Table 08 Customer Menu.

---

## 🛠️ Tech Architecture

```
src/
  app/
    core/
      models/       # Restaurant, Menu, Order, Table, Cart, User models
      services/     # AuthService, RestaurantService, MenuService, OrderService,
                    # TableService, CartService, PaymentService, ThemeService, ToastService
      mock/         # Realistic Maharashtrian restaurant dataset (Hotel Jagdamba)
    shared/
      components/   # Icon, Button, Badge, VegBadge, StatCard, Skeleton,
                    # EmptyState, QuantitySelector, Modal, Toast
      pipes/        # CurrencyInrPipe (₹), TimeAgoPipe
    features/
      landing/      # DineFlow SaaS showcase page
      auth/         # Login, Register, Forgot Password
      admin/        # Layout, Dashboard, Orders, Menu, Categories, Kitchen KDS, Tables, Settings
      customer/     # Layout, Menu, Dish Detail Sheet, Cart, Confirmation, Tracking, Payment
```

### Ready for Spring Boot REST API Integration
All services return RxJS Observables and maintain Angular Signals for reactive UI updates. When connecting to Spring Boot backend services, simply replace `of(MOCK_DATA)` with `this.http.get<T>(apiUrl)`.

---

## 💻 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
# or
ng serve
```
Open your browser at `http://localhost:4200`.

### 3. Build for Production
```bash
npm run build
# or
ng build
```
Builds optimized production assets to `dist/dine-flow` with lazy-loaded route chunks and zero warnings.
