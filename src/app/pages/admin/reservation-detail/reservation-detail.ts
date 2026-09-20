import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationResponse } from '../../../types/reservation';

@Component({
  selector: 'app-reservation-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './reservation-detail.html',
  styleUrl: './reservation-detail.css',
})
export class ReservationDetailComponent {
  reservation = input.required<ReservationResponse>();
  close = output<void>();

  // Expose Array for template usage
  Array = Array;

  previewUrl = computed(() => {
    const urls = this.reservation().nationalIdUrls;
    return Array.isArray(urls) && urls.length > 0 ? urls[0] : null;
  });

  onClose(): void {
    this.close.emit();
  }

  onOpenFile(url: string): void {
    window.open(url, '_blank');
  }

  onDownloadFile(url: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservation-${this.reservation().id}-${Date.now()}`;
    link.click();
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  isPdfUrl(url: string): boolean {
    return /\.pdf$/i.test(url);
  }

  getFileExtension(url: string): string {
    const match = url.match(/\.([^./?#]+)(?:[?#]|$)/i);
    return match ? match[1].toUpperCase() : 'FILE';
  }
}
