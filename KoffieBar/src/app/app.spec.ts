import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { testProviders } from './testing/test-providers';
import { AuthService } from './services/auth';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: testProviders,
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('KoffieBar');
  });

  describe('uitklapmenu', () => {
    afterEach(() => {
      localStorage.clear();
    });

    it('toont geen menuknop wanneer de gebruiker niet ingelogd is', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.menu-knop')).toBeNull();
    });

    it('opent en sluit het paneel met de menuknop', async () => {
      TestBed.inject(AuthService).bewaarToken('test-token');
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const element = fixture.nativeElement as HTMLElement;
      const menuKnop = element.querySelector<HTMLButtonElement>('.menu-knop')!;
      const paneel = () => element.querySelector('.buttons')!;

      expect(paneel().classList).not.toContain('open');
      expect(menuKnop.getAttribute('aria-expanded')).toBe('false');

      menuKnop.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.menuOpen()).toBe(true);
      expect(paneel().classList).toContain('open');
      expect(menuKnop.getAttribute('aria-expanded')).toBe('true');

      menuKnop.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.menuOpen()).toBe(false);
      expect(paneel().classList).not.toContain('open');
      expect(menuKnop.getAttribute('aria-expanded')).toBe('false');
    });
  });
});