import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Winkelmandje } from './winkelmandje';
import { MenuOptions, ExtraOption, KoffieGrootte } from '../menu-options';

function maakProduct(id: number, name: string, price = 2): MenuOptions {
  return { id, name, description: '', allergies: 'geen', price } as MenuOptions;
}

function maakGrootte(code: string, label: string): KoffieGrootte {
  return { code, label } as KoffieGrootte;
}

function maakExtra(id: number, name: string, price = 0.5): ExtraOption {
  return { id, name, price } as ExtraOption;
}

describe('Winkelmandje', () => {
  let mandje: Winkelmandje;

  const croissant = maakProduct(5, 'Croissant', 1.75);
  const kaneelkoek = maakProduct(7, 'Kaneelkoek', 2.25);
  const cappuccino = maakProduct(3, 'Cappuccino', 3);
  const small = maakGrootte('small', 'Small');
  const large = maakGrootte('large', 'Large');
  const melk = maakExtra(2, 'Melk');
  const suiker = maakExtra(3, 'Suiker');

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    mandje = TestBed.inject(Winkelmandje);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is leeg bij het begin', () => {
    expect(mandje.bestelregels()).toEqual([]);
    expect(mandje.aantalStuks()).toBe(0);
  });

  describe('gebak', () => {
    it('voegt een nieuwe regel toe', () => {
      mandje.voegGebakToe(croissant, 2);

      expect(mandje.bestelregels()).toEqual([
        { type: 'gebak', product: croissant, aantal: 2 },
      ]);
    });

    it('telt het aantal op bij hetzelfde gebak', () => {
      mandje.voegGebakToe(croissant, 2);
      mandje.voegGebakToe(croissant, 3);

      const regels = mandje.bestelregels();
      expect(regels).toHaveLength(1);
      expect(regels[0].aantal).toBe(5);
    });

    it('maakt aparte regels voor verschillend gebak', () => {
      mandje.voegGebakToe(croissant, 1);
      mandje.voegGebakToe(kaneelkoek, 1);

      expect(mandje.bestelregels()).toHaveLength(2);
    });

    it.each([0, -1, 1.5])('negeert het ongeldige aantal %s', (aantal) => {
      mandje.voegGebakToe(croissant, aantal);

      expect(mandje.bestelregels()).toEqual([]);
      expect(mandje.melding()).toBeNull();
    });
  });

  describe('koffie', () => {
    it('voegt een koffie toe met aantal 1', () => {
      mandje.voegKoffieToe(cappuccino, large, [melk]);

      expect(mandje.bestelregels()).toEqual([
        { type: 'koffie', product: cappuccino, grootte: large, extras: [melk], aantal: 1 },
      ]);
    });

    it('voegt identieke koffies samen, ook als de extras in een andere volgorde staan', () => {
      mandje.voegKoffieToe(cappuccino, large, [melk, suiker]);
      mandje.voegKoffieToe(cappuccino, large, [suiker, melk]);

      const regels = mandje.bestelregels();
      expect(regels).toHaveLength(1);
      expect(regels[0].aantal).toBe(2);
    });

    it('houdt een ander formaat apart', () => {
      mandje.voegKoffieToe(cappuccino, small, []);
      mandje.voegKoffieToe(cappuccino, large, []);

      expect(mandje.bestelregels()).toHaveLength(2);
    });

    it('houdt andere extras apart', () => {
      mandje.voegKoffieToe(cappuccino, small, []);
      mandje.voegKoffieToe(cappuccino, small, [melk]);

      expect(mandje.bestelregels()).toHaveLength(2);
    });

    it('bewaart een kopie van de extras', () => {
      const extras = [melk];
      mandje.voegKoffieToe(cappuccino, small, extras);
      extras.push(suiker);

      expect(mandje.bestelregels()[0]).toMatchObject({ extras: [melk] });
    });
  });

  it('telt stuks en geen regels', () => {
    mandje.voegGebakToe(croissant, 3);
    mandje.voegKoffieToe(cappuccino, large, []);
    mandje.voegKoffieToe(cappuccino, large, []);

    expect(mandje.bestelregels()).toHaveLength(2);
    expect(mandje.aantalStuks()).toBe(5);
  });

  describe('verwijderen', () => {
    it('verwijdert de regel met de opgegeven index', () => {
      mandje.voegGebakToe(croissant, 1);
      mandje.voegGebakToe(kaneelkoek, 1);

      mandje.verwijderRegel(0);

      expect(mandje.bestelregels()).toEqual([
        { type: 'gebak', product: kaneelkoek, aantal: 1 },
      ]);
    });

    it('laat het mandje ongewijzigd bij een index die niet bestaat', () => {
      mandje.voegGebakToe(croissant, 1);

      mandje.verwijderRegel(5);

      expect(mandje.bestelregels()).toHaveLength(1);
    });

    it('maakt het mandje leeg', () => {
      mandje.voegGebakToe(croissant, 1);
      mandje.voegKoffieToe(cappuccino, large, []);

      mandje.leegmaken();

      expect(mandje.bestelregels()).toEqual([]);
      expect(mandje.aantalStuks()).toBe(0);
    });
  });

  describe('melding', () => {
    it('toont een melding bij gebak', () => {
      mandje.voegGebakToe(croissant, 2);

      expect(mandje.melding()).toBe('2 × Croissant toegevoegd aan je winkelmand');
    });

    it('toont een melding bij koffie, met het formaat', () => {
      mandje.voegKoffieToe(cappuccino, large, []);

      expect(mandje.melding()).toBe('Cappuccino (Large) toegevoegd aan je winkelmand');
    });

    it('verdwijnt na 3 seconden', () => {
      mandje.voegGebakToe(croissant, 1);

      vi.advanceTimersByTime(2999);
      expect(mandje.melding()).not.toBeNull();

      vi.advanceTimersByTime(1);
      expect(mandje.melding()).toBeNull();
    });

    it('start de teller opnieuw bij een tweede toevoeging', () => {
      mandje.voegGebakToe(croissant, 1);
      vi.advanceTimersByTime(2000);
      mandje.voegGebakToe(kaneelkoek, 1);

      vi.advanceTimersByTime(2000);
      expect(mandje.melding()).toBe('1 × Kaneelkoek toegevoegd aan je winkelmand');

      vi.advanceTimersByTime(1000);
      expect(mandje.melding()).toBeNull();
    });
  });
});