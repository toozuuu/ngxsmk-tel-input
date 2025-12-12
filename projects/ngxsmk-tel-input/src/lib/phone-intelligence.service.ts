/**
 * Phone intelligence service for advanced features
 * Provides carrier detection, number type detection, and smart formatting
 */

import { Injectable } from '@angular/core';
import { CountryCode, getNumberType, NumberType, parsePhoneNumberFromString } from 'libphonenumber-js';

export interface CarrierInfo {
  country: CountryCode;
  carrier?: string;
  type: NumberType | 'UNKNOWN';
  isMobile: boolean;
  isLandline: boolean;
  isTollFree: boolean;
  isPremiumRate: boolean;
  isVoip: boolean;
}

export interface FormatSuggestion {
  original: string;
  suggested: string;
  confidence: number;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class PhoneIntelligenceService {
  /**
   * Detect carrier and number type
   */
  detectCarrierAndType(phoneNumber: string, country: CountryCode): CarrierInfo | null {
    try {
      const parsed = parsePhoneNumberFromString(phoneNumber, country);
      if (!parsed || !parsed.isValid()) {
        return null;
      }

      // getNumberType can accept PhoneNumber object directly (it's compatible with ParsedNumber)
      // Use type assertion to work around TypeScript type mismatch
      const numberType = getNumberType(parsed as any);
      const resolvedType: NumberType | 'UNKNOWN' = numberType || 'UNKNOWN';

      return {
        country: parsed.country as CountryCode,
        type: resolvedType,
        isMobile: resolvedType === 'MOBILE' || resolvedType === 'FIXED_LINE_OR_MOBILE',
        isLandline: resolvedType === 'FIXED_LINE' || resolvedType === 'FIXED_LINE_OR_MOBILE',
        isTollFree: resolvedType === 'TOLL_FREE',
        isPremiumRate: resolvedType === 'PREMIUM_RATE',
        isVoip: resolvedType === 'VOIP'
      };
    } catch {
      return null;
    }
  }

  /**
   * Get number type description
   */
  getNumberTypeDescription(type: NumberType | 'UNKNOWN'): string {
    const descriptions: Record<string, string> = {
      'MOBILE': 'Mobile phone',
      'FIXED_LINE': 'Landline',
      'FIXED_LINE_OR_MOBILE': 'Mobile or landline',
      'TOLL_FREE': 'Toll-free number',
      'PREMIUM_RATE': 'Premium rate number',
      'VOIP': 'VoIP number',
      'UNKNOWN': 'Unknown type'
    };

    return descriptions[type as string] || 'Unknown';
  }

  /**
   * Suggest format corrections
   */
  suggestFormatCorrection(input: string, country: CountryCode): FormatSuggestion | null {
    if (!input || input.length < 3) {
      return null;
    }

    const digits = input.replace(/\D/g, '');
    if (digits.length < 3) {
      return null;
    }

    try {
      // Try to parse as-is
      let parsed = parsePhoneNumberFromString(input, country);
      
      if (parsed && parsed.isValid()) {
        return null; // Already valid
      }

      // Common corrections
      const suggestions: FormatSuggestion[] = [];

      // Remove leading zeros
      if (digits.startsWith('0') && digits.length > 1) {
        const withoutZero = digits.substring(1);
        const testParsed = parsePhoneNumberFromString(withoutZero, country);
        if (testParsed && testParsed.isValid()) {
          suggestions.push({
            original: input,
            suggested: testParsed.formatNational(),
            confidence: 0.8,
            reason: 'Removed leading zero'
          });
        }
      }

      // Add country code if missing
      if (!input.startsWith('+') && !input.startsWith('00')) {
        const withPlus = `+${digits}`;
        const testParsed = parsePhoneNumberFromString(withPlus);
        if (testParsed && testParsed.isValid()) {
          suggestions.push({
            original: input,
            suggested: testParsed.formatNational(),
            confidence: 0.7,
            reason: 'Added country code'
          });
        }
      }

      // Fix common formatting issues
      const formatted = this.fixCommonFormattingIssues(input, country);
      if (formatted && formatted !== input) {
        const testParsed = parsePhoneNumberFromString(formatted, country);
        if (testParsed && testParsed.isValid()) {
          suggestions.push({
            original: input,
            suggested: testParsed.formatNational(),
            confidence: 0.6,
            reason: 'Fixed formatting'
          });
        }
      }

      // Return highest confidence suggestion
      if (suggestions.length > 0) {
        return suggestions.sort((a, b) => b.confidence - a.confidence)[0];
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Fix common formatting issues
   */
  private fixCommonFormattingIssues(input: string, country: CountryCode): string | null {
    let fixed = input;

    // Remove spaces and dashes, keep only digits and +
    fixed = fixed.replace(/[^\d+]/g, '');

    // Remove multiple plus signs
    if (fixed.indexOf('+') !== fixed.lastIndexOf('+')) {
      fixed = '+' + fixed.replace(/\+/g, '');
    }

    // Remove leading zeros after country code
    if (fixed.startsWith('+')) {
      const parts = fixed.split('+');
      if (parts.length > 1) {
        const numberPart = parts[1].replace(/^0+/, '');
        fixed = '+' + numberPart;
      }
    }

    return fixed;
  }

  /**
   * Get timezone for phone number
   */
  getTimezone(phoneNumber: string, country: CountryCode): string | null {
    try {
      const parsed = parsePhoneNumberFromString(phoneNumber, country);
      if (!parsed) {
        return null;
      }

      // Basic timezone mapping (simplified)
      const timezoneMap: Record<string, string> = {
        'US': 'America/New_York',
        'GB': 'Europe/London',
        'AU': 'Australia/Sydney',
        'CA': 'America/Toronto',
        'DE': 'Europe/Berlin',
        'FR': 'Europe/Paris',
        'JP': 'Asia/Tokyo',
        'CN': 'Asia/Shanghai',
        'IN': 'Asia/Kolkata',
        'BR': 'America/Sao_Paulo',
        'MX': 'America/Mexico_City',
        'RU': 'Europe/Moscow'
      };

      return timezoneMap[parsed.country || country] || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if number is likely spam (basic heuristic)
   */
  isLikelySpam(phoneNumber: string, country: CountryCode): boolean {
    try {
      const parsed = parsePhoneNumberFromString(phoneNumber, country);
      if (!parsed) {
        return false;
      }

      const nationalNumber = parsed.nationalNumber;

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /^(\d)\1{6,}$/, // Same digit repeated 7+ times
        /^123456789/, // Sequential
        /^987654321/, // Reverse sequential
        /^0000000/, // All zeros
      ];

      return suspiciousPatterns.some(pattern => pattern.test(nationalNumber));
    } catch {
      return false;
    }
  }
}

