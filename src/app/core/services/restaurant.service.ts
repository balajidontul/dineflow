import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Restaurant, Branch } from '../models/restaurant.model';
import { MOCK_RESTAURANT, MOCK_BRANCHES } from '../mock/mock-data';

export interface DashboardAnalytics {
  todayRevenue: number;
  revenueChangePercentage: number;
  todayOrdersCount: number;
  ordersChangePercentage: number;
  activeTablesCount: number;
  totalTablesCount: number;
  averageOrderValue: number;
  aovChangePercentage: number;
  revenueHistory7Days: { day: string; revenue: number; orders: number }[];
  hourlyOrders: { hour: string; count: number }[];
  popularDishes: {
    dishId: string;
    dishName: string;
    localName?: string;
    imageUrl: string;
    quantitySold: number;
    revenue: number;
    veg: boolean;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private readonly _restaurant = signal<Restaurant>(MOCK_RESTAURANT);
  private readonly _branches = signal<Branch[]>(MOCK_BRANCHES);
  private readonly _selectedBranchId = signal<string>(MOCK_BRANCHES[0].id);

  public readonly restaurant = this._restaurant.asReadonly();
  public readonly branches = this._branches.asReadonly();
  public readonly selectedBranchId = this._selectedBranchId.asReadonly();

  public readonly selectedBranch = computed(() => {
    return this._branches().find((b) => b.id === this._selectedBranchId()) || this._branches()[0];
  });

  selectBranch(branchId: string): void {
    this._selectedBranchId.set(branchId);
  }

  getRestaurant(): Observable<Restaurant> {
    return of(this._restaurant()).pipe(delay(200));
  }

  getRestaurantBySlug(slug: string): Observable<Restaurant | null> {
    const res = this._restaurant();
    if (res.slug === slug || slug === 'hotel-jagdamba') {
      return of(res).pipe(delay(150));
    }
    return of(res);
  }

  updateRestaurant(updates: Partial<Restaurant>): Observable<Restaurant> {
    const updated: Restaurant = {
      ...this._restaurant(),
      ...updates,
    };
    this._restaurant.set(updated);
    return of(updated).pipe(delay(300));
  }

  getAnalytics(): Observable<DashboardAnalytics> {
    const analytics: DashboardAnalytics = {
      todayRevenue: 48650,
      revenueChangePercentage: +14.2,
      todayOrdersCount: 42,
      ordersChangePercentage: +8.5,
      activeTablesCount: 7,
      totalTablesCount: 12,
      averageOrderValue: 1158,
      aovChangePercentage: +5.3,
      revenueHistory7Days: [
        { day: 'Wed', revenue: 38200, orders: 34 },
        { day: 'Thu', revenue: 41500, orders: 36 },
        { day: 'Fri', revenue: 52400, orders: 48 },
        { day: 'Sat', revenue: 76800, orders: 69 },
        { day: 'Sun', revenue: 84300, orders: 78 },
        { day: 'Mon', revenue: 39100, orders: 35 },
        { day: 'Today', revenue: 48650, orders: 42 },
      ],
      hourlyOrders: [
        { hour: '12 PM', count: 6 },
        { hour: '1 PM', count: 12 },
        { hour: '2 PM', count: 9 },
        { hour: '3 PM', count: 4 },
        { hour: '7 PM', count: 8 },
        { hour: '8 PM', count: 14 },
        { hour: '9 PM', count: 18 },
        { hour: '10 PM', count: 11 },
      ],
      popularDishes: [
        {
          dishId: 'item-mutton-thali',
          dishName: 'Mutton Special Thali',
          localName: 'मटण स्पेशल थाळी',
          imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&auto=format&fit=crop&q=80',
          quantitySold: 28,
          revenue: 12600,
          veg: false,
        },
        {
          dishId: 'item-chicken-thali',
          dishName: 'Gavran Chicken Thali',
          localName: 'गावरान चिकन थाळी',
          imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
          quantitySold: 22,
          revenue: 8360,
          veg: false,
        },
        {
          dishId: 'item-mutton-sukka',
          dishName: 'Mutton Sukka (Dry Fry)',
          localName: 'मटण सुक्का',
          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
          quantitySold: 19,
          revenue: 7980,
          veg: false,
        },
        {
          dishId: 'item-solkadhi',
          dishName: 'Authentic Kokum Solkadhi',
          localName: 'सोलकढी',
          imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80',
          quantitySold: 46,
          revenue: 4140,
          veg: true,
        },
        {
          dishId: 'item-chicken-biryani',
          dishName: 'Dum Chicken Biryani',
          localName: 'दम चिकन बिर्याणी',
          imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
          quantitySold: 14,
          revenue: 4480,
          veg: false,
        },
      ],
    };
    return of(analytics).pipe(delay(250));
  }
}

