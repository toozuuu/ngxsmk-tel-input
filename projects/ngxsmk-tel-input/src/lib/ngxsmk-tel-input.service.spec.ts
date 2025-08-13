import { TestBed } from '@angular/core/testing';

import { ngxsmkTelInputService } from './ngxsmk-tel-input.service';

describe('ngxsmkTelInputService', () => {
  let service: ngxsmkTelInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ngxsmkTelInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
