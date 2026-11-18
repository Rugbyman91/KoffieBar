import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Klantenportaal } from './klantenportaal';

describe('Klantenportaal', () => {
  let component: Klantenportaal;
  let fixture: ComponentFixture<Klantenportaal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Klantenportaal],
    }).compileComponents();

    fixture = TestBed.createComponent(Klantenportaal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
