export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'counter_payment';
export type PaymentMethod = 'upi' | 'card' | 'wallet' | 'counter';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  localName?: string;
  price: number;
  quantity: number;
  veg: boolean;
  imageUrl?: string;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ORD-1042"
  restaurantId: string;
  branchId: string;
  tableId: string;
  tableNumber: string; // e.g. "T08"
  items: OrderItem[];
  itemTotal: number;
  taxAmount: number;
  serviceCharge: number;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  specialInstructions?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string; // ISO date string
  updatedAt: string;
  prepTimeMinutes: number;
  completedAt?: string;
}

