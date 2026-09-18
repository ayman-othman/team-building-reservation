import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/reservation-form/reservation-form').then(
        (m) => m.ReservationFormComponent,
      ),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminComponent),
  },
  { path: '**', redirectTo: '' },
];
