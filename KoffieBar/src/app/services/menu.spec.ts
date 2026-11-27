import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MenuService } from './menu';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });

    service = TestBed.inject(MenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
