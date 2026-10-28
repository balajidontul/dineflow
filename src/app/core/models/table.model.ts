export type TableStatus = 'available' | 'occupied' | 'ordering' | 'waiting_payment';

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  branchId: string;
  tableNumber: string; // e.g. "T01", "T08"
  token: string;       // Unique table token for QR, e.g. "abc123" or "t08-jagdamba"
  capacity: number;
  status: TableStatus;
  activeOrderId?: string;
  activeGuests?: number;
  lastActivity?: string;
  floor?: string;
  qrPayloadUrl: string; // e.g. "http://localhost:4200/r/hotel-jagdamba/t/t08"
}

