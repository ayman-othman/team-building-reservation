import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { ReservationResponse } from '../../types/reservation';
import { ReservationDetailComponent } from './reservation-detail/reservation-detail';

@Component({
  selector: 'app-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReservationDetailComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private subscriptions = new Subscription();

  // Expose Array for template usage
  Array = Array;

  // State
  reservations = signal<ReservationResponse[]>([]);
  filteredReservations = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.reservations();

    return this.reservations().filter(
      (r) => r.staffId.toLowerCase().includes(query) || r.id.toLowerCase().includes(query),
    );
  });

  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  selectedReservation = signal<ReservationResponse | null>(null);
  showDetail = signal(false);

  // Computed
  totalReservations = computed(() => this.reservations().length);
  filteredCount = computed(() => this.filteredReservations().length);

  ngOnInit(): void {
    this.loadReservations();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadReservations(): void {
    this.loading.set(true);
    this.error.set(null);

    const sub = this.adminService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load reservations');
        this.loading.set(false);
      },
    });

    this.subscriptions.add(sub);
  }

  onViewDetail(reservation: ReservationResponse): void {
    this.selectedReservation.set(reservation);
    this.showDetail.set(true);
  }

  onCloseDetail(): void {
    this.showDetail.set(false);
    this.selectedReservation.set(null);
  }

  onExportExcel(): void {
    const sub = this.adminService.exportToExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reservations.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error.set('Failed to export Excel: ' + (err.message || ''));
      },
    });

    this.subscriptions.add(sub);
  }

  onRefresh(): void {
    this.searchQuery.set('');
    this.loadReservations();
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getFileCount(urls: string[]): number {
    return Array.isArray(urls) ? urls.length : 0;
  }
}
