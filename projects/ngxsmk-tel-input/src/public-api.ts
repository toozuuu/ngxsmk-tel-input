export { NgxsmkTelInputComponent } from './lib/ngxsmk-tel-input.component';
export { NgxsmkTelInputService } from './lib/ngxsmk-tel-input.service';
export type { ParseResult, ParseWithInvalidResult } from './lib/ngxsmk-tel-input.service';
export { ThemeService } from './lib/theme.service';
export type { IntlTelI18n, CountryMap } from './lib/types';
export { PhoneInputUtils } from './lib/phone-input.utils';
export { 
  createPhoneInputState, 
  createFormattedValueSignal, 
  createValidationStatusSignal, 
  createPhoneMetadataSignal 
} from './lib/signals';
export type { PhoneInputState } from './lib/signals';
export { provideMaterialTheme, MATERIAL_THEME_CONFIG } from './lib/themes/material.theme';
export type { MaterialThemeConfig } from './lib/themes/material.theme';
export { providePrimeNGTheme, PRIMENG_THEME_CONFIG } from './lib/themes/primeng.theme';
export type { PrimeNGThemeConfig } from './lib/themes/primeng.theme';
export { MockNgxsmkTelInputService } from './lib/testing/mock-phone-service';
export { 
  TEST_PHONE_NUMBERS, 
  TEST_COUNTRIES, 
  TEST_SCENARIOS,
  createTestComponentFixture,
  getPhoneInputComponent,
  setPhoneInputValue,
  selectCountry,
  triggerInputEvent,
  triggerBlurEvent,
  triggerFocusEvent,
  getInputValue,
  isInputValid,
  hasInputErrors,
  getValidationErrors
} from './lib/testing/test-fixtures';
export {
  E2E_SELECTORS,
  getPhoneInput,
  typePhoneNumber,
  clearPhoneInput,
  getPhoneInputValue,
  clickCountryDropdown,
  selectCountryFromDropdown,
  clickClearButton,
  getErrorMessage,
  isErrorDisplayed,
  E2E_SCENARIOS
} from './lib/testing/e2e-helpers';
export { NgxsmkTelInputTestingModule } from './lib/testing/testing.module';
export { PhoneIntelligenceService } from './lib/phone-intelligence.service';
export type { CarrierInfo, FormatSuggestion } from './lib/phone-intelligence.service';
export { VerificationService } from './lib/integrations/verification.service';
export {
  TwilioVerificationService,
  provideTwilioVerification
} from './lib/integrations/twilio.service';
export type { TwilioConfig } from './lib/integrations/twilio.service';
export {
  VonageVerificationService,
  provideVonageVerification
} from './lib/integrations/vonage.service';
export type { VonageConfig } from './lib/integrations/vonage.service';
export {
  AwsSnsVerificationService,
  provideAwsSnsVerification
} from './lib/integrations/aws-sns.service';
export type { AwsSnsConfig } from './lib/integrations/aws-sns.service';
export type {
  VerificationRequest,
  VerificationResponse,
  VerificationCheck,
  VerificationCheckResponse
} from './lib/integrations/verification.service';
export {
  isCountryCode,
  isPhoneNumberString,
  isValidParseResult,
  isE164Format,
  isCompleteCarrierInfo,
  isHighConfidenceSuggestion,
  createE164PhoneNumber,
  createNationalPhoneNumber,
  createTypedValidationResult,
  assertCountryCode,
  assertE164Format
} from './lib/types-enhanced';
export type {
  StrictPhoneInputConfig,
  PhoneInputEvent,
  CountryChangeEvent,
  ValidationEvent,
  E164PhoneNumber,
  NationalPhoneNumber,
  TypedValidationResult,
  ValidationError,
  InputSignalType,
  OutputSignalType
} from './lib/types-enhanced';
