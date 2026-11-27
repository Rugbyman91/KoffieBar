import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { testProviders } from '../testing/test-providers';
import { BestellingService } from '../services/bestelling';
import { Winkelmandje } from '../services/winkelmandje';
import { Categorie } from '../menu-options';
import { Mandje } from './mandje';

describe('Mandje', () => {
  let component: Mandje;
  let fixture: ComponentFixture<Mandje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mandje],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(Mandje);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Mandje bestelling plaatsen', () => {
  const bestelling = {
    id: 1,
    besteldOp: new Date().toISOString(),
    status: 'Geplaatst' as const,
    oorspronkelijkePrijs: 3,
    korting: 0,
    subTotaal: 3,
    afronding: 0,
    totaal: 3,
    bestelregels: [],
  };

  const bestellingServiceMock = {
    berekenBestelling: vi.fn(() => of(bestelling)),
    plaatsBestelling: vi.fn(() => of(bestelling)),
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [Mandje],
      providers: [
        ...testProviders,
        { provide: BestellingService, useValue: bestellingServiceMock },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('toont de succesmelding als toast na een geslaagde bestelling', async () => {
    const winkelmandje = TestBed.inject(Winkelmandje);
    winkelmandje.voegGebakToe(
      {
        id: 1,
        name: 'Croissant',
        description: '',
        allergies: '',
        price: 3,
        categorie: Categorie.Gebak,
        isEspresso: false,
      },
      1,
    );

    const fixture = TestBed.createComponent(Mandje);
    await fixture.whenStable();

    fixture.componentInstance.plaatsBestelling();
    await fixture.whenStable();

    expect(bestellingServiceMock.plaatsBestelling).toHaveBeenCalled();
    expect(winkelmandje.bestelregels()).toEqual([]);
    expect(winkelmandje.melding()).toBe('Je bestelling is succesvol geplaatst.');
  });
});
