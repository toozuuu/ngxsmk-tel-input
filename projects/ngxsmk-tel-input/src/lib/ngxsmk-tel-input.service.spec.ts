import { TestBed } from '@angular/core/testing';
import { NgxsmkTelInputService } from './ngxsmk-tel-input.service';
import { CountryCode } from 'libphonenumber-js';

describe('NgxsmkTelInputService', () => {
  let service: NgxsmkTelInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxsmkTelInputService);
    // Clear cache before each test for predictable results
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parse', () => {
    it('should parse a valid US phone number', () => {
      const result = service.parse('2025551234', 'US');
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe('+12025551234');
      expect(result.national).toBeTruthy();
    });

    it('should parse a valid UK phone number', () => {
      const result = service.parse('02071234567', 'GB');
      expect(result.isValid).toBe(true);
      expect(result.e164).toBeTruthy();
      expect(result.e164).toContain('+44');
    });

    it('should handle formatted phone numbers', () => {
      const result = service.parse('(202) 555-1234', 'US');
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe('+12025551234');
    });

    it('should return null e164 for invalid numbers', () => {
      const result = service.parse('123', 'US');
      expect(result.isValid).toBe(false);
      expect(result.e164).toBeNull();
    });

    it('should handle empty input', () => {
      const result = service.parse('', 'US');
      expect(result.isValid).toBe(false);
      expect(result.e164).toBeNull();
      expect(result.national).toBeNull();
    });

    it('should cache parse results', () => {
      const input = '2025551234';
      const country: CountryCode = 'US';
      
      const result1 = service.parse(input, country);
      const result2 = service.parse(input, country);
      
      // Should return the same result (cached)
      expect(result1).toBe(result2);
    });

    it('should handle different countries correctly', () => {
      const usResult = service.parse('2025551234', 'US');
      const gbResult = service.parse('2025551234', 'GB');
      
      expect(usResult.isValid).toBe(true);
      expect(gbResult.isValid).toBe(false); // Same digits, different country
    });
  });

  describe('isValid', () => {
    it('should return true for valid phone numbers', () => {
      expect(service.isValid('2025551234', 'US')).toBe(true);
      expect(service.isValid('+12025551234', 'US')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(service.isValid('123', 'US')).toBe(false);
      expect(service.isValid('', 'US')).toBe(false);
    });

    it('should cache validation results', () => {
      const input = '2025551234';
      const country: CountryCode = 'US';
      
      const result1 = service.isValid(input, country);
      const result2 = service.isValid(input, country);
      
      expect(result1).toBe(result2);
    });

    it('should handle international format', () => {
      expect(service.isValid('+442071234567', 'GB')).toBe(true);
      expect(service.isValid('+442071234567', 'US')).toBe(true); // E.164 works for any country
    });
  });

  describe('parseWithInvalidDetection', () => {
    it('should detect invalid country codes like "11"', () => {
      const result = service.parseWithInvalidDetection('1123456789', 'US');
      expect(result.isValid).toBe(false);
      expect(result.e164).toBeNull();
    });

    it('should detect invalid country codes like "99"', () => {
      const result = service.parseWithInvalidDetection('+99123456789', 'US');
      expect(result.isInvalidInternational).toBe(true);
      expect(result.isValid).toBe(false);
    });

    it('should not flag valid numbers as invalid international', () => {
      const result = service.parseWithInvalidDetection('2025551234', 'US');
      expect(result.isInvalidInternational).toBe(false);
      expect(result.isValid).toBe(true);
    });

    it('should handle valid international numbers', () => {
      const result = service.parseWithInvalidDetection('+12025551234', 'US');
      expect(result.isInvalidInternational).toBe(false);
      expect(result.isValid).toBe(true);
    });

    it('should cache results', () => {
      const input = '1123456789';
      const country: CountryCode = 'US';
      
      const result1 = service.parseWithInvalidDetection(input, country);
      const result2 = service.parseWithInvalidDetection(input, country);
      
      expect(result1).toBe(result2);
    });

    it('should handle short inputs', () => {
      const result = service.parseWithInvalidDetection('12', 'US');
      // Short inputs shouldn't trigger invalid international detection
      expect(result.isInvalidInternational).toBe(false);
    });

    // ── Regression tests for multi-digit country codes ────────────────────

    it('[regression] should NOT flag Greece (+30) as invalid international', () => {
      // +30 is the dial code for Greece; +306977443408 is a valid Greek mobile number.
      // The old code incorrectly returned isInvalidInternational=true because it
      // tried prefix "3" (i=1) first, got null, and short-circuited.
      const result = service.parseWithInvalidDetection('+306977443408', 'GR');
      expect(result.isInvalidInternational).toBe(false);
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe('+306977443408');
    });

    it('[regression] should NOT flag France (+33) as invalid international', () => {
      // +33 is the dial code for France
      const result = service.parseWithInvalidDetection('+33612345678', 'FR');
      expect(result.isInvalidInternational).toBe(false);
      expect(result.isValid).toBe(true);
    });

    it('[regression] should NOT flag Germany (+49) as invalid international', () => {
      // +49 is the dial code for Germany
      const result = service.parseWithInvalidDetection('+4915123456789', 'DE');
      expect(result.isInvalidInternational).toBe(false);
    });

    it('[regression] should NOT flag Australia (+61) as invalid international', () => {
      // +61 is the dial code for Australia
      const result = service.parseWithInvalidDetection('+61412345678', 'AU');
      expect(result.isInvalidInternational).toBe(false);
      expect(result.isValid).toBe(true);
    });

    it('[regression] should NOT flag India (+91) as invalid international', () => {
      // +91 is the dial code for India
      const result = service.parseWithInvalidDetection('+919876543210', 'IN');
      expect(result.isInvalidInternational).toBe(false);
      expect(result.isValid).toBe(true);
    });

    it('[regression] national-format inputs should never be flagged as invalid international', () => {
      // Numbers without '+' prefix should never trigger the international check
      const result = service.parseWithInvalidDetection('6977443408', 'GR');
      expect(result.isInvalidInternational).toBe(false);
    });

    it('[regression] should correctly flag truly invalid +XX codes as invalid international', () => {
      // +99 is not a valid country code
      const result = service.parseWithInvalidDetection('+99123456789', 'US');
      expect(result.isInvalidInternational).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should clear all caches', () => {
      // Populate caches
      service.parse('2025551234', 'US');
      service.isValid('2025551234', 'US');
      service.parseWithInvalidDetection('1123456789', 'US');
      
      // Clear caches
      service.clearCache();
      
      // New calls should not use cache
      const result1 = service.parse('2025551234', 'US');
      const result2 = service.parse('2025551234', 'US');
      
      // Results should be equal but not the same object (new cache entries)
      expect(result1.e164).toBe(result2.e164);
      expect(result1.isValid).toBe(result2.isValid);
    });
  });

  describe('cache size limits', () => {
    it('should respect cache size limits', () => {
      // Fill cache beyond limit
      for (let i = 0; i < 1001; i++) {
        service.parse(`202555${i.toString().padStart(4, '0')}`, 'US');
      }
      
      // Cache should still work (oldest entries evicted)
      const result = service.parse('2025551234', 'US');
      expect(result).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters', () => {
      const result = service.parse('+1 (202) 555-1234 ext. 5678', 'US');
      // Should parse the main number even with extension
      expect(result.e164).toBeTruthy();
    });

    it('should handle whitespace', () => {
      const result = service.parse('  202 555 1234  ', 'US');
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe('+12025551234');
    });

    it('should handle null/undefined gracefully', () => {
      // TypeScript should prevent this, but test runtime behavior
      const result1 = service.parse('', 'US');
      expect(result1.isValid).toBe(false);
    });
  });
});
