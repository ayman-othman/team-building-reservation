import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4"
    >
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <!-- Logo Section -->
          <div class="flex justify-center mb-8">
            <div
              class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 shadow-lg shadow-red-200"
            >
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 mb-2 text-center">Team Building</h1>
          <p class="text-sm text-gray-600 text-center mb-8">Admin Portal</p>

          <!-- Error Message -->
          @if (error()) {
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p class="text-sm text-red-700">{{ error() }}</p>
            </div>
          }

          <!-- Form -->
          <form (ngSubmit)="login()" class="space-y-4">
            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                [(ngModel)]="username"
                name="username"
                placeholder="Enter username"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
              />
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter password"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
              />
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full py-2 rounded-lg bg-red-600 text-white font-semibold shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              @if (isLoading()) {
                <span class="inline-flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Logging in…
                </span>
              } @else {
                Login
              }
            </button>
          </form>

          <!-- Demo Credentials -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <p class="text-xs text-gray-500 font-medium mb-3">Demo Credentials:</p>
            <div class="space-y-2 text-xs text-gray-600">
              <div class="flex justify-between items-center">
                <span>Username:</span>
                <code class="bg-gray-100 px-2 py-1 rounded text-gray-800">spoc</code>
              </div>
              <div class="flex justify-between items-center">
                <span>Password:</span>
                <code class="bg-gray-100 px-2 py-1 rounded text-gray-800">Test@1234</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  isLoading = signal(false);
  error = signal<string | null>(null);

  login(): void {
    this.error.set(null);
    if (!this.username || !this.password) {
      this.error.set('Please enter both username and password');
      return;
    }

    this.isLoading.set(true);
    setTimeout(() => {
      const success = this.authService.login(this.username, this.password);
      this.isLoading.set(false);

      if (success) {
        this.router.navigate(['/admin']);
      } else {
        this.error.set('Invalid username or password');
        this.password = '';
      }
    }, 500);
  }
}
