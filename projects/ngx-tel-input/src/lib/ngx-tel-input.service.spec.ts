import { TestBed } from '@angular/core/testing';

import { NgxTelInputService } from './ngx-tel-input.service';

describe('NgxTelInputService', () => {
  let service: NgxTelInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxTelInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
