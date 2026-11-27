import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  function maakToken(verlooptOver: number): string {
    const payload = btoa(
      JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + verlooptOver,
      }),
    );

    return `header.${payload}.signature`;
  }

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('stuurt geen Authorization header zonder token', () => {
    http.get('/api/test').subscribe();

    const request = httpMock.expectOne('/api/test');

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({});
  });

  it('voegt een geldig token toe aan de Authorization header', () => {
    const token = maakToken(3600);
    localStorage.setItem('authToken', token);

    http.get('/api/test').subscribe();

    const request = httpMock.expectOne('/api/test');

    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

    request.flush({});
  });

  it('verwijdert een verlopen token en stuurt door naar login', () => {
    localStorage.setItem('authToken', maakToken(-3600));

    http.get('/api/test').subscribe();

    const request = httpMock.expectOne('/api/test');

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(TestBed.inject(AuthService).ingelogd()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({});
  });

  it('verwijdert een ongeldig token', () => {
    localStorage.setItem('authToken', 'ongeldig-token');

    http.get('/api/test').subscribe();

    const request = httpMock.expectOne('/api/test');

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({});
  });

  it('verwijdert het token en stuurt door bij een 401 response', () => {
    localStorage.setItem('authToken', maakToken(3600));

    http.get('/api/test').subscribe({
      error: () => {},
    });

    const request = httpMock.expectOne('/api/test');

    request.flush(
      {},
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(TestBed.inject(AuthService).ingelogd()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('leest het token via AuthService', () => {
    const token = maakToken(3600);
    TestBed.inject(AuthService).bewaarToken(token);
    localStorage.removeItem('authToken');

    http.get('/api/test').subscribe();

    const request = httpMock.expectOne('/api/test');

    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

    request.flush({});
  });

  it('verwijdert het token niet bij een andere HTTP-fout', () => {
    const token = maakToken(3600);
    localStorage.setItem('authToken', token);

    http.get('/api/test').subscribe({
      error: () => {},
    });

    const request = httpMock.expectOne('/api/test');

    request.flush(
      {},
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(localStorage.getItem('authToken')).toBe(token);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
