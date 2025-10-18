import { Injectable } from '@angular/core';
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

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
}
