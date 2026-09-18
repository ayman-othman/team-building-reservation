import { Component, ChangeDetectionStrategy, inject, OnInit, NgZone } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { AuthService } from './services/auth.service';
import { signal, effect } from '@angular/core';
import { filter } from 'rxjs/operators';
import AOS from 'aos';

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
export class App implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  showHeader = signal(false);

  constructor() {
    // Check on route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateHeaderVisibility(event.url);
        // Reinitialize AOS on route change
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            AOS.refresh();
          }, 100);
        });
      });

    // Initial check
    this.updateHeaderVisibility(this.router.url);
  }

  ngOnInit(): void {
    // Initialize AOS with custom configuration
    this.ngZone.runOutsideAngular(() => {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: false,
        mirror: true,
        anchorPlacement: 'top-center',
        offset: 100,
      });
    });
  }

  private updateHeaderVisibility(url: string): void {
    // Show header only if on admin route AND user is authenticated admin
    const isAdminRoute = url.includes('/admin');
    const isAdmin = this.authService.isAdmin();
    this.showHeader.set(isAdminRoute && isAdmin);
  }
}}
