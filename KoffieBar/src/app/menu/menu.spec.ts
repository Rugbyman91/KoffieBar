import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { MenuData } from '../menu-options';
import { MenuService } from '../services/menu';
import { testProviders } from '../testing/test-providers';
import { Menu } from './menu';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let menuResponse: Subject<MenuData>;

  const menuData: MenuData = {
    coffees: [],
    pastries: [],
    extras: [],
    coffeeSizes: [],
    espressoSizes: [],
  };

  const menuServiceMock = {
    getMenu: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    menuResponse = new Subject<MenuData>();
    menuServiceMock.getMenu.mockReturnValue(menuResponse);

    await TestBed.configureTestingModule({
      imports: [Menu],
      providers: [...testProviders, { provide: MenuService, useValue: menuServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates the UI after the menu response', async () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Menu laden...');

    menuResponse.next(menuData);
    menuResponse.complete();
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Koffie');
    expect(text).toContain('Gebak');
    expect(text).not.toContain('Menu laden...');
  });

  it('shows an error after a failed menu response', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fixture.detectChanges();

    menuResponse.error({ status: 500 });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Het menu kon niet worden opgehaald.');
    expect(fixture.nativeElement.textContent).not.toContain('Menu laden...');
  });
});
