import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../testing/test-providers';
import { Klantenportaal } from './klantenportaal';

describe('Klantenportaal', () => {
  let component: Klantenportaal;
  let fixture: ComponentFixture<Klantenportaal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Klantenportaal],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(Klantenportaal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
