import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { MenuCategory, MenuItem } from '../models/menu.model';
import { MOCK_CATEGORIES, MOCK_MENU_ITEMS } from '../mock/mock-data';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly _categories = signal<MenuCategory[]>(MOCK_CATEGORIES);
  private readonly _menuItems = signal<MenuItem[]>(MOCK_MENU_ITEMS);

  public readonly categories = this._categories.asReadonly();
  public readonly menuItems = this._menuItems.asReadonly();

  // Active categories for customer menu
  public readonly activeCategories = computed(() => {
    return this._categories()
      .filter((c) => c.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  });

  // Active & available items for customer menu
  public readonly customerItems = computed(() => {
    return this._menuItems().filter((item) => item.available);
  });

  getCategories(): Observable<MenuCategory[]> {
    return of(this._categories()).pipe(delay(150));
  }

  getMenuItems(): Observable<MenuItem[]> {
    return of(this._menuItems()).pipe(delay(200));
  }

  getItemById(id: string): MenuItem | undefined {
    return this._menuItems().find((item) => item.id === id);
  }

  addCategory(categoryData: Omit<MenuCategory, 'id' | 'restaurantId' | 'itemCount'>): Observable<MenuCategory> {
    const newCategory: MenuCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      restaurantId: 'rest-jagdamba-01',
      itemCount: 0,
      displayOrder: this._categories().length + 1,
    };
    this._categories.update((cats) => [...cats, newCategory]);
    return of(newCategory).pipe(delay(200));
  }

  updateCategory(id: string, updates: Partial<MenuCategory>): Observable<MenuCategory> {
    let updatedCat!: MenuCategory;
    this._categories.update((cats) =>
      cats.map((c) => {
        if (c.id === id) {
          updatedCat = { ...c, ...updates };
          return updatedCat;
        }
        return c;
      })
    );
    return of(updatedCat).pipe(delay(150));
  }

  deleteCategory(id: string): Observable<boolean> {
    this._categories.update((cats) => cats.filter((c) => c.id !== id));
    return of(true).pipe(delay(150));
  }

  reorderCategories(reorderedList: MenuCategory[]): Observable<boolean> {
    const updated = reorderedList.map((cat, index) => ({
      ...cat,
      displayOrder: index + 1,
    }));
    this._categories.set(updated);
    return of(true).pipe(delay(100));
  }

  addMenuItem(itemData: Omit<MenuItem, 'id' | 'restaurantId'>): Observable<MenuItem> {
    const newItem: MenuItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      restaurantId: 'rest-jagdamba-01',
    };
    this._menuItems.update((items) => [newItem, ...items]);
    this.updateCategoryItemCounts();
    return of(newItem).pipe(delay(250));
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): Observable<MenuItem> {
    let updatedItem!: MenuItem;
    this._menuItems.update((items) =>
      items.map((it) => {
        if (it.id === id) {
          updatedItem = { ...it, ...updates };
          return updatedItem;
        }
        return it;
      })
    );
    this.updateCategoryItemCounts();
    return of(updatedItem).pipe(delay(200));
  }

  deleteMenuItem(id: string): Observable<boolean> {
    this._menuItems.update((items) => items.filter((it) => it.id !== id));
    this.updateCategoryItemCounts();
    return of(true).pipe(delay(150));
  }

  toggleItemAvailability(id: string): Observable<boolean> {
    let newState = false;
    this._menuItems.update((items) =>
      items.map((it) => {
        if (it.id === id) {
          newState = !it.available;
          return { ...it, available: newState };
        }
        return it;
      })
    );
    return of(newState).pipe(delay(100));
  }

  private updateCategoryItemCounts(): void {
    const items = this._menuItems();
    this._categories.update((cats) =>
      cats.map((cat) => ({
        ...cat,
        itemCount: items.filter((it) => it.categoryId === cat.id).length,
      }))
    );
  }
}

