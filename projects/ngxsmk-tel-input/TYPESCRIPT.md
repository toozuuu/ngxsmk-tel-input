# Enhanced TypeScript Support

The `ngxsmk-tel-input` library provides enhanced TypeScript support with strict types, type guards, and better IDE autocomplete.

## Type Guards

### isCountryCode

Check if a value is a valid CountryCode:

```typescript
import { isCountryCode } from 'ngxsmk-tel-input';

function processCountry(value: unknown) {
  if (isCountryCode(value)) {
    // value is now typed as CountryCode
    console.log(value); // TypeScript knows this is CountryCode
  }
}
```

### isPhoneNumberString

Check if a value is a valid phone number string:

```typescript
import { isPhoneNumberString } from 'ngxsmk-tel-input';

function processPhone(value: unknown) {
  if (isPhoneNumberString(value)) {
    // value is now typed as string (phone number)
    console.log(value);
  }
}
```

### isE164Format

Check if a value is in E.164 format:

```typescript
import { isE164Format } from 'ngxsmk-tel-input';

function processE164(value: unknown) {
  if (isE164Format(value)) {
    // value is now typed as string (E.164 format)
    console.log(value); // e.g., "+12025551234"
  }
}
```

### isValidParseResult

Check if a ParseResult is valid:

```typescript
import { isValidParseResult } from 'ngxsmk-tel-input';

const result = phoneService.parse('2025551234', 'US');
if (isValidParseResult(result)) {
  // result.e164 is now guaranteed to be non-null
  console.log(result.e164); // TypeScript knows this is string
}
```

### isCompleteCarrierInfo

Check if CarrierInfo is complete:

```typescript
import { isCompleteCarrierInfo } from 'ngxsmk-tel-input';

const info = intelligenceService.detectCarrierAndType('+12025551234', 'US');
if (isCompleteCarrierInfo(info)) {
  // info is guaranteed to be non-null and have type !== 'UNKNOWN'
  console.log(info.type);
}
```

### isHighConfidenceSuggestion

Check if FormatSuggestion has high confidence:

```typescript
import { isHighConfidenceSuggestion } from 'ngxsmk-tel-input';

const suggestion = intelligenceService.suggestFormatCorrection('123', 'US');
if (isHighConfidenceSuggestion(suggestion)) {
  // suggestion has confidence >= 0.7
  console.log(suggestion.suggested);
}
```

## Branded Types

### E164PhoneNumber

Branded type for E.164 format phone numbers:

```typescript
import { E164PhoneNumber, createE164PhoneNumber } from 'ngxsmk-tel-input';

const e164: E164PhoneNumber | null = createE164PhoneNumber('+12025551234');
if (e164) {
  // e164 is guaranteed to be valid E.164 format
  sendSMS(e164); // Type-safe
}
```

### NationalPhoneNumber

Branded type for national format phone numbers:

```typescript
import { NationalPhoneNumber, createNationalPhoneNumber } from 'ngxsmk-tel-input';

const national: NationalPhoneNumber | null = createNationalPhoneNumber('2025551234', 'US');
if (national) {
  // national is guaranteed to be valid phone number string
  displayPhone(national); // Type-safe
}
```

## Assertion Functions

### assertCountryCode

Assert that a value is a CountryCode (throws if not):

```typescript
import { assertCountryCode } from 'ngxsmk-tel-input';

function processCountry(value: unknown) {
  assertCountryCode(value);
  // value is now typed as CountryCode
  // Throws TypeError if value is not a valid CountryCode
}
```

### assertE164Format

Assert that a value is E.164 format (throws if not):

```typescript
import { assertE164Format } from 'ngxsmk-tel-input';

function processE164(value: unknown) {
  assertE164Format(value);
  // value is now typed as E164PhoneNumber
  // Throws TypeError if value is not E.164 format
}
```

## Typed Events

### PhoneInputEvent

Type-safe phone input event:

```typescript
import { PhoneInputEvent } from 'ngxsmk-tel-input';

function handleInput(event: PhoneInputEvent) {
  // event has strict typing
  console.log(event.raw); // string
  console.log(event.e164); // string | null
  console.log(event.iso2); // CountryCode
  console.log(event.isValid); // boolean
  console.log(event.timestamp); // number
}
```

### CountryChangeEvent

Type-safe country change event:

```typescript
import { CountryChangeEvent } from 'ngxsmk-tel-input';

function handleCountryChange(event: CountryChangeEvent) {
  console.log(event.iso2); // CountryCode
  console.log(event.previousIso2); // CountryCode | undefined
  console.log(event.timestamp); // number
}
```

### ValidationEvent

Type-safe validation event:

```typescript
import { ValidationEvent } from 'ngxsmk-tel-input';

function handleValidation(event: ValidationEvent) {
  console.log(event.isValid); // boolean
  console.log(event.errors); // readonly string[]
  console.log(event.timestamp); // number
}
```

## Typed Validation Result

### TypedValidationResult

Type-safe validation result with branded types:

```typescript
import { createTypedValidationResult, TypedValidationResult } from 'ngxsmk-tel-input';

const parseResult = phoneService.parse('2025551234', 'US');
const typedResult: TypedValidationResult = createTypedValidationResult(parseResult, 'US');

if (typedResult.isValid && typedResult.e164) {
  // typedResult.e164 is E164PhoneNumber (branded type)
  sendSMS(typedResult.e164); // Type-safe
}
```

## Strict Configuration

### StrictPhoneInputConfig

Type-safe configuration with readonly properties:

```typescript
import { StrictPhoneInputConfig } from 'ngxsmk-tel-input';

const config: StrictPhoneInputConfig = {
  initialCountry: 'US',
  preferredCountries: ['US', 'GB'] as const,
  separateDialCode: true,
  allowDropdown: true,
  nationalDisplay: 'formatted',
  formatWhenValid: 'typing',
  size: 'md',
  variant: 'outline',
  theme: 'auto',
  disabled: false,
  enableIntelligence: false,
  enableFormatSuggestions: false
};
```

## Utility Types

### InputSignalType

Extract the type from an input signal:

```typescript
import { InputSignalType } from 'ngxsmk-tel-input';
import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';

type SizeType = InputSignalType<NgxsmkTelInputComponent['sizeSignal']>;
// SizeType is 'sm' | 'md' | 'lg'
```

### OutputSignalType

Extract the type from an output signal:

```typescript
import { OutputSignalType } from 'ngxsmk-tel-input';
import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';

type InputChangeType = OutputSignalType<NgxsmkTelInputComponent['inputChangeSignal']>;
// InputChangeType is { raw: string; e164: string | null; iso2: CountryCode }
```

## Example: Full Type Safety

```typescript
import { 
  NgxsmkTelInputComponent,
  PhoneIntelligenceService,
  isE164Format,
  createE164PhoneNumber,
  assertCountryCode,
  E164PhoneNumber
} from 'ngxsmk-tel-input';

@Component({
  template: `
    <ngxsmk-tel-input
      #phoneInput
      (inputChange)="onInputChange($event)"
    />
  `
})
export class MyComponent {
  @ViewChild('phoneInput') phoneInput!: NgxsmkTelInputComponent;

  onInputChange(event: { raw: string; e164: string | null; iso2: CountryCode }) {
    // Type-safe event handling
    if (event.e164) {
      const e164 = createE164PhoneNumber(event.e164);
      if (e164) {
        this.sendSMS(e164); // Type-safe E164PhoneNumber
      }
    }

    // Type-safe country code
    assertCountryCode(event.iso2);
    this.logCountry(event.iso2); // Guaranteed to be CountryCode
  }

  private sendSMS(phone: E164PhoneNumber) {
    // phone is guaranteed to be valid E.164 format
    console.log('Sending SMS to:', phone);
  }

  private logCountry(country: CountryCode) {
    // country is guaranteed to be valid CountryCode
    console.log('Country:', country);
  }
}
```

## IDE Autocomplete

All types are fully documented with JSDoc comments for better IDE autocomplete:

- Hover over types to see documentation
- Use Ctrl+Space (Cmd+Space on Mac) for autocomplete
- Type guards provide intelligent type narrowing
- Branded types prevent mixing different phone number formats

