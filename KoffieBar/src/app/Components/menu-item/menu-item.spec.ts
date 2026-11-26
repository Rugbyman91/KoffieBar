import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItem } from './menu-item';
import { MenuOptions } from '../../menu-options';

describe('MenuItem', () => {
  let component: MenuItem;
  let fixture: ComponentFixture<MenuItem>;

  const testItem: MenuOptions = {
    id: 3,
    name: 'Cappuccino',
    description: 'Espresso met warme melk en een dikke schuimlaag',
    allergies: 'melk',
    price: 3,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuItem],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', testItem);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});