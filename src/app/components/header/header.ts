import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <!-- Logo/Brand -->
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow"
          >
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">Team Building</h1>
            <p class="text-xs text-gray-500">Reservation System</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="flex items-center gap-2">
          <a
            routerLink="/"
            routerLinkActive="bg-blue-50"
            [routerLinkActiveOptions]="{ exact: true }"
            class="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Go to reservation form"
          >
            <svg class="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Form
          </a>

          <a
            routerLink="/admin"
            routerLinkActive="bg-blue-50"
            class="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Go to admin dashboard"
          >
            <svg class="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Admin
          </a>
        </div>
      </nav>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      a.bg-blue-50 {
        @apply text-blue-700;
      }
    `,
  ],
})
export class HeaderComponent {}
