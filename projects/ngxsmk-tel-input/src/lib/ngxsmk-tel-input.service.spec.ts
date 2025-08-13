import { TestBed } from '@angular/core/testing';
import { NgxsmkTelInputService } from './ngxsmk-tel-input.service';

describe('NgxsmkTelInputService', () => {
  let service: NgxsmkTelInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxsmkTelInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
