import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../testing/test-providers';
import { Registreer } from './registreer';

describe('Registreer', () => {
  let component: Registreer;
  let fixture: ComponentFixture<Registreer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registreer],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(Registreer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
