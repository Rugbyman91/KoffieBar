import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItem } from './menu-item';
import { Categorie, KoffieGrootte, MenuOptions } from '../../menu-options';

describe('MenuItem', () => {
  let component: MenuItem;
  let fixture: ComponentFixture<MenuItem>;

  const testItem: MenuOptions = {
    id: 3,
    name: 'Cappuccino',
    description: 'Espresso met warme melk en een dikke schuimlaag',
    allergies: 'melk',
    price: 3,
    categorie: Categorie.Koffie,
    isEspresso: false,
  };

  const gewoneFormaten: KoffieGrootte[] = [
    { code: 'small', label: 'Small', factor: 1 },
    { code: 'large', label: 'Large', factor: 1.5 },
  ];

  const espressoFormaten: KoffieGrootte[] = [
    { code: 'enkel', label: 'Enkel', factor: 1 },
    { code: 'dubbel', label: 'Dubbel', factor: 2 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuItem],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', testItem);
    fixture.componentRef.setInput('coffeeSizes', gewoneFormaten);
    fixture.componentRef.setInput('espressoSizes', espressoFormaten);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('herkent koffie aan de categorie', () => {
    expect(component.isKoffie).toBe(true);
  });

  it('herkent gebak aan de categorie', () => {
    fixture.componentRef.setInput('item', {
      ...testItem,
      id: 5,
      name: 'Croissant',
      categorie: Categorie.Gebak,
    });

    expect(component.isKoffie).toBe(false);
  });

  it('toont de gewone formaten voor een koffie', () => {
    expect(component.beschikbareGroottes).toEqual(gewoneFormaten);
  });

  it('toont de espressoformaten wanneer het product een espresso is', () => {
    fixture.componentRef.setInput('item', {
      ...testItem,
      id: 2,
      name: 'Espresso',
      isEspresso: true,
    });

    expect(component.beschikbareGroottes).toEqual(espressoFormaten);
  });

  it('kijkt naar de vlag en niet naar de naam', () => {
    fixture.componentRef.setInput('item', { ...testItem, name: 'Espresso' });

    expect(component.beschikbareGroottes).toEqual(gewoneFormaten);
  });
});