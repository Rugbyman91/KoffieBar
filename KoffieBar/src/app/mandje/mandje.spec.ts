import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mandje } from './mandje';

describe('Mandje', () => {
  let component: Mandje;
  let fixture: ComponentFixture<Mandje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mandje],
    }).compileComponents();

    fixture = TestBed.createComponent(Mandje);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
