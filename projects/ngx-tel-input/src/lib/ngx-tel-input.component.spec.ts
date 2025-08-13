import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxTelInputComponent } from './ngx-tel-input.component';

describe('NgxTelInputComponent', () => {
  let component: NgxTelInputComponent;
  let fixture: ComponentFixture<NgxTelInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxTelInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxTelInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
