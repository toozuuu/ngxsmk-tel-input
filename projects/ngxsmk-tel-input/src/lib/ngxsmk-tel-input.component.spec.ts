import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ngxsmkTelInputComponent } from './ngxsmk-tel-input.component';

describe('ngxsmkTelInputComponent', () => {
  let component: ngxsmkTelInputComponent;
  let fixture: ComponentFixture<ngxsmkTelInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ngxsmkTelInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ngxsmkTelInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
