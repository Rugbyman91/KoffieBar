import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { vi } from 'vitest';
import { BestellingService } from '../services/bestelling';
import { Klantenportaal } from './klantenportaal';

describe('Klantenportaal', () => {
  let component: Klantenportaal;
  let fixture: ComponentFixture<Klantenportaal>;

  const bestellingServiceMock = {
    mijnBestellingen: vi.fn(),
    annuleerBestelling: vi.fn(),
  };

  const maakBestelling = () => ({
    id: 1,
    besteldOp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'Geplaatst' as 'Geplaatst' | 'Geannuleerd',
    totaal: 5.5,
    bestelregels: [
      {
        productNaam: 'Cappuccino',
        aantal: 2,
        grootteCode: 'Large',
        extras: ['Melk'],
        eenheidsprijs: 3,
        aantalMetKorting: 0,
        subtotaal: 5.5,
      },
    ],
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    bestellingServiceMock.mijnBestellingen.mockReturnValue(of([]));
    bestellingServiceMock.annuleerBestelling.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [Klantenportaal],
      providers: [
        {
          provide: BestellingService,
          useValue: bestellingServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Klantenportaal);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maakt de component aan', () => {
    expect(component).toBeTruthy();
  });

  describe('bestellingen ophalen', () => {
    it('werkt de UI bij na een asynchrone success-response', async () => {
      const bestelling = maakBestelling();
      const response = new Subject<typeof bestelling[]>();
      bestellingServiceMock.mijnBestellingen.mockReturnValue(response);

      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain(
        'Bestellingen laden...',
      );

      response.next([bestelling]);
      response.complete();
      await fixture.whenStable();

      const tekst = fixture.nativeElement.textContent;
      expect(bestellingServiceMock.mijnBestellingen).toHaveBeenCalled();
      expect(component.bestellingen()).toEqual([bestelling]);
      expect(component.laden()).toBe(false);
      expect(tekst).toContain('Bestellingscode #1');
      expect(tekst).toContain('Cappuccino');
      expect(tekst).toContain('Melk');
      expect(tekst).toContain('Geplaatst');
    });

    it('toont een melding wanneer er geen bestellingen zijn', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain(
        'Je hebt nog geen bestellingen geplaatst.',
      );
    });

    it('toont een sessiefout na een asynchrone 401-response', async () => {
      const response = new Subject<ReturnType<typeof maakBestelling>[]>();
      bestellingServiceMock.mijnBestellingen.mockReturnValue(response);

      fixture.detectChanges();
      response.error({ status: 401 });
      await fixture.whenStable();

      expect(component.laden()).toBe(false);
      expect(component.foutmelding()).toBe(
        'Je sessie is verlopen. Log opnieuw in.',
      );
      expect(fixture.nativeElement.textContent).toContain(
        'Je sessie is verlopen. Log opnieuw in.',
      );
      expect(fixture.nativeElement.textContent).not.toContain(
        'Bestellingen laden...',
      );
    });

    it('toont een algemene fout na een asynchrone serverfout', async () => {
      const response = new Subject<ReturnType<typeof maakBestelling>[]>();
      bestellingServiceMock.mijnBestellingen.mockReturnValue(response);

      fixture.detectChanges();
      response.error({ status: 500 });
      await fixture.whenStable();

      expect(component.laden()).toBe(false);
      expect(component.foutmelding()).toBe(
        'Je bestellingen konden niet worden opgehaald.',
      );
      expect(fixture.nativeElement.textContent).toContain(
        'Je bestellingen konden niet worden opgehaald.',
      );
    });
  });

  describe('annuleerbaarheid', () => {
    it('laat een geplaatste bestelling binnen 30 minuten annuleren', () => {
      expect(component.kanAnnuleren(maakBestelling())).toBe(true);
    });

    it('laat een bestelling na 30 minuten niet meer annuleren', () => {
      const bestelling = {
        ...maakBestelling(),
        besteldOp: new Date(Date.now() - 31 * 60 * 1000).toISOString(),
      };

      expect(component.kanAnnuleren(bestelling)).toBe(false);
    });

    it('laat een bestelling exact 30 minuten na plaatsing niet meer annuleren', () => {
      const bestelling = {
        ...maakBestelling(),
        besteldOp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      };

      expect(component.kanAnnuleren(bestelling)).toBe(false);
    });

    it('laat een geannuleerde bestelling niet opnieuw annuleren', () => {
      const bestelling = {
        ...maakBestelling(),
        status: 'Geannuleerd' as const,
      };

      expect(component.kanAnnuleren(bestelling)).toBe(false);
    });
  });

  describe('bestelling annuleren', () => {
    it('werkt de UI bij na een success-response', async () => {
      const bestelling = maakBestelling();
      const response = new Subject<void>();
      bestellingServiceMock.mijnBestellingen.mockReturnValue(of([bestelling]));
      bestellingServiceMock.annuleerBestelling.mockReturnValue(response);
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      fixture.detectChanges();
      await fixture.whenStable();
      component.annuleerBestelling(bestelling);

      expect(bestellingServiceMock.annuleerBestelling).toHaveBeenCalledWith(1);
      response.next();
      response.complete();
      await fixture.whenStable();

      expect(component.bestellingen()[0].status).toBe('Geannuleerd');
      expect(fixture.nativeElement.textContent).toContain('Geannuleerd');
      expect(fixture.nativeElement.querySelector('.annuleer-knop')).toBeNull();
    });

    it('annuleert niet wanneer de gebruiker de bevestiging afbreekt', async () => {
      const bestelling = maakBestelling();
      bestellingServiceMock.mijnBestellingen.mockReturnValue(of([bestelling]));
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      fixture.detectChanges();
      await fixture.whenStable();
      component.annuleerBestelling(bestelling);

      expect(window.confirm).toHaveBeenCalledWith(
        'Ben je zeker dat je bestelling #1 wilt annuleren?',
      );
      expect(
        bestellingServiceMock.annuleerBestelling,
      ).not.toHaveBeenCalled();
      expect(component.bestellingen()[0].status).toBe('Geplaatst');
    });

    it('toont een specifieke fout na een asynchrone 400-response', async () => {
      const bestelling = maakBestelling();
      const response = new Subject<void>();
      bestellingServiceMock.mijnBestellingen.mockReturnValue(of([bestelling]));
      bestellingServiceMock.annuleerBestelling.mockReturnValue(response);
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      fixture.detectChanges();
      await fixture.whenStable();
      component.annuleerBestelling(bestelling);
      response.error({ status: 400 });
      await fixture.whenStable();

      expect(component.annuleerFoutmelding()).toBe(
        'Deze bestelling kan niet meer geannuleerd worden.',
      );
      expect(fixture.nativeElement.textContent).toContain(
        'Deze bestelling kan niet meer geannuleerd worden.',
      );
      expect(component.bestellingen()[0].status).toBe('Geplaatst');
      expect(fixture.nativeElement.textContent).toContain('Bestellingscode #1');
    });

    it('toont een algemene fout na een asynchrone serverfout', async () => {
      const bestelling = maakBestelling();
      const response = new Subject<void>();
      bestellingServiceMock.mijnBestellingen.mockReturnValue(of([bestelling]));
      bestellingServiceMock.annuleerBestelling.mockReturnValue(response);
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      fixture.detectChanges();
      await fixture.whenStable();
      component.annuleerBestelling(bestelling);
      response.error({ status: 500 });
      await fixture.whenStable();

      expect(component.annuleerFoutmelding()).toBe(
        'Er ging iets mis bij het annuleren van je bestelling.',
      );
      expect(fixture.nativeElement.textContent).toContain(
        'Er ging iets mis bij het annuleren van je bestelling.',
      );
      expect(fixture.nativeElement.textContent).toContain('Bestellingscode #1');
    });
  });
});
