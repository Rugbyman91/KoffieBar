import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../testing/test-providers';
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
