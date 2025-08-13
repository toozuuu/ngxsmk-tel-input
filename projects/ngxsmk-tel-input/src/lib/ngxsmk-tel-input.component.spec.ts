import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { NgxsmkTelInputComponent } from './ngxsmk-tel-input.component';

describe('NgxsmkTelInputComponent', () => {
  let component: NgxsmkTelInputComponent;
  let fixture: ComponentFixture<NgxsmkTelInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxsmkTelInputComponent],
      // Pretend we're on the server so ngAfterViewInit skips intl-tel-input init
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxsmkTelInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
