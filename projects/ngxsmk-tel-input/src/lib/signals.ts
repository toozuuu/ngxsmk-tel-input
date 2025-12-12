/**
 * Signal-based API utilities for ngxsmk-tel-input.
 * Provides reactive signal-based interfaces for modern Angular applications.
 */

import { signal, computed, Signal, WritableSignal } from '@angular/core';
import { CountryCode } from 'libphonenumber-js';
import { ParseResult } from './ngxsmk-tel-input.service';

/**
 * Signal-based state interface for phone input component.
 */
export interface PhoneInputState {
  /** Raw input value as displayed */
  raw: string;
  /** E.164 formatted phone number or null if invalid */
  e164: string | null;
  /** Current country ISO2 code */
  iso2: CountryCode;
  /** Whether the phone number is valid */
  isValid: boolean;
  /** Whether the input has been touched */
  touched: boolean;
  /** Current validation errors */
  errors: Record<string, boolean> | null;
}

/**
 * Creates a default phone input state signal.
 */
export function createPhoneInputState(): WritableSignal<PhoneInputState> {
  return signal<PhoneInputState>({
    raw: '',
    e164: null,
    iso2: 'US' as CountryCode,
    isValid: false,
    touched: false,
    errors: null
  });
}

/**
 * Computed signal for formatted phone number display.
 */
export function createFormattedValueSignal(
  state: Signal<PhoneInputState>,
  nationalDisplay: Signal<'formatted' | 'digits'>
): Signal<string> {
  return computed(() => {
    const current = state();
    if (!current.raw) return '';
    
    if (nationalDisplay() === 'formatted' && current.e164) {
      // Return formatted national format
      return current.raw;
    }
    
    return current.raw;
  });
}

/**
 * Computed signal for validation status.
 */
export function createValidationStatusSignal(
  state: Signal<PhoneInputState>
): Signal<{
  isValid: boolean;
  isInvalid: boolean;
  hasErrors: boolean;
  errorKeys: string[];
}> {
  return computed(() => {
    const current = state();
    const errors = current.errors || {};
    const errorKeys = Object.keys(errors);
    
    return {
      isValid: current.isValid,
      isInvalid: !current.isValid && current.touched,
      hasErrors: errorKeys.length > 0,
      errorKeys
    };
  });
}

/**
 * Computed signal for phone number metadata.
 */
export function createPhoneMetadataSignal(
  state: Signal<PhoneInputState>
): Signal<{
  countryCode: string;
  dialCode: string | null;
  nationalNumber: string | null;
  internationalFormat: string | null;
}> {
  return computed(() => {
    const current = state();
    
    if (!current.e164) {
      return {
        countryCode: current.iso2,
        dialCode: null,
        nationalNumber: null,
        internationalFormat: null
      };
    }
    
    // Extract dial code from E.164
    const dialCodeMatch = current.e164.match(/^\+\d{1,3}/);
    const dialCode = dialCodeMatch ? dialCodeMatch[0].slice(1) : null;
    
    return {
      countryCode: current.iso2,
      dialCode,
      nationalNumber: current.raw,
      internationalFormat: current.e164
    };
  });
}

