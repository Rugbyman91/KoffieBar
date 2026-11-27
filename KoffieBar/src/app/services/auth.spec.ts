import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { AuthService } from './auth';
import { API_BASE_URL } from '../api-config';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const apiUrl = `${API_BASE_URL}/Auth`;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('start als niet ingelogd', () => {
    expect(service.ingelogd()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('stuurt de juiste gegevens naar de login endpoint', () => {
    service.login('test@test.be', 'Test123!').subscribe();

    const request = httpMock.expectOne(`${apiUrl}/login`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'test@test.be',
      wachtwoord: 'Test123!'
    });

    request.flush({
      token: 'test-token',
      naam: 'Test',
      email: 'test@test.be'
    });
  });

  it('stuurt de juiste gegevens naar de registratie endpoint', () => {
    service.registreer('Test', 'test@test.be', 'Test123!').subscribe();

    const request = httpMock.expectOne(`${apiUrl}/registreer`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      naam: 'Test',
      email: 'test@test.be',
      wachtwoord: 'Test123!'
    });

    request.flush({
      id: 'test-id',
      naam: 'Test',
      email: 'test@test.be'
    });
  });

  it('bewaart het token in localStorage en de signal', () => {
    service.bewaarToken('test-token');

    expect(localStorage.getItem('authToken')).toBe('test-token');
    expect(service.getToken()).toBe('test-token');
    expect(service.ingelogd()).toBe(true);
    expect(service.isIngelogd()).toBe(true);
  });

  it('logt de gebruiker uit en verwijdert het token', () => {
    service.bewaarToken('test-token');

    service.uitloggen();

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.ingelogd()).toBe(false);
  });

  it('herkent een eerder opgeslagen token bij initialisatie', () => {
    localStorage.setItem('authToken', 'bewaard-token');

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    const nieuweService = TestBed.inject(AuthService);

    expect(nieuweService.getToken()).toBe('bewaard-token');
    expect(nieuweService.ingelogd()).toBe(true);
  });
});