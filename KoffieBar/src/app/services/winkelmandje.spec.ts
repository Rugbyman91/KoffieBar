import { TestBed } from '@angular/core/testing';

import { Winkelmandje } from './winkelmandje';

describe('Winkelmandje', () => {
  let service: Winkelmandje;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Winkelmandje);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
