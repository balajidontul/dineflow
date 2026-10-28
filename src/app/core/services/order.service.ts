import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Order, OrderStatus } from '../models/order.model';
import { MOCK_ORDERS } from '../mock/mock-data';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly _orders = signal<Order[]>(MOCK_ORDERS);
  private readonly _hasNewOrderAlert = signal<boolean>(false);
  private readonly _lastPlacedOrder = signal<Order | null>(null);

  public readonly orders = this._orders.asReadonly();
  public readonly hasNewOrderAlert = this._hasNewOrderAlert.asReadonly();
  public readonly lastPlacedOrder = this._lastPlacedOrder.asReadonly();

  // Active Live Orders for Orders Board & KDS
  public readonly liveOrders = computed(() => {
    return this._orders()
      .filter((o) => ['placed', 'accepted', 'preparing', 'ready', 'served'].includes(o.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // Specific counts by status
  public readonly countsByStatus = computed(() => {
    const list = this._orders();
    return {
      all: list.length,
      placed: list.filter((o) => o.status === 'placed').length,
      accepted: list.filter((o) => o.status === 'accepted').length,
      preparing: list.filter((o) => o.status === 'preparing').length,
      ready: list.filter((o) => o.status === 'ready').length,
      served: list.filter((o) => o.status === 'served').length,
      completed: list.filter((o) => o.status === 'completed').length,
      cancelled: list.filter((o) => o.status === 'cancelled').length,
    };
  });

  constructor(private toastService: ToastService) {}

  getOrders(): Observable<Order[]> {
    return of(this._orders()).pipe(delay(200));
  }

  getOrderById(id: string): Observable<Order | null> {
    const order = this._orders().find((o) => o.id === id || o.orderNumber === id);
    return of(order || this._orders()[0]).pipe(delay(150));
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Observable<Order> {
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this._orders.update((list) => [newOrder, ...list]);
    this._lastPlacedOrder.set(newOrder);
    this._hasNewOrderAlert.set(true);

    this.playNotificationSound();
    this.toastService.info(
      `New order ${newOrder.orderNumber} placed for Table ${newOrder.tableNumber}! Total: ₹${newOrder.grandTotal}`,
      '🔔 Incoming Order'
    );

    return of(newOrder).pipe(delay(300));
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    let updatedOrder!: Order;
    this._orders.update((orders) =>
      orders.map((o) => {
        if (o.id === orderId) {
          updatedOrder = {
            ...o,
            status,
            updatedAt: new Date().toISOString(),
            completedAt: status === 'completed' ? new Date().toISOString() : o.completedAt,
          };
          return updatedOrder;
        }
        return o;
      })
    );

    this.toastService.success(
      `Order ${updatedOrder.orderNumber} status changed to ${status.toUpperCase()}`,
      'Order Updated'
    );

    return of(updatedOrder).pipe(delay(150));
  }

  clearNewOrderAlert(): void {
    this._hasNewOrderAlert.set(false);
  }

  private playNotificationSound(): void {
    try {
      // Use Web Audio API for a pleasant luxury hotel chime
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Audio autoplay might be blocked before user interaction; ignore safely
    }
  }
}

