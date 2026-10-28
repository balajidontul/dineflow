import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyInr',
  standalone: true,
})
export class CurrencyInrPipe implements PipeTransform {
  transform(value: number | string | null | undefined, hideSymbol = false): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return hideSymbol ? '0' : '₹0';
    }

    const num = Number(value);
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(num);

    return hideSymbol ? formatted : `₹${formatted}`;
  }
}

