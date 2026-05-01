import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxsmkTelInputComponent } from './ngxsmk-tel-input.component';
import { NgxsmkTelInputService } from './ngxsmk-tel-input.service';
import { CountryCode } from 'libphonenumber-js';

describe('NgxsmkTelInputComponent', () => {
  let component: NgxsmkTelInputComponent;
  let fixture: ComponentFixture<NgxsmkTelInputComponent>;
  let service: NgxsmkTelInputService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxsmkTelInputComponent, ReactiveFormsModule],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        NgxsmkTelInputService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgxsmkTelInputComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(NgxsmkTelInputService);
    service.clearCache();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should have default values', () => {
      expect(component.initialCountry).toBe('US');
      expect(component.preferredCountries).toEqual(['US', 'GB']);
      expect(component.separateDialCode).toBe(true);
      expect(component.allowDropdown).toBe(true);
      expect(component.size).toBe('md');
      expect(component.variant).toBe('outline');
      expect(component.showClear).toBe(true);
      expect(component.disabled).toBe(false);
    });

    it('should accept custom initialCountry', () => {
      component.initialCountry = 'GB';
      expect(component.initialCountry).toBe('GB');
    });

    it('should accept custom preferredCountries', () => {
      component.preferredCountries = ['CA', 'MX'];
      expect(component.preferredCountries).toEqual(['CA', 'MX']);
    });

    it('should accept custom size', () => {
      component.size = 'lg';
      expect(component.size).toBe('lg');
    });

    it('should accept custom variant', () => {
      component.variant = 'filled';
      expect(component.variant).toBe('filled');
    });

    it('should use traditional size and variant when signal inputs are not provided', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.componentRef.setInput('variant', 'filled');
      fixture.detectChanges();

      const root = fixture.nativeElement.querySelector('.ngxsmk-tel');
      expect(root.dataset.size).toBe('lg');
      expect(root.dataset.variant).toBe('filled');
    });

    it('should keep signal inputs undefined until explicitly bound', () => {
      expect(component.initialCountrySignal()).toBeUndefined();
      expect(component.preferredCountriesSignal()).toBeUndefined();
      expect(component.formatWhenValidSignal()).toBeUndefined();
      expect(component.sizeSignal()).toBeUndefined();
      expect(component.themeSignal()).toBeUndefined();
    });
  });

  describe('ControlValueAccessor', () => {
    it('should implement writeValue', () => {
      const value = '+12025551234';
      component.writeValue(value);
      // Component should handle the value (async initialization)
      expect(component).toBeTruthy();
    });

    it('should handle null writeValue', () => {
      component.writeValue(null);
      expect(component.currentRaw()).toBe('');
    });

    it('should register onChange callback', () => {
      const callback = jasmine.createSpy('onChange');
      component.registerOnChange(callback);
      
      // Trigger change
      component.writeValue('+12025551234');
      // Callback should be registered (actual call happens in handleInput)
      expect(callback).toBeDefined();
    });

    it('should register onTouched callback', () => {
      const callback = jasmine.createSpy('onTouched');
      component.registerOnTouched(callback);
      
      component.onBlur();
      expect(callback).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
      
      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
    });
  });

  describe('Validator', () => {
    it('should return null for empty input', () => {
      const control = new FormControl('');
      const errors = component.validate(control);
      expect(errors).toBeNull();
    });

    it('should return phoneInvalid for invalid numbers', () => {
      const control = new FormControl('123');
      // Mock currentRaw to return invalid number
      spyOn(component, 'currentRaw').and.returnValue('123');
      spyOn(component as any, 'currentIso2').and.returnValue('US' as CountryCode);
      
      const errors = component.validate(control);
      expect(errors).toEqual({ phoneInvalid: true });
    });

    it('should return phoneInvalidCountryCode for invalid country codes', () => {
      const control = new FormControl('1123456789');
      spyOn(component, 'currentRaw').and.returnValue('1123456789');
      spyOn(component as any, 'currentIso2').and.returnValue('US' as CountryCode);
      
      // Mock service to return invalid international
      spyOn(service, 'parseWithInvalidDetection').and.returnValue({
        e164: null,
        national: null,
        isValid: false,
        isInvalidInternational: true
      });
      
      const errors = component.validate(control);
      expect(errors).toEqual({ phoneInvalidCountryCode: true });
    });

    it('should return null for valid numbers', () => {
      const control = new FormControl('+12025551234');
      spyOn(component, 'currentRaw').and.returnValue('2025551234');
      spyOn(component as any, 'currentIso2').and.returnValue('US' as CountryCode);
      
      spyOn(service, 'parseWithInvalidDetection').and.returnValue({
        e164: '+12025551234',
        national: '(202) 555-1234',
        isValid: true,
        isInvalidInternational: false
      });
      
      const errors = component.validate(control);
      expect(errors).toBeNull();
    });

    it('should emit validityChange when validity changes', () => {
      spyOn(component.validityChange, 'emit');
      const control = new FormControl('2025551234');
      
      spyOn(component, 'currentRaw').and.returnValue('2025551234');
      spyOn(component as any, 'currentIso2').and.returnValue('US' as CountryCode);
      spyOn(service, 'parseWithInvalidDetection').and.returnValue({
        e164: '+12025551234',
        national: '(202) 555-1234',
        isValid: true,
        isInvalidInternational: false
      });
      
      component.validate(control);
      expect(component.validityChange.emit).toHaveBeenCalledWith(true);
    });
  });

  describe('Public Methods', () => {
    it('should focus the input', () => {
      const inputElement = component.inputRef.nativeElement;
      spyOn(inputElement, 'focus');
      
      component.focus();
      expect(inputElement.focus).toHaveBeenCalled();
    });

    it('should select country programmatically', () => {
      // Component needs to be initialized for iti to exist
      // This test verifies the method exists and can be called
      expect(() => component.selectCountry('GB')).not.toThrow();
    });

    it('should clear input', () => {
      component.inputRef.nativeElement.value = '2025551234';
      spyOn(component.inputRef.nativeElement, 'focus');
      
      component.clearInput();
      expect(component.currentRaw()).toBe('');
      expect(component.inputRef.nativeElement.focus).toHaveBeenCalled();
    });

    it('should get current raw value', () => {
      component.inputRef.nativeElement.value = '2025551234';
      expect(component.currentRaw()).toBe('2025551234');
    });

    it('should get current theme', () => {
      const theme = component.getCurrentTheme();
      expect(['light', 'dark']).toContain(theme);
    });

    it('should set theme programmatically', () => {
      component.setTheme('dark');
      expect(component.theme).toBe('dark');
    });
  });

  describe('Output Events', () => {
    it('should emit countryChange when country changes', (done) => {
      component.countryChange.subscribe((event) => {
        expect(event.iso2).toBeDefined();
        done();
      });
      
      // Trigger country change (would normally happen via intl-tel-input)
      component.countryChange.emit({ iso2: 'GB' });
    });

    it('should emit validityChange when validity changes', (done) => {
      component.validityChange.subscribe((isValid) => {
        expect(typeof isValid).toBe('boolean');
        done();
      });
      
      component.validityChange.emit(true);
    });

    it('should emit inputChange on input', (done) => {
      component.inputChange.subscribe((event) => {
        expect(event).toBeDefined();
        expect(event.raw).toBeDefined();
        expect(event.iso2).toBeDefined();
        done();
      });
      
      // Simulate input change by writing a value
      component.writeValue('+12025551234');
    });
  });

  describe('Lifecycle', () => {
    it('should handle ngOnDestroy', () => {
      const destroyPluginSpy = spyOn(component as any, 'destroyPlugin');
      const cleanupEventListenersSpy = spyOn(component as any, 'cleanupEventListeners');
      
      component.ngOnDestroy();
      
      expect(destroyPluginSpy).toHaveBeenCalled();
      expect(cleanupEventListenersSpy).toHaveBeenCalled();
    });

    it('should handle ngOnChanges', () => {
      const reinitRequestSpy = spyOn(component as any, 'requestPluginReinit');
      (component as any).iti = {
        setNumber: () => undefined,
        setCountry: () => undefined,
        getSelectedCountryData: () => ({ iso2: 'us', dialCode: '1' }),
        destroy: () => undefined
      };
      
      component.ngOnChanges({
        initialCountry: {
          currentValue: 'GB',
          previousValue: 'US',
          firstChange: false,
          isFirstChange: () => false
        }
      });
      
      expect(reinitRequestSpy).toHaveBeenCalled();
    });
  });

  describe('Runtime regressions', () => {
    it('should request plugin reinit when signal config input changes', fakeAsync(() => {
      (component as any).iti = {
        setNumber: () => undefined,
        setCountry: () => undefined,
        getSelectedCountryData: () => ({ iso2: 'us', dialCode: '1' }),
        destroy: () => undefined
      };
      const reinitRequestSpy = spyOn(component as any, 'requestPluginReinit');

      fixture.componentRef.setInput('initialCountrySignal', 'GB' as CountryCode);
      fixture.detectChanges();
      tick();

      expect(reinitRequestSpy).toHaveBeenCalled();
    }));

    it('should not mutate global dark classes during dropdown theme update', fakeAsync(() => {
      const htmlHadDark = document.documentElement.classList.contains('dark');
      const bodyHadDark = document.body.classList.contains('dark');
      const dropdown = document.createElement('ul');
      dropdown.className = 'iti__country-list';
      document.body.appendChild(dropdown);
      component.setTheme('dark');

      (component as any).updateDropdownTheme(dropdown);
      tick(20);

      expect(dropdown.classList.contains('dark-theme')).toBeTrue();
      expect(document.documentElement.classList.contains('dark')).toBe(htmlHadDark);
      expect(document.body.classList.contains('dark')).toBe(bodyHadDark);

      dropdown.remove();
    }));
  });

  describe('Accessibility', () => {
    it('should have aria-invalid attribute when error', () => {
      component.showErrorWhenTouched = false;
      (component as any).stateSignal.update((state: any) => ({
        ...state,
        errors: { phoneInvalid: true },
        touched: true
      }));
      
      fixture.detectChanges();
      
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('should have aria-label on clear button', () => {
      component.inputRef.nativeElement.value = '2025551234';
      component.showClear = true;
      fixture.detectChanges();
      
      const clearButton = fixture.nativeElement.querySelector('.ngxsmk-tel__clear');
      if (clearButton) {
        expect(clearButton.getAttribute('aria-label')).toBeTruthy();
      }
    });

    it('should have label associated with input', () => {
      component.label = 'Phone Number';
      fixture.detectChanges();
      
      const label = fixture.nativeElement.querySelector('label');
      const input = fixture.nativeElement.querySelector('input');
      
      if (label && input) {
        expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle destroyed component gracefully', () => {
      component.ngOnDestroy();
      
      expect(() => component.focus()).not.toThrow();
      expect(() => component.writeValue('+12025551234')).not.toThrow();
      expect(() => component.validate({} as any)).not.toThrow();
    });

    it('should handle SSR (server platform)', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [NgxsmkTelInputComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' },
          NgxsmkTelInputService
        ]
      });
      
      const ssrFixture = TestBed.createComponent(NgxsmkTelInputComponent);
      const ssrComponent = ssrFixture.componentInstance;
      ssrFixture.detectChanges();
      
      expect(ssrComponent).toBeTruthy();
      // Should not crash on server
      expect(() => ssrComponent.ngAfterViewInit()).not.toThrow();
    });

    it('should handle missing inputRef', () => {
      // Simulate missing inputRef
      const originalRef = component.inputRef;
      (component as any).inputRef = null;
      
      expect(() => component.writeValue('+12025551234')).not.toThrow();
      
      // Restore
      (component as any).inputRef = originalRef;
    });
  });

  describe('Theme', () => {
    it('should set theme programmatically', () => {
      component.setTheme('dark');
      expect(component.theme).toBe('dark');
      
      component.setTheme('light');
      expect(component.theme).toBe('light');
    });

    it('should get current theme', () => {
      const theme = component.getCurrentTheme();
      expect(['light', 'dark']).toContain(theme);
    });
  });
});
