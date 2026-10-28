import { Injectable, signal, computed } from '@angular/core';
import { MenuItem } from '../models/menu.model';
import { CartItem, CartSummary } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly _cartItems = signal<CartItem[]>([]);
  public readonly cartItems = this._cartItems.asReadonly();

  // Taxes and charges based on restaurant defaults
  private readonly taxRate = 0.05; // 5% GST
  private readonly serviceRate = 0.025; // 2.5% Service Charge

  public readonly totalItemCount = computed(() => {
    return this._cartItems().reduce((sum, item) => sum + item.quantity, 0);
  });

  public readonly itemTotal = computed(() => {
    return this._cartItems().reduce((sum, item) => {
      const price = item.menuItem.discountPrice ?? item.menuItem.price;
      return sum + price * item.quantity;
    }, 0);
  });

  public readonly taxAmount = computed(() => {
    return Math.round(this.itemTotal() * this.taxRate * 10) / 10;
  });

  public readonly serviceCharge = computed(() => {
    return Math.round(this.itemTotal() * this.serviceRate * 10) / 10;
  });

  public readonly grandTotal = computed(() => {
    return Math.round(this.itemTotal() + this.taxAmount() + this.serviceCharge());
  });

  public readonly cartSummary = computed<CartSummary>(() => {
    return {
      items: this._cartItems(),
      totalItemCount: this.totalItemCount(),
      itemTotal: this.itemTotal(),
      taxAmount: this.taxAmount(),
      serviceCharge: this.serviceCharge(),
      grandTotal: this.grandTotal(),
    };
  });

  constructor() {
    this.loadFromStorage();
  }

  getItemQuantity(menuItemId: string): number {
    const found = this._cartItems().find((ci) => ci.menuItem.id === menuItemId);
    return found ? found.quantity : 0;
  }

  addItem(menuItem: MenuItem, quantity: number = 1, specialInstructions: string = ''): void {
    if (quantity <= 0) return;

    this._cartItems.update((items) => {
      const existingIndex = items.findIndex((ci) => ci.menuItem.id === menuItem.id);
      if (existingIndex > -1) {
        const updated = [...items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          specialInstructions: specialInstructions || updated[existingIndex].specialInstructions,
        };
        return updated;
      } else {
        return [...items, { menuItem, quantity, specialInstructions }];
      }
    });

    this.saveToStorage();
  }

  updateQuantity(menuItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(menuItemId);
      return;
    }

    this._cartItems.update((items) =>
      items.map((ci) => (ci.menuItem.id === menuItemId ? { ...ci, quantity } : ci))
    );
    this.saveToStorage();
  }

  removeItem(menuItemId: string): void {
    this._cartItems.update((items) => items.filter((ci) => ci.menuItem.id !== menuItemId));
    this.saveToStorage();
  }

  setItemInstructions(menuItemId: string, specialInstructions: string): void {
    this._cartItems.update((items) =>
      items.map((ci) => (ci.menuItem.id === menuItemId ? { ...ci, specialInstructions } : ci))
    );
    this.saveToStorage();
  }

  clearCart(): void {
    this._cartItems.set([]);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('dineflow_cart', JSON.stringify(this._cartItems()));
    } catch {
      // Storage might not be accessible
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('dineflow_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this._cartItems.set(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }
}

