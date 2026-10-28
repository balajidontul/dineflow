import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton-item skeleton-shimmer"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="radius"
      [class]="customClass"
    ></div>
  `,
  styles: [
    `
      .skeleton-item {
        display: block;
        background: #eeeae4;
      }
    `,
  ],
})
export class SkeletonComponent {
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() radius: string = 'var(--radius-sm)';
  @Input() customClass: string = '';
}

