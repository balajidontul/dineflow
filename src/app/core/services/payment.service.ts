import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PaymentMethod, PaymentStatus } from '../models/order.model';

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  method: PaymentMethod;
  upiId?: string;
  cardDetails?: {
    cardNumber: string;
    cardHolder: string;
    expiry: string;
    cvv: string;
  };
  forceFailure?: boolean; // For testing failed payment screen
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  timestamp: string;
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  processPayment(req: PaymentRequest): Observable<PaymentResult> {
    const isSuccess = !req.forceFailure;
    const txId = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const result: PaymentResult = {
      success: isSuccess,
      transactionId: txId,
      orderId: req.orderId,
      amount: req.amount,
      method: req.method,
      timestamp: new Date().toISOString(),
      errorMessage: isSuccess
        ? undefined
        : 'Payment declined by bank server. Please check your account balance or try a different payment method.',
    };

    return of(result).pipe(delay(1200));
  }
}

