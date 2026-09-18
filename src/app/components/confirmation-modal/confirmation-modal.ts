import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        (click)="onCancel()"
        aria-hidden="true"
      ></div>

      <!-- Modal panel -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        <!-- Icon -->
        <div class="flex justify-center mb-5">
          <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <svg
              class="w-8 h-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h2 id="modal-title" class="text-xl font-bold text-gray-900 text-center mb-2">
          Confirm Submission
        </h2>
        <p class="text-gray-500 text-center text-sm mb-6">
          Please review your information before submitting. This action cannot be undone.
        </p>

        <!-- Summary -->
        <div class="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">Staff ID</span>
            <span class="font-semibold text-gray-900">{{ staffId() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Name</span>
            <span class="font-semibold text-gray-900">{{ name() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Transportation</span>
            <span class="font-semibold text-gray-900">{{ transportationType() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Bus Reservation</span>
            <span
              class="font-semibold"
              [class]="
                transportationType() === 'Bus' && hasBus() ? 'text-green-600' : 'text-gray-400'
              "
            >
              {{ transportationType() === 'Bus' && hasBus() ? 'Uploaded' : 'Not required' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Single Room</span>
            <span
              class="font-semibold"
              [class]="wantSingleRoom() ? 'text-green-600' : 'text-gray-400'"
            >
              {{ wantSingleRoom() ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">National ID</span>
            <span class="font-semibold text-green-600">{{ nationalIdLabel() }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            type="button"
            (click)="onCancel()"
            class="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Review Again
          </button>
          <button
            type="button"
            (click)="onConfirm()"
            class="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmationModalComponent {
  staffId = input.required<string>();
  name = input.required<string>();
  transportationType = input.required<string>();
  wantSingleRoom = input.required<boolean>();
  hasBus = input.required<boolean>();
  nationalIdLabel = input.required<string>();

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
