import { Injectable } from '@angular/core';
import { parsePhoneNumberFromString, type CountryCode, getCountryCallingCode } from 'libphonenumber-js';

@Injectable({ providedIn: 'root' })
export class NgxsmkTelInputService {
  private parseCache = new Map<string, { e164: string | null; national: string | null; isValid: boolean }>();
  private validationCache = new Map<string, boolean>();
  private readonly CACHE_SIZE_LIMIT = 1000;

  parse(input: string, iso2: CountryCode): { e164: string | null; national: string | null; isValid: boolean } {
    const cacheKey = `${input || ''}|${iso2}`;
    
    if (this.parseCache.has(cacheKey)) {
      return this.parseCache.get(cacheKey)!;
    }

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
  }

  isValid(input: string, iso2: CountryCode): boolean {
    const cacheKey = `${input || ''}|${iso2}`;
    
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const phone = parsePhoneNumberFromString(input || '', iso2);
    const result = !!phone && phone.isValid();
    
    this.setCacheValue(this.validationCache, cacheKey, result);
    return result;
  }

  private setCacheValue<T>(cache: Map<string, T>, key: string, value: T): void {
    if (cache.size >= this.CACHE_SIZE_LIMIT) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(key, value);
  }

  clearCache(): void {
    this.parseCache.clear();
    this.validationCache.clear();
  }

  /**
   * Check if the input appears to be an international number with an invalid country code
   * This helps detect cases like "1123456789" where "11" is not a valid country code
   */
  private isInvalidInternationalNumber(input: string): boolean {
    if (!input || input.length < 3) return false;
    
    // Check if input starts with digits that could be a country code
    const digits = input.replace(/\D/g, '');
    if (digits.length < 3) return false;
    
    // Try to extract potential country code (1-3 digits)
    for (let i = 1; i <= 3 && i <= digits.length; i++) {
      const potentialCountryCode = digits.substring(0, i);
      const remainingDigits = digits.substring(i);
      
      // If we have a potential country code and remaining digits
      if (remainingDigits.length >= 3) {
        // Try to parse as international number
        try {
          const internationalNumber = `+${potentialCountryCode}${remainingDigits}`;
          const phone = parsePhoneNumberFromString(internationalNumber);
          
          // If parsing fails, it might be an invalid country code
          if (!phone) {
            // Check if this looks like an attempt at an international number
            // (starts with + or has country code pattern)
            if (input.startsWith('+') || (potentialCountryCode.length >= 1 && potentialCountryCode.length <= 3)) {
              return true;
            }
          }
        } catch {
          // If parsing throws an error, it's likely an invalid country code
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Enhanced parse method that detects invalid international numbers
   */
  parseWithInvalidDetection(input: string, iso2: CountryCode): { e164: string | null; national: string | null; isValid: boolean; isInvalidInternational: boolean } {
    const cacheKey = `${input || ''}|${iso2}`;
    
    if (this.parseCache.has(cacheKey)) {
      const cached = this.parseCache.get(cacheKey)!;
      return {
        ...cached,
        isInvalidInternational: this.isInvalidInternationalNumber(input)
      };
    }

    const phone = parsePhoneNumberFromString(input || '', iso2);
    const isInvalidInternational = this.isInvalidInternationalNumber(input);
    
    if (!phone) {
      const result = { 
        e164: null, 
        national: null, 
        isValid: false,
        isInvalidInternational 
      };
      this.setCacheValue(this.parseCache, cacheKey, { e164: null, national: null, isValid: false });
      return result;
    }
    
    const isValid = phone.isValid();
    const result = { 
      e164: isValid ? phone.number : null, 
      national: phone.formatNational(), 
      isValid,
      isInvalidInternational 
    };
    
    this.setCacheValue(this.parseCache, cacheKey, { e164: result.e164, national: result.national, isValid: result.isValid });
    return result;
  }
}
