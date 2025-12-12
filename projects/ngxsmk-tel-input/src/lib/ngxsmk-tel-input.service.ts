import { Injectable } from '@angular/core';
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

/**
 * Result of phone number parsing.
 */
export interface ParseResult {
  /** E.164 formatted phone number (e.g., +14155550123) or null if invalid */
  e164: string | null;
  /** National format phone number or null if invalid */
  national: string | null;
  /** Whether the phone number is valid */
  isValid: boolean;
}

/**
 * Enhanced parse result with invalid country code detection.
 */
export interface ParseWithInvalidResult extends ParseResult {
  /** Whether the input appears to be an invalid international number */
  isInvalidInternational: boolean;
}

/**
 * Service for parsing and validating phone numbers using libphonenumber-js.
 * Provides caching for improved performance and enhanced validation features.
 * 
 * @example
 * ```typescript
 * constructor(private telService: NgxsmkTelInputService) {}
 * 
 * validatePhone(input: string, country: CountryCode) {
 *   const result = this.telService.parse(input, country);
 *   return result.isValid;
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class NgxsmkTelInputService {
  private parseCache = new Map<string, ParseResult>();
  private parseWithInvalidCache = new Map<string, ParseWithInvalidResult>();
  private validationCache = new Map<string, boolean>();
  private readonly CACHE_SIZE_LIMIT = 1000;

  /**
   * Parses a phone number string and returns formatted results.
   * Results are cached for performance.
   * 
   * @param input - The phone number string to parse (can include formatting)
   * @param iso2 - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')
   * @returns ParseResult with E.164 format, national format, and validity status
   * 
   * @example
   * ```typescript
   * const result = service.parse('202-555-1234', 'US');
   * // result.e164 = '+12025551234'
   * // result.national = '(202) 555-1234'
   * // result.isValid = true
   * ```
   */
  parse(input: string, iso2: CountryCode): ParseResult {
    const cacheKey = `${input || ''}|${iso2}`;
    
    if (this.parseCache.has(cacheKey)) {
      return this.parseCache.get(cacheKey)!;
    }

    try {
      const phone = parsePhoneNumberFromString(input || '', iso2);
      if (!phone) {
        const result = { e164: null, national: null, isValid: false };
        this.setCacheValue(this.parseCache, cacheKey, result);
        return result;
      }
      
      const isValid = phone.isValid();
      const result = { 
        e164: isValid ? phone.number : null, 
        national: phone.formatNational(), 
        isValid 
      };
      
      this.setCacheValue(this.parseCache, cacheKey, result);
      return result;
    } catch {
      const result = { e164: null, national: null, isValid: false };
      this.setCacheValue(this.parseCache, cacheKey, result);
      return result;
    }
  }

  /**
   * Validates whether a phone number string is valid for the given country.
   * Results are cached for performance.
   * 
   * @param input - The phone number string to validate
   * @param iso2 - ISO 3166-1 alpha-2 country code
   * @returns true if the phone number is valid, false otherwise
   * 
   * @example
   * ```typescript
   * const isValid = service.isValid('202-555-1234', 'US'); // true
   * const isInvalid = service.isValid('123', 'US'); // false
   * ```
   */
  isValid(input: string, iso2: CountryCode): boolean {
    const cacheKey = `${input || ''}|${iso2}`;
    
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    try {
      const phone = parsePhoneNumberFromString(input || '', iso2);
      const result = !!phone && phone.isValid();
      
      this.setCacheValue(this.validationCache, cacheKey, result);
      return result;
    } catch {
      this.setCacheValue(this.validationCache, cacheKey, false);
      return false;
    }
  }

  /**
   * Sets a value in the cache, implementing LRU eviction when cache is full.
   * @param cache - The cache Map to update
   * @param key - The cache key
   * @param value - The value to cache
   */
  private setCacheValue<T>(cache: Map<string, T>, key: string, value: T): void {
    if (cache.size >= this.CACHE_SIZE_LIMIT) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(key, value);
  }

  /**
   * Clears all caches. Useful for memory management or testing.
   */
  clearCache(): void {
    this.parseCache.clear();
    this.parseWithInvalidCache.clear();
    this.validationCache.clear();
  }

  /**
   * Checks if the input appears to be an international number with an invalid country code.
   * This helps detect cases like "1123456789" where "11" is not a valid country code.
   * 
   * @param input - The phone number string to check
   * @returns true if the input appears to be an invalid international number
   * @private
   */
  private isInvalidInternationalNumber(input: string): boolean {
    if (!input || input.length < 3) return false;
    
    const digits = input.replace(/\D/g, '');
    if (digits.length < 3) return false;
    
    for (let i = 1; i <= 3 && i <= digits.length; i++) {
      const potentialCountryCode = digits.substring(0, i);
      const remainingDigits = digits.substring(i);
      
      if (remainingDigits.length >= 3) {
        try {
          const internationalNumber = `+${potentialCountryCode}${remainingDigits}`;
          const phone = parsePhoneNumberFromString(internationalNumber);
          
          if (!phone) {
            if (input.startsWith('+') || (potentialCountryCode.length >= 1 && potentialCountryCode.length <= 3)) {
              return true;
            }
          }
        } catch {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Enhanced parse method that detects invalid international numbers.
   * This is useful for providing better error messages to users.
   * Results are cached for performance.
   * 
   * @param input - The phone number string to parse
   * @param iso2 - ISO 3166-1 alpha-2 country code
   * @returns ParseWithInvalidResult with additional invalid country code detection
   * 
   * @example
   * ```typescript
   * const result = service.parseWithInvalidDetection('1123456789', 'US');
   * // result.isInvalidInternational = true (because "11" is not a valid country code)
   * // result.isValid = false
   * ```
   */
  parseWithInvalidDetection(input: string, iso2: CountryCode): ParseWithInvalidResult {
    const cacheKey = `${input || ''}|${iso2}`;
    
    if (this.parseWithInvalidCache.has(cacheKey)) {
      return this.parseWithInvalidCache.get(cacheKey)!;
    }

    try {
      const phone = parsePhoneNumberFromString(input || '', iso2);
      const isInvalidInternational = this.isInvalidInternationalNumber(input);
      
      if (!phone) {
        const result = { 
          e164: null, 
          national: null, 
          isValid: false,
          isInvalidInternational 
        };
        this.setCacheValue(this.parseWithInvalidCache, cacheKey, result);
        return result;
      }
      
      const isValid = phone.isValid();
      const result = { 
        e164: isValid ? phone.number : null, 
        national: phone.formatNational(), 
        isValid,
        isInvalidInternational 
      };
      
      this.setCacheValue(this.parseWithInvalidCache, cacheKey, result);
      return result;
    } catch {
      const isInvalidInternational = this.isInvalidInternationalNumber(input);
      const result = { 
        e164: null, 
        national: null, 
        isValid: false,
        isInvalidInternational 
      };
      this.setCacheValue(this.parseWithInvalidCache, cacheKey, result);
      return result;
    }
  }
}
