/**
 * Enhanced TypeScript types and type guards for ngxsmk-tel-input
 */

import { CountryCode } from 'libphonenumber-js';
import { ParseResult, ParseWithInvalidResult } from './ngxsmk-tel-input.service';
import { CarrierInfo, FormatSuggestion } from './phone-intelligence.service';

/**
 * Type guard to check if a value is a valid CountryCode
 */
export function isCountryCode(value: unknown): value is CountryCode {
  if (typeof value !== 'string') {
    return false;
  }
  
  // Basic validation - ISO 3166-1 alpha-2 codes are 2 uppercase letters
  return /^[A-Z]{2}$/.test(value);
}

/**
 * Type guard to check if a value is a valid phone number string
 */
export function isPhoneNumberString(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  
  // Basic validation - contains digits and optionally + or spaces/dashes
  return /^[\d\s\-+()]+$/.test(value) && value.replace(/\D/g, '').length >= 3;
}

/**
 * Type guard to check if ParseResult is valid
 */
export function isValidParseResult(result: ParseResult | ParseWithInvalidResult): result is ParseResult & { e164: string } {
  return result.isValid === true && result.e164 !== null;
}

/**
 * Type guard to check if value is E.164 format
 */
export function isE164Format(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  
  // E.164 format: + followed by 1-15 digits
  return /^\+[1-9]\d{1,14}$/.test(value);
}

/**
 * Type guard to check if CarrierInfo is complete
 */
export function isCompleteCarrierInfo(info: CarrierInfo | null): info is CarrierInfo {
  return info !== null && info.type !== 'UNKNOWN';
}

/**
 * Type guard to check if FormatSuggestion has high confidence
 */
export function isHighConfidenceSuggestion(suggestion: FormatSuggestion | null): suggestion is FormatSuggestion {
  return suggestion !== null && suggestion.confidence >= 0.7;
}

/**
 * Strict type for phone input configuration
 */
export interface StrictPhoneInputConfig {
  readonly initialCountry: CountryCode | 'auto';
  readonly preferredCountries: readonly CountryCode[];
  readonly onlyCountries?: readonly CountryCode[];
  readonly separateDialCode: boolean;
  readonly allowDropdown: boolean;
  readonly nationalDisplay: 'formatted' | 'digits';
  readonly formatWhenValid: 'off' | 'blur' | 'typing';
  readonly size: 'sm' | 'md' | 'lg';
  readonly variant: 'outline' | 'filled' | 'underline';
  readonly theme: 'light' | 'dark' | 'auto';
  readonly disabled: boolean;
  readonly enableIntelligence: boolean;
  readonly enableFormatSuggestions: boolean;
}

/**
 * Type-safe phone input event
 */
export interface PhoneInputEvent {
  readonly raw: string;
  readonly e164: string | null;
  readonly iso2: CountryCode;
  readonly isValid: boolean;
  readonly timestamp: number;
}

/**
 * Type-safe country change event
 */
export interface CountryChangeEvent {
  readonly iso2: CountryCode;
  readonly previousIso2?: CountryCode;
  readonly timestamp: number;
}

/**
 * Type-safe validation event
 */
export interface ValidationEvent {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly timestamp: number;
}

/**
 * Utility type to extract input signal types
 */
export type InputSignalType<T> = T extends import('@angular/core').InputSignal<infer U> ? U : never;

/**
 * Utility type to extract output signal types
 */
export type OutputSignalType<T> = T extends import('@angular/core').OutputEmitterRef<infer U> ? U : never;

/**
 * Branded type for E.164 phone numbers
 */
export type E164PhoneNumber = string & { readonly __brand: 'E164PhoneNumber' };

/**
 * Create a branded E.164 phone number
 */
export function createE164PhoneNumber(value: string): E164PhoneNumber | null {
  if (isE164Format(value)) {
    return value as E164PhoneNumber;
  }
  return null;
}

/**
 * Branded type for national phone numbers
 */
export type NationalPhoneNumber = string & { readonly __brand: 'NationalPhoneNumber' };

/**
 * Create a branded national phone number
 */
export function createNationalPhoneNumber(value: string, country: CountryCode): NationalPhoneNumber | null {
  if (isPhoneNumberString(value)) {
    return value as NationalPhoneNumber;
  }
  return null;
}

/**
 * Type-safe phone number validation result
 */
export interface TypedValidationResult {
  readonly isValid: boolean;
  readonly e164: E164PhoneNumber | null;
  readonly national: NationalPhoneNumber | null;
  readonly country: CountryCode;
  readonly errors: readonly ValidationError[];
}

/**
 * Validation error with type information
 */
export interface ValidationError {
  readonly code: 'REQUIRED' | 'INVALID' | 'INVALID_COUNTRY_CODE' | 'TOO_SHORT' | 'TOO_LONG';
  readonly message: string;
  readonly field?: string;
}

/**
 * Create a typed validation result
 */
export function createTypedValidationResult(
  parseResult: ParseResult,
  country: CountryCode
): TypedValidationResult {
  const errors: ValidationError[] = [];
  
  if (!parseResult.isValid) {
    if (parseResult.e164 === null) {
      errors.push({
        code: 'INVALID',
        message: 'Invalid phone number format'
      });
    }
  }

  return {
    isValid: parseResult.isValid,
    e164: parseResult.e164 ? (parseResult.e164 as E164PhoneNumber) : null,
    national: parseResult.national ? (parseResult.national as NationalPhoneNumber) : null,
    country,
    errors: errors as readonly ValidationError[]
  };
}

/**
 * Assert that a value is a CountryCode (throws if not)
 */
export function assertCountryCode(value: unknown): asserts value is CountryCode {
  if (!isCountryCode(value)) {
    throw new TypeError(`Expected CountryCode, got ${typeof value}: ${value}`);
  }
}

/**
 * Assert that a value is E.164 format (throws if not)
 */
export function assertE164Format(value: unknown): asserts value is E164PhoneNumber {
  if (!isE164Format(value)) {
    throw new TypeError(`Expected E.164 format phone number, got: ${value}`);
  }
}

