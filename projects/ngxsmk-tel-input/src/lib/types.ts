import type { CountryCode } from 'libphonenumber-js';

export type CountryMap = Partial<Record<CountryCode, string>>;

export interface IntlTelI18n {
  selectedCountryAriaLabel?: string;
  countryListAriaLabel?: string;
  searchPlaceholder?: string;
  zeroSearchResults?: string;
  noCountrySelected?: string;
}
