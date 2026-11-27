import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { testProviders } from '../testing/test-providers';
import { Registreer } from './registreer';

describe('Registreer', () => {
  let component: Registreer;
  let fixture: ComponentFixture<Registreer>;
  let httpMock: HttpTestingController;

  const knop = () =>
    fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registreer],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(Registreer);
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

  it('houdt de knop uitgeschakeld zolang het wachtwoord niet aan de regels voldoet', async () => {
    component.wachtwoord.set('kort');
    await fixture.whenStable();

    expect(knop().disabled).toBe(true);
  });

  it('schakelt de knop uit tijdens de aanvraag en weer in na een fout', async () => {
    component.wachtwoord.set('Test123!');
    await fixture.whenStable();
    expect(knop().disabled).toBe(false);

    component.registreer();
    await fixture.whenStable();

    expect(knop().disabled).toBe(true);
    expect(knop().textContent).toContain('Bezig...');

    httpMock
      .expectOne((req) => req.url.endsWith('/Auth/registreer'))
      .flush(['Fout'], { status: 400, statusText: 'Bad Request' });
    await fixture.whenStable();

    expect(knop().disabled).toBe(false);
    expect(knop().textContent).toContain('Registreren');
  });
});
