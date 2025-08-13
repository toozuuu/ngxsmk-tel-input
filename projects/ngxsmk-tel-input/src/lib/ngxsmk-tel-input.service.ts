import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import {
  AsYouType,
  CountryCode,
  parsePhoneNumberFromString,
  PhoneNumber
} from 'libphonenumber-js';

export type E164 = `+${string}`;

export interface ngxsmkTelDefaults {
  /** Default country used when input is not in international form */
  defaultCountry?: CountryCode;
  /** If true, treat input/formatting as national by default */
  nationalMode?: boolean;
}

export const ngxsmk_TEL_DEFAULTS = new InjectionToken<ngxsmkTelDefaults>('ngxsmk_TEL_DEFAULTS');

/** Result of parsing a phone input */
export interface ParsedPhone {
  /** E.164 (+123...) if valid/parsable, else null */
  e164: E164 | null;
  /** National-formatted number (e.g., (415) 555-0123) */
  national?: string;
  /** International formatted number (e.g., +1 415 555 0123) */
  international?: string;
  /** 2-letter ISO country inferred by parser, if any */
  country?: CountryCode;
  /** Whether the number is valid for the country/region */
  isValid: boolean;
  /** Raw libphonenumber-js instance (optional) */
  raw?: PhoneNumber;
}

@Injectable({ providedIn: 'root' })
export class ngxsmkTelInputService {
  private defaults: Required<ngxsmkTelDefaults> = {
    defaultCountry: 'US',
    nationalMode: false
  };

  constructor(@Optional() @Inject(ngxsmk_TEL_DEFAULTS) cfg?: ngxsmkTelDefaults) {
    this.defaults = { ...this.defaults, ...(cfg ?? {}) };
  }

  /** Update defaults at runtime if you need to (multi-tenant apps, theming, etc.) */
  setDefaults(partial: ngxsmkTelDefaults) {
    this.defaults = { ...this.defaults, ...partial };
  }

  getDefaults(): Readonly<Required<ngxsmkTelDefaults>> {
    return this.defaults;
  }

  /** Fast check: '+...' → true-ish shape (not full validation) */
  looksLikeE164(v?: string | null): v is E164 {
    return !!v && /^\+\d{3,}$/.test(v);
  }

  /**
   * Parse any user input into structured data.
   * - If input starts with +, region is inferred from the number.
   * - Else uses provided `country` or the configured default.
   */
  parse(input: string | null | undefined, country?: CountryCode): ParsedPhone {
    const raw = (input ?? '').trim();
    if (!raw) return { e164: null, isValid: false };

    const region = this.looksLikeE164(raw) ? undefined : (country ?? this.defaults.defaultCountry);
    const pn = parsePhoneNumberFromString(raw, region);

    if (!pn) return { e164: null, isValid: false };

    const isValid = pn.isValid();
    return {
      e164: isValid ? (pn.number as E164) : null,
      national: pn.formatNational(),
      international: pn.formatInternational(),
      country: pn.country as CountryCode | undefined,
      isValid,
      raw: pn
    };
  }

  /** Validate a number (raw user input or E.164). Optionally force region. */
  isValid(input: string, country?: CountryCode): boolean {
    return this.parse(input, country).isValid;
  }

  /** Format to E.164 (or null if invalid) */
  toE164(input: string, country?: CountryCode): E164 | null {
    return this.parse(input, country).e164;
  }

  /** Format nicely for display (international vs national) */
  formatDisplay(input: string, opts?: { international?: boolean; country?: CountryCode }): string {
    const { international = !this.defaults.nationalMode, country } = opts ?? {};
    const p = this.parse(input, country);
    if (!p.raw) return input;
    return international ? p.raw.formatInternational() : p.raw.formatNational();
  }

  /** As-you-type formatting for text inputs (pure function) */
  asYouType(nextText: string, country?: CountryCode): string {
    const region = country ?? this.defaults.defaultCountry;
    const ayt = new AsYouType(region);
    return ayt.input(nextText ?? '');
  }

  /** Infer country from E.164 or raw input (best effort) */
  inferCountry(input: string): CountryCode | undefined {
    const p = this.parse(input);
    return p.country;
  }
}
