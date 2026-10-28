import { Injectable, signal } from '@angular/core';
import { ThemeSettings } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _currentTheme = signal<ThemeSettings>({
    primaryColor: '#e05326',
    accentColor: '#d97706',
    surfaceColor: '#ffffff',
    darkSidebar: true,
  });

  public readonly currentTheme = this._currentTheme.asReadonly();

  applyTheme(theme: Partial<ThemeSettings>) {
    this._currentTheme.update((prev) => ({ ...prev, ...theme }));
    const root = document.documentElement;

    if (theme.primaryColor) {
      root.style.setProperty('--color-primary', theme.primaryColor);
      root.style.setProperty('--color-primary-hover', this.adjustBrightness(theme.primaryColor, -15));
      root.style.setProperty('--color-primary-light', this.hexToRgba(theme.primaryColor, 0.1));
      root.style.setProperty('--color-primary-muted', this.hexToRgba(theme.primaryColor, 0.15));
      root.style.setProperty('--color-primary-glow', this.hexToRgba(theme.primaryColor, 0.28));
      root.style.setProperty('--shadow-floating', `0 12px 36px 0 ${this.hexToRgba(theme.primaryColor, 0.25)}`);
    }

    if (theme.accentColor) {
      root.style.setProperty('--color-accent', theme.accentColor);
    }
  }

  private adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  private hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

