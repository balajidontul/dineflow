import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { MOCK_USER } from '../mock/mock-data';

export interface LoginPayload {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  restaurantName: string;
  ownerName: string;
  email: string;
  phone: string;
  password?: string;
  city: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _currentUser = signal<User | null>(MOCK_USER);
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isAuthenticated = signal<boolean>(true);

  login(payload: LoginPayload): Observable<User> {
    return of(MOCK_USER).pipe(
      delay(400),
      tap((user) => {
        this._currentUser.set(user);
        this.isAuthenticated.set(true);
      })
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    const newUser: User = {
      ...MOCK_USER,
      name: payload.ownerName,
      email: payload.email,
      phone: payload.phone,
    };
    return of(newUser).pipe(
      delay(500),
      tap((user) => {
        this._currentUser.set(user);
        this.isAuthenticated.set(true);
      })
    );
  }

  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return of({
      success: true,
      message: `Password reset instructions have been sent to ${email}`,
    }).pipe(delay(400));
  }

  logout(): void {
    this._currentUser.set(null);
    this.isAuthenticated.set(false);
  }
}

