import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { AuthService } from './services/auth.service';
import { signal, effect } from '@angular/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  template: `
    @if (showHeader()) {
      <app-header />
    }
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);

  showHeader = signal(false);

  constructor() {
    // Check on route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateHeaderVisibility(event.url);
      });

    // Initial check
    this.updateHeaderVisibility(this.router.url);
  }

  private updateHeaderVisibility(url: string): void {
    // Show header only if on admin route AND user is authenticated admin
    const isAdminRoute = url.includes('/admin');
    const isAdmin = this.authService.isAdmin();
    this.showHeader.set(isAdminRoute && isAdmin);
  }
}
