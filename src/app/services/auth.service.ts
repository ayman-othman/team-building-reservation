import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface User {
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly ADMIN_CREDENTIALS = {
    username: 'spoc',
    password: 'Test@1234',
  };

  isAuthenticated = signal(this.loadAuthState());
  currentUser = signal<User | null>(this.loadUserState());

  constructor() {}

  private loadAuthState(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('auth_token') !== null;
  }

  private loadUserState(): User | null {
    if (typeof localStorage === 'undefined') return null;
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }

  login(username: string, password: string): boolean {
    if (
      username === this.ADMIN_CREDENTIALS.username &&
      password === this.ADMIN_CREDENTIALS.password
    ) {
      const user: User = { username };
      localStorage.setItem('auth_token', 'admin-token-' + Date.now());
      localStorage.setItem('current_user', JSON.stringify(user));
      this.isAuthenticated.set(true);
      this.currentUser.set(user);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  isAdmin(): boolean {
    return (
      this.isAuthenticated() && this.currentUser()?.username === this.ADMIN_CREDENTIALS.username
    );
  }
}
