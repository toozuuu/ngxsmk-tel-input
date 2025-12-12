/**
 * Mock phone service for testing
 */

import { Injectable } from '@angular/core';
import { CountryCode } from 'libphonenumber-js';
import { NgxsmkTelInputService, ParseResult, ParseWithInvalidResult } from '../ngxsmk-tel-input.service';

/**
 * Mock implementation of NgxsmkTelInputService for testing
 */
@Injectable()
export class MockNgxsmkTelInputService extends NgxsmkTelInputService {
  private mockValidNumbers: Set<string> = new Set();
  private mockInvalidNumbers: Set<string> = new Set();
  private mockParseResults: Map<string, ParseResult> = new Map();
  private shouldThrowError = false;
  private errorMessage = 'Mock error';

  /**
   * Add a valid phone number for testing
   */
  addValidNumber(number: string, country: CountryCode = 'US'): void {
    this.mockValidNumbers.add(`${number}|${country}`);
  }

  /**
   * Add an invalid phone number for testing
   */
  addInvalidNumber(number: string, country: CountryCode = 'US'): void {
    this.mockInvalidNumbers.add(`${number}|${country}`);
  }

  /**
   * Set a custom parse result for a specific input
   */
  setParseResult(input: string, country: CountryCode, result: ParseResult): void {
    const key = `${input}|${country}`;
    this.mockParseResults.set(key, result);
  }

  /**
   * Configure the service to throw an error
   */
  setShouldThrowError(shouldThrow: boolean, message: string = 'Mock error'): void {
    this.shouldThrowError = shouldThrow;
    this.errorMessage = message;
  }

  /**
   * Clear all mock data
   */
  clearMocks(): void {
    this.mockValidNumbers.clear();
    this.mockInvalidNumbers.clear();
    this.mockParseResults.clear();
    this.shouldThrowError = false;
    this.clearCache();
  }

  override parse(input: string, iso2: CountryCode): ParseResult {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }

    const key = `${input || ''}|${iso2}`;
    
    // Check for custom parse result
    if (this.mockParseResults.has(key)) {
      return this.mockParseResults.get(key)!;
    }

    // Check if it's a known valid/invalid number
    const isValid = this.mockValidNumbers.has(key);
    const isInvalid = this.mockInvalidNumbers.has(key);

    if (isValid) {
      return {
        e164: input.startsWith('+') ? input : `+1${input}`,
        national: input,
        isValid: true
      };
    }

    if (isInvalid) {
      return {
        e164: null,
        national: null,
        isValid: false
      };
    }

    // Fallback to parent implementation
    return super.parse(input, iso2);
  }

  override isValid(input: string, iso2: CountryCode): boolean {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }

    const key = `${input || ''}|${iso2}`;
    
    if (this.mockValidNumbers.has(key)) {
      return true;
    }

    if (this.mockInvalidNumbers.has(key)) {
      return false;
    }

    // Fallback to parent implementation
    return super.isValid(input, iso2);
  }

  override parseWithInvalidDetection(input: string, iso2: CountryCode): ParseWithInvalidResult {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }

    const parseResult = this.parse(input, iso2);
    
    return {
      ...parseResult,
      isInvalidInternational: !parseResult.isValid && input.length > 3
    };
  }
}

