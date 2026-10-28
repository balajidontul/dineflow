import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import * as QRCode from 'qrcode';
import { RestaurantTable, TableStatus } from '../models/table.model';
import { MOCK_TABLES } from '../mock/mock-data';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private readonly _tables = signal<RestaurantTable[]>(MOCK_TABLES);
  public readonly tables = this._tables.asReadonly();

  getTables(): Observable<RestaurantTable[]> {
    return of(this._tables()).pipe(delay(150));
  }

  getTableByToken(token: string): Observable<RestaurantTable | null> {
    const table = this._tables().find(
      (t) => t.token.toLowerCase() === token.toLowerCase() || t.tableNumber.toLowerCase() === token.toLowerCase()
    );
    return of(table || this._tables()[7]); // Defaults to T08 if not found for seamless demo
  }

  addTable(tableData: Omit<RestaurantTable, 'id' | 'restaurantId' | 'branchId' | 'qrPayloadUrl'>): Observable<RestaurantTable> {
    const id = `tbl-${Date.now()}`;
    const token = `tbl-${tableData.tableNumber.toLowerCase()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTable: RestaurantTable = {
      ...tableData,
      id,
      restaurantId: 'rest-jagdamba-01',
      branchId: 'branch-shivapur',
      token,
      qrPayloadUrl: `/r/hotel-jagdamba/t/${token}`,
    };
    this._tables.update((current) => [...current, newTable]);
    return of(newTable).pipe(delay(200));
  }

  updateTableStatus(tableId: string, status: TableStatus): Observable<boolean> {
    this._tables.update((tables) =>
      tables.map((t) => (t.id === tableId ? { ...t, status } : t))
    );
    return of(true).pipe(delay(100));
  }

  async generateQRCodeDataUrl(url: string, options?: QRCode.QRCodeToDataURLOptions): Promise<string> {
    try {
      return await QRCode.toDataURL(url, {
        width: 380,
        margin: 2,
        color: {
          dark: '#141211',
          light: '#FFFFFF',
        },
        ...options,
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
      return '';
    }
  }
}

