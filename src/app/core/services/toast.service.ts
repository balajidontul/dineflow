import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  public readonly toasts = this._toasts.asReadonly();

  show(toast: Omit<ToastMessage, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    };

    this._toasts.update((current) => [...current, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newToast.duration);
    }
  }

  success(message: string, title: string = 'Success') {
    this.show({ type: 'success', title, message });
  }

  error(message: string, title: string = 'Error') {
    this.show({ type: 'error', title, message, duration: 5000 });
  }

  warning(message: string, title: string = 'Notice') {
    this.show({ type: 'warning', title, message });
  }

  info(message: string, title: string = 'Information') {
    this.show({ type: 'info', title, message });
  }

  dismiss(id: string) {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }
}

