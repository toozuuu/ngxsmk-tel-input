import { InjectionToken } from '@angular/core';
import { CountryCode, PhoneNumber } from 'libphonenumber-js';
import * as i0 from "@angular/core";
export type E164 = `+${string}`;
export interface ngxsmkTelDefaults {
    /** Default country used when input is not in international form */
    defaultCountry?: CountryCode;
    /** If true, treat input/formatting as national by default */
    nationalMode?: boolean;
}
export declare const ngxsmk_TEL_DEFAULTS: InjectionToken<ngxsmkTelDefaults>;
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
export declare class ngxsmkTelInputService {
    private defaults;
    constructor(cfg?: ngxsmkTelDefaults);
    /** Update defaults at runtime if you need to (multi-tenant apps, theming, etc.) */
    setDefaults(partial: ngxsmkTelDefaults): void;
    getDefaults(): Readonly<Required<ngxsmkTelDefaults>>;
    /** Fast check: '+...' → true-ish shape (not full validation) */
    looksLikeE164(v?: string | null): v is E164;
    /**
     * Parse any user input into structured data.
     * - If input starts with +, region is inferred from the number.
     * - Else uses provided `country` or the configured default.
     */
    parse(input: string | null | undefined, country?: CountryCode): ParsedPhone;
    /** Validate a number (raw user input or E.164). Optionally force region. */
    isValid(input: string, country?: CountryCode): boolean;
    /** Format to E.164 (or null if invalid) */
    toE164(input: string, country?: CountryCode): E164 | null;
    /** Format nicely for display (international vs national) */
    formatDisplay(input: string, opts?: {
        international?: boolean;
        country?: CountryCode;
    }): string;
    /** As-you-type formatting for text inputs (pure function) */
    asYouType(nextText: string, country?: CountryCode): string;
    /** Infer country from E.164 or raw input (best effort) */
    inferCountry(input: string): CountryCode | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<ngxsmkTelInputService, [{ optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ngxsmkTelInputService>;
}
