import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api-config';

interface LoginResponse {
  token: string;
  naam: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/Auth`;
  private token = signal<string | null>(localStorage.getItem('authToken'));
  readonly ingelogd = computed(() => this.token() !== null);

  login(email: string, wachtwoord: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, wachtwoord });
  }

  registreer(naam: string, email: string, wachtwoord: string) {
    return this.http.post(`${this.apiUrl}/registreer`, { naam, email, wachtwoord });
  }

  bewaarToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.token.set(token);
  }

  getToken(): string | null {
    return this.token();
  }

  isIngelogd(): boolean {
    return this.ingelogd();
  }

  uitloggen(): void {
    localStorage.removeItem('authToken');
    this.token.set(null);
  }
}
