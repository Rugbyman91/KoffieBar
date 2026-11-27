import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Login } from './login';
import { testProviders } from '../testing/test-providers';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpMock: HttpTestingController;

  const knop = () =>
    fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
  const tekst = () => fixture.nativeElement.textContent as string;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('schakelt de knop uit tijdens de aanvraag en weer in na een fout', async () => {
    component.inloggen();
    await fixture.whenStable();

    expect(knop().disabled).toBe(true);
    expect(knop().textContent).toContain('Bezig...');

    httpMock
      .expectOne((req) => req.url.endsWith('/Auth/login'))
      .flush('', { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    expect(knop().disabled).toBe(false);
    expect(knop().textContent).toContain('Inloggen');
  });

  it('stuurt geen tweede aanvraag bij een dubbelklik', () => {
    component.inloggen();
    component.inloggen();

    httpMock.expectOne((req) => req.url.endsWith('/Auth/login')).flush({ token: 't' });
  });

  it('toont een melding bij een 401', async () => {
    component.inloggen();
    httpMock
      .expectOne((req) => req.url.endsWith('/Auth/login'))
      .flush('', { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    expect(tekst()).toContain('Ongeldig e-mailadres of wachtwoord.');
  });

  it('toont een melding wanneer de server niet bereikbaar is', async () => {
    component.inloggen();
    httpMock.expectOne((req) => req.url.endsWith('/Auth/login')).error(new ProgressEvent('error'));
    await fixture.whenStable();

    expect(tekst()).toContain('De server is niet bereikbaar.');
  });

  it('toont de status bij een andere fout', async () => {
    component.inloggen();
    httpMock
      .expectOne((req) => req.url.endsWith('/Auth/login'))
      .flush('', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(tekst()).toContain('Er ging iets mis (status 500).');
  });
});
