import { MenuItem } from './menu.model';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface CartSummary {
  items: CartItem[];
  totalItemCount: number;
  itemTotal: number;
  taxAmount: number;
  serviceCharge: number;
  grandTotal: number;
}

