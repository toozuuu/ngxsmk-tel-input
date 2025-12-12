/**
 * Test fixtures for ngxsmk-tel-input
 */

import { ComponentFixture } from '@angular/core/testing';
import { CountryCode } from 'libphonenumber-js';
import { NgxsmkTelInputComponent } from '../ngxsmk-tel-input.component';

/**
 * Test data fixtures
 */
export const TEST_PHONE_NUMBERS = {
  valid: {
    US: '+12025551234',
    US_NATIONAL: '2025551234',
    GB: '+442071234567',
    GB_NATIONAL: '02071234567',
    AU: '+61234567890',
    AU_NATIONAL: '0234567890',
    CA: '+14165551234',
    CA_NATIONAL: '4165551234'
  },
  invalid: {
    TOO_SHORT: '123',
    TOO_LONG: '12345678901234567890',
    INVALID_COUNTRY_CODE: '1123456789',
    INVALID_FORMAT: 'abc123def'
  }
};

export const TEST_COUNTRIES: CountryCode[] = ['US', 'GB', 'AU', 'CA', 'DE', 'FR', 'JP', 'CN'];

/**
 * Helper to create a test component fixture
 */
export function createTestComponentFixture<T>(
  fixture: ComponentFixture<T>
): ComponentFixture<T> {
  fixture.detectChanges();
  return fixture;
}

/**
 * Helper to get phone input component from fixture
 */
export function getPhoneInputComponent(
  fixture: ComponentFixture<any>
): NgxsmkTelInputComponent {
  const component = fixture.componentInstance;
  const phoneInput = component.phoneInput || component.telInput;
  if (!phoneInput) {
    throw new Error('Phone input component not found. Use ViewChild with reference name "phoneInput" or "telInput"');
  }
  return phoneInput;
}

/**
 * Helper to set phone input value
 */
export function setPhoneInputValue(
  component: NgxsmkTelInputComponent,
  value: string
): void {
  component.writeValue(value);
}

/**
 * Helper to select country
 */
export function selectCountry(
  component: NgxsmkTelInputComponent,
  country: CountryCode
): void {
  component.selectCountry(country);
}

/**
 * Helper to trigger input event
 */
export function triggerInputEvent(
  fixture: ComponentFixture<any>,
  value: string
): void {
  const input = fixture.nativeElement.querySelector('input[type="tel"]');
  if (input) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }
}

/**
 * Helper to trigger blur event
 */
export function triggerBlurEvent(fixture: ComponentFixture<any>): void {
  const input = fixture.nativeElement.querySelector('input[type="tel"]');
  if (input) {
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }
}

/**
 * Helper to trigger focus event
 */
export function triggerFocusEvent(fixture: ComponentFixture<any>): void {
  const input = fixture.nativeElement.querySelector('input[type="tel"]');
  if (input) {
    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
  }
}

/**
 * Helper to get current input value
 */
export function getInputValue(fixture: ComponentFixture<any>): string {
  const input = fixture.nativeElement.querySelector('input[type="tel"]');
  return input ? input.value : '';
}

/**
 * Helper to check if input is valid
 */
export function isInputValid(component: NgxsmkTelInputComponent): boolean {
  return component.isValid();
}

/**
 * Helper to check if input has errors
 */
export function hasInputErrors(component: NgxsmkTelInputComponent): boolean {
  return component.hasErrors();
}

/**
 * Helper to get validation errors
 */
export function getValidationErrors(component: NgxsmkTelInputComponent): string[] {
  return component.validationStatus().errorKeys;
}

/**
 * Helper to wait for async operations
 */
export function waitForAsync(fn: () => void): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn();
      resolve();
    }, 0);
  });
}

/**
 * Test form control interface
 */
export interface TestFormControl {
  value: string | null;
  setValue: (val: string | null) => void;
  patchValue: (val: string | null) => void;
  reset: (val?: string | null) => void;
}

/**
 * Helper to create test form control
 */
export function createTestFormControl(value: string | null = null): TestFormControl {
  const control: TestFormControl = {
    value,
    setValue: function(val: string | null) {
      control.value = val;
    },
    patchValue: function(val: string | null) {
      control.value = val;
    },
    reset: function(val: string | null = null) {
      control.value = val;
    }
  };
  return control;
}

/**
 * Test scenarios
 */
export const TEST_SCENARIOS = {
  validUSNumber: {
    input: TEST_PHONE_NUMBERS.valid.US_NATIONAL,
    country: 'US' as CountryCode,
    expectedE164: TEST_PHONE_NUMBERS.valid.US,
    expectedValid: true
  },
  validUKNumber: {
    input: TEST_PHONE_NUMBERS.valid.GB_NATIONAL,
    country: 'GB' as CountryCode,
    expectedE164: TEST_PHONE_NUMBERS.valid.GB,
    expectedValid: true
  },
  invalidNumber: {
    input: TEST_PHONE_NUMBERS.invalid.TOO_SHORT,
    country: 'US' as CountryCode,
    expectedE164: null,
    expectedValid: false
  },
  invalidCountryCode: {
    input: TEST_PHONE_NUMBERS.invalid.INVALID_COUNTRY_CODE,
    country: 'US' as CountryCode,
    expectedE164: null,
    expectedValid: false,
    expectedError: 'phoneInvalidCountryCode'
  }
};

